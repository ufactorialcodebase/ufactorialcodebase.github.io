// e2e/verify-daily-limit.js
//
// Headless verification of the daily-usage-limit UX (ISS-214).
//
// Assumes:
//   - Backend running on :8000 with SUPABASE_ENV=test COST_CEILING_ENABLED=true
//     DAILY_COST_CEILING_USD=0.00 (every user is instantly over-limit)
//   - Frontend running on :5174 pointed at test Supabase
//   - Saved auth state at /tmp/hridai-e2e-state.json (via auth-bootstrap.js)
//
// Writes screenshots + a JSON report to /tmp/hridai-e2e-daily/.

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'
const OUT_DIR = process.env.OUT_DIR || '/tmp/hridai-e2e-daily'
const DAILY_LIMIT_KEY = 'hridai.dailyLimitResetsAt'

fs.mkdirSync(OUT_DIR, { recursive: true })

const report = { steps: [], errors: [] }

function log(msg) {
  console.log(msg)
  report.steps.push({ ts: new Date().toISOString(), msg })
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  log(`  screenshot → ${file}`)
}

async function extractCard(page) {
  // The DailyLimitCard has role="status" aria-live="polite".
  const cards = await page.locator('[role="status"][aria-live="polite"]').all()
  const results = []
  for (const c of cards) {
    const text = (await c.innerText()).trim()
    if (text) results.push(text)
  }
  return results
}

