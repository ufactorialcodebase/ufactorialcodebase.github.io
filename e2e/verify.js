// e2e/verify.js
//
// Headless visual verification of the Vault redesign. Reads the saved auth
// state from /tmp/hridai-e2e-state.json (run auth-bootstrap.js once first)
// and drives Chromium through key surfaces with the vault_redesign flag
// toggled on, saving full-page screenshots + relevant DOM-text to
// /tmp/hridai-e2e/.
//
// Usage:
//   node e2e/verify.js                  # flag ON (default)
//   FLAG=off node e2e/verify.js         # flag OFF (baseline / regression check)
//
// Env (optional):
//   APP_URL      default http://localhost:5174
//   STATE_FILE   default /tmp/hridai-e2e-state.json
//   OUT_DIR      default /tmp/hridai-e2e
//   FLAG         on | off  (default on)

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'
const OUT_DIR = process.env.OUT_DIR || '/tmp/hridai-e2e'
const FLAG_ON = (process.env.FLAG || 'on').toLowerCase() === 'on'

if (!fs.existsSync(STATE_FILE)) {
  console.error(`Auth state not found at ${STATE_FILE}.`)
  console.error('Run e2e/auth-bootstrap.js first to log in once.')
  process.exit(1)
}
fs.mkdirSync(OUT_DIR, { recursive: true })

const SURFACES = [
  { key: 'chat', path: '/vault/chat', waitForSelector: 'main' },
  { key: 'self', path: '/vault/self', waitForSelector: 'main' },
  { key: 'people', path: '/vault/people', waitForSelector: 'main' },
  { key: 'topics', path: '/vault/topics', waitForSelector: 'main' },
  { key: 'profile-experiments', path: '/vault/profile', waitForSelector: 'main' },
]

function safeText(el) {
  return el ? el.textContent?.trim() : null
}

;(async () => {
  const tag = FLAG_ON ? 'flag-on' : 'flag-off'
  console.log(`Verifying with vault_redesign ${tag.toUpperCase()}...`)
  console.log(`Screenshots → ${OUT_DIR}/`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1440, height: 900 },
  })

  // Inject flag state + dismiss any one-shot modals BEFORE any page navigation,
  // on every new page. Dismissing BetaWelcome (key 'hridai_beta_acknowledged')
  // is necessary or it overlays every Vault surface and our probes just read
  // the modal text.
  await ctx.addInitScript((flagOn) => {
    if (flagOn) {
      localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    } else {
      localStorage.removeItem('hridai_features')
    }
    localStorage.setItem('hridai_beta_acknowledged', 'true')
  }, FLAG_ON)

  const page = await ctx.newPage()
  const report = { tag, app_url: APP_URL, surfaces: {} }

  for (const s of SURFACES) {
    const url = APP_URL + s.path
    console.log(`  → ${url}`)
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await page.waitForSelector(s.waitForSelector, { timeout: 10_000 })
      // Let the page hydrate + counts/data settle
      await page.waitForTimeout(2_000)
      const shotPath = path.join(OUT_DIR, `${s.key}-${tag}.png`)
      await page.screenshot({ path: shotPath, fullPage: false })

      // Extract a few high-signal DOM bits for cheap text assertions
      const probe = await page.evaluate(() => {
        const get = (sel) => document.querySelector(sel)?.textContent?.trim() || null
        const all = (sel) => Array.from(document.querySelectorAll(sel)).map(el => el.textContent?.trim()).filter(Boolean)
        const layoutClasses = document.querySelector('[class*="vault-theme"]')?.className || null
        return {
          welcomeStrip: get('section[aria-label="Welcome"]'),
          h1: get('h1') || get('h2'),
          railTabs: all('nav button[aria-label], nav a[aria-label]').slice(0, 12),
          bodyText: (document.body.innerText || '').slice(0, 400),
          themeClass: layoutClasses,
          url: location.pathname,
        }
      })
      report.surfaces[s.key] = { ok: true, screenshot: shotPath, probe }
    } catch (err) {
      report.surfaces[s.key] = { ok: false, error: String(err) }
      console.error(`    ✗ ${s.key}: ${err.message}`)
    }
  }

  await browser.close()

  const reportPath = path.join(OUT_DIR, `report-${tag}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log()
  console.log(`✓ Report: ${reportPath}`)
  for (const [k, v] of Object.entries(report.surfaces)) {
    if (!v.ok) { console.log(`  ✗ ${k}: ${v.error.split('\n')[0]}`); continue }
    const w = v.probe.welcomeStrip ? `welcome="${v.probe.welcomeStrip.slice(0, 80)}…"` : 'no-welcome'
    const t = (v.probe.themeClass || '').includes('vault-theme-warm') ? 'warm' : 'dark'
    console.log(`  ✓ ${k}: theme=${t}  h1="${(v.probe.h1 || '').slice(0, 40)}"  ${w}`)
  }
})().catch((err) => {
  console.error('Verify failed:', err)
  process.exit(1)
})