async function assertBlocked(page, label) {
  const cardTexts = await extractCard(page)
  const composerDisabled = await page.locator('textarea').first().isDisabled().catch(() => null)
  const composerValue = await page.locator('textarea').first().inputValue().catch(() => null)
  const sendDisabled = await page.locator('button[type="submit"]').first().isDisabled().catch(() => null)
  const footerText = await page.locator('form').last().locator('span:has-text("Daily limit")').first().innerText().catch(() => null)

  const summary = {
    label,
    cardTexts,
    composerDisabled,
    composerValue,
    sendDisabled,
    footerText,
  }
  log(`  ${label}: ` + JSON.stringify(summary, null, 2).replace(/\n/g, '\n  '))
  return summary
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1280, height: 900 },
  })
  const page = await ctx.newPage()

  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const txt = m.text()
    // Chromium logs every failed fetch — the 429s in this test are expected.
    // Filter them out so `errors` only surfaces real JS failures.
    if (/Failed to load resource.*429/i.test(txt)) return
    report.errors.push(`console.error: ${txt}`)
  })
  page.on('pageerror', (e) => report.errors.push(`pageerror: ${e.message}`))

  // First-time modals ("HridAI is in beta", cookie banners, etc.) cover the
  // DailyLimitCard visually — dismiss any that appear before we screenshot.
  async function dismissModals() {
    for (const label of ['Got it', 'Accept', 'Continue', 'Dismiss']) {
      const btn = page.getByRole('button', { name: label })
      if (await btn.count().then((n) => n > 0).catch(() => false)) {
        await btn.first().click().catch(() => {})
        await page.waitForTimeout(400)
      }
    }
  }

  try {
    // -----------------------------------------------------------------
    // 1. Greeting-blocked (fresh page load with backend at ceiling=0.00)
    // -----------------------------------------------------------------
    log('Step 1 — Fresh load of /vault/chat with ceiling=0.00 → expect greeting-blocked empty-state card')
    await page.goto(`${APP_URL}/vault/chat`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500) // let greeting fetch land + hook activate
    await dismissModals()
    const step1 = await assertBlocked(page, 'step1_greeting_blocked')
    await shot(page, '01_greeting_blocked')

    // Verify localStorage got set
    const stored1 = await page.evaluate((k) => localStorage.getItem(k), DAILY_LIMIT_KEY)
    log(`  localStorage[${DAILY_LIMIT_KEY}] = ${stored1}`)
    step1.localStorage = stored1

    // -----------------------------------------------------------------
    // 2. Vault surfaces unaffected — navigate to another vault page
    // -----------------------------------------------------------------
    log('Step 2 — Navigate to /vault/memories (or /vault/entities) → expect it to render normally, no block')
    // Try a few common vault routes to find one that exists
    const otherRoutes = ['/vault/memories', '/vault/self', '/vault/entities', '/vault/topics']
    let landed = null
    for (const r of otherRoutes) {
      await page.goto(`${APP_URL}${r}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1500)
      if (!page.url().includes('/signup') && !page.url().includes('/404')) {
        landed = r
        break
      }
    }
    log(`  landed on: ${landed || page.url()}`)
    const otherCard = await extractCard(page)
    log(`  status regions on ${landed}: ${JSON.stringify(otherCard)}`)
    await shot(page, '02_other_vault_page')

    // -----------------------------------------------------------------
    // 3. Return to chat — block should still be there (from localStorage hydrate)
    // -----------------------------------------------------------------
    log('Step 3 — Back to /vault/chat → block persists via localStorage hydration (no new network call needed)')
    await page.goto(`${APP_URL}/vault/chat`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2500)
    await dismissModals()
    const step3 = await assertBlocked(page, 'step3_persisted_block')
    await shot(page, '03_persisted_block')

    // -----------------------------------------------------------------
    // 4. Countdown format sanity — parse the footer text
    // -----------------------------------------------------------------
    log('Step 4 — Countdown format check: extract Xh Ym / Ym / <1m from composer footer')
    const footer = step3.footerText || ''
    const countdownRe = /Daily limit reached — resets in (\d+h \d+m|\d+m|<1m)/
    const m = footer.match(countdownRe)
    log(`  footer = "${footer}" — countdown match: ${m ? m[1] : 'NO MATCH'}`)
    if (!m) report.errors.push(`countdown format did not match: "${footer}"`)

    // -----------------------------------------------------------------
    // 5. Past-date localStorage → mount-hydrate should auto-clear
    // -----------------------------------------------------------------
    log('Step 5 — Set stored resetsAt to a PAST time → reload → hook should clear, greeting refetched (which will 429 again → re-block)')
    await page.evaluate((k) => {
      localStorage.setItem(k, new Date(Date.now() - 60_000).toISOString())
    }, DAILY_LIMIT_KEY)
    const beforeReload = await page.evaluate((k) => localStorage.getItem(k), DAILY_LIMIT_KEY)
    log(`  stored before reload: ${beforeReload}`)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500)
    await dismissModals()
    const afterReload = await page.evaluate((k) => localStorage.getItem(k), DAILY_LIMIT_KEY)
    log(`  stored after reload: ${afterReload}`)
    // Expected: past date cleared, then greeting re-fetch 429'd → new future date stored
    const step5 = await assertBlocked(page, 'step5_after_past_expiry')
    await shot(page, '04_after_past_expiry_reblocked')

    // -----------------------------------------------------------------
    // 6. Near-future countdown → wait for auto-clear tick
    // -----------------------------------------------------------------
    log('Step 6 — Set stored resetsAt to ~10s in future → wait 20s → countdown tick auto-clears + fires onReset')
    await page.evaluate((k) => {
      localStorage.setItem(k, new Date(Date.now() + 10_000).toISOString())
    }, DAILY_LIMIT_KEY)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    await dismissModals()
    const beforeExpiry = await assertBlocked(page, 'step6a_before_expiry')
    await shot(page, '05_before_countdown_expiry')

    // wait 22s — 15s hook tick will fire, clear, and onReset re-fetches greeting.
    // With backend still at ceiling=0.00 that re-fetch 429s, restoring the block.
    log('  waiting 22s for the 15s tick to fire and countdown to expire...')
    await page.waitForTimeout(22_000)
    const afterExpiry = await assertBlocked(page, 'step6b_after_expiry')
    await shot(page, '06_after_countdown_expiry')

    // -----------------------------------------------------------------
    // Done
    // -----------------------------------------------------------------
    report.summary = {
      step1_localStorage_written: Boolean(step1.localStorage),
      step1_composer_disabled: step1.composerDisabled === true,
      step1_card_matches: step1.cardTexts.some((t) => /Daily limit|usage limit|Resets in/.test(t)),
      step3_persisted_on_navigate: step3.cardTexts.some((t) => /usage limit|Resets in/.test(t)),
      step4_countdown_format_ok: Boolean(m),
      step5_reblocked_after_past_expiry: step5.cardTexts.some((t) => /usage limit|Resets in/.test(t)),
      step6_reblocked_after_natural_expiry: afterExpiry.cardTexts.some((t) => /usage limit|Resets in/.test(t)),
    }
  } catch (err) {
    report.errors.push(`fatal: ${err.stack || err.message}`)
    log(`FATAL: ${err.message}`)
    await shot(page, 'FATAL')
  } finally {
    await browser.close()
    const reportPath = path.join(OUT_DIR, 'report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`\nreport → ${reportPath}`)
    log(`errors: ${report.errors.length}`)
    process.exit(report.errors.length ? 1 : 0)
  }
})()
