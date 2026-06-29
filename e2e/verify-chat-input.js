// e2e/verify-chat-input.js
//
// Verifies two chat-input ergonomics fixes (commit d55c772):
//   1. Long messages scroll inside the textarea (overflow-y-auto + maxHeight 150px)
//   2. Textarea refocuses automatically when the AI finishes responding
//
// Uses the same auth state + dev server setup as verify.js. Sends ONE real
// chat turn against the live LLM, so expect a few cents of cost per run.
//
// Usage:
//   node e2e/verify-chat-input.js
//
// Env (optional):
//   APP_URL       default http://localhost:5174
//   STATE_FILE    default /tmp/hridai-e2e-state.json
//   OUT_DIR       default /tmp/hridai-e2e
//   RESPONSE_TIMEOUT_MS   default 90000 (max wait for AI to finish)

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'
const OUT_DIR = process.env.OUT_DIR || '/tmp/hridai-e2e'
const RESPONSE_TIMEOUT_MS = Number(process.env.RESPONSE_TIMEOUT_MS || 90_000)

if (!fs.existsSync(STATE_FILE)) {
  console.error(`Auth state not found at ${STATE_FILE}. Run e2e/auth-bootstrap.js first.`)
  process.exit(1)
}
fs.mkdirSync(OUT_DIR, { recursive: true })

const LONG_MESSAGE = [
  'This is a deliberately long message used to verify the chat-input scrollbar.',
  'Line two. The textarea is capped at maxHeight 150px, so once enough lines',
  'have been typed the content should exceed clientHeight and the inner',
  'scrollbar should engage instead of the content being clipped.',
  'Line four — adding more lines so the content reliably overflows on every viewport.',
  'Line five.',
  'Line six.',
  'Line seven.',
  'Line eight — well past the cap by now.',
].join('\n')

function fail(msg) {
  console.error(`✗ FAIL: ${msg}`)
  process.exitCode = 1
}

function pass(msg) {
  console.log(`✓ PASS: ${msg}`)
}

;(async () => {
  console.log(`Verifying chat input fixes at ${APP_URL}/vault/chat`)
  console.log(`Screenshots → ${OUT_DIR}/`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1440, height: 900 },
  })

  // Match verify.js: flag on + beta modal dismissed.
  await ctx.addInitScript(() => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    localStorage.setItem('hridai_beta_acknowledged', 'true')
  })

  const page = await ctx.newPage()
  const report = { url: APP_URL, started_at: new Date().toISOString(), checks: {} }

  try {
    await page.goto(`${APP_URL}/vault/chat`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForSelector('textarea', { timeout: 15_000 })
    await page.waitForTimeout(1_500)  // let Chat hydrate / fetch initial state

    const textarea = page.locator('textarea').first()

    // -------- Check 1: scrollbar inside textarea --------
    console.log('\n[1/2] Scrollbar inside textarea')
    await textarea.click()
    await textarea.fill(LONG_MESSAGE)
    await page.waitForTimeout(300)  // let auto-resize useEffect settle

    const sizing = await page.evaluate(() => {
      const ta = document.querySelector('textarea')
      const cs = window.getComputedStyle(ta)
      return {
        scrollHeight: ta.scrollHeight,
        clientHeight: ta.clientHeight,
        overflowY: cs.overflowY,
        maxHeight: cs.maxHeight,
        valueLines: ta.value.split('\n').length,
      }
    })
    report.checks.scrollbar = sizing
    console.log(`    valueLines=${sizing.valueLines}  scrollHeight=${sizing.scrollHeight}  clientHeight=${sizing.clientHeight}  overflowY=${sizing.overflowY}  maxHeight=${sizing.maxHeight}`)

    if (sizing.overflowY === 'auto' || sizing.overflowY === 'scroll') {
      pass(`overflow-y is "${sizing.overflowY}" (was "hidden" before fix)`)
    } else {
      fail(`overflow-y is "${sizing.overflowY}", expected "auto" or "scroll"`)
    }

    if (sizing.scrollHeight > sizing.clientHeight) {
      pass(`content overflows: scrollHeight (${sizing.scrollHeight}) > clientHeight (${sizing.clientHeight})`)
    } else {
      fail(`content does not overflow: scrollHeight (${sizing.scrollHeight}) <= clientHeight (${sizing.clientHeight}) — message may be too short`)
    }

    if (sizing.maxHeight === '150px') {
      pass(`maxHeight is 150px (cap intact)`)
    } else {
      fail(`maxHeight is "${sizing.maxHeight}", expected "150px"`)
    }

    await page.screenshot({ path: path.join(OUT_DIR, 'chat-input-scrollbar.png'), fullPage: false })

    // -------- Check 2: refocus after AI response --------
    console.log('\n[2/2] Auto-refocus after AI response')

    // Clear textarea, send a short message via Enter so focus starts on the
    // textarea. The disabled prop will flip true (loading) then false (done) —
    // the useEffect should refocus on the true→false transition.
    await textarea.fill('')
    await textarea.type('Reply with one short word.')

    // Confirm focus is on textarea before sending
    const focusedBeforeSend = await page.evaluate(() => document.activeElement?.tagName)
    console.log(`    focused before send: ${focusedBeforeSend}`)

    await textarea.press('Enter')

    // Wait for AI response to complete. The Send button shows Loader2
    // (animate-spin) while MessageInput's `disabled` prop is true; when
    // disabled flips back to false, the spinner disappears.
    console.log(`    waiting for AI response (timeout ${RESPONSE_TIMEOUT_MS}ms)...`)
    const t0 = Date.now()

    // First wait for the spinner to APPEAR (proves disabled flipped true and the
    // request is in flight). Then wait for it to disappear.
    try {
      await page.waitForSelector('button[type="submit"] .animate-spin', { timeout: 10_000 })
      console.log(`    spinner appeared (request in flight) +${Date.now() - t0}ms`)
    } catch {
      console.log(`    WARNING: spinner never appeared within 10s — message may have failed to send`)
    }

    await page.waitForFunction(
      () => !document.querySelector('button[type="submit"] .animate-spin'),
      { timeout: RESPONSE_TIMEOUT_MS },
    )
    const responseMs = Date.now() - t0
    console.log(`    response complete (+${responseMs}ms)`)

    // Brief settle for the auto-focus useEffect to run on the disabled-prop flip.
    await page.waitForTimeout(400)

    const focusInfo = await page.evaluate(() => {
      const ta = document.querySelector('textarea')
      const active = document.activeElement
      return {
        activeTag: active?.tagName || null,
        activeIsTextarea: active === ta,
        textareaDisabled: ta.disabled,
        textareaValue: ta.value,
      }
    })
    report.checks.refocus = { ...focusInfo, response_ms: responseMs }
    console.log(`    activeTag=${focusInfo.activeTag}  activeIsTextarea=${focusInfo.activeIsTextarea}  textareaDisabled=${focusInfo.textareaDisabled}`)

    if (focusInfo.activeIsTextarea) {
      pass('textarea refocused after AI response')
    } else {
      fail(`textarea NOT refocused (activeElement: ${focusInfo.activeTag})`)
    }

    if (focusInfo.textareaDisabled) {
      fail('textarea is still disabled after response — disabled prop may not have flipped back')
    }

    await page.screenshot({ path: path.join(OUT_DIR, 'chat-input-refocus.png'), fullPage: false })
  } catch (err) {
    report.fatal = String(err)
    console.error(`\nFATAL: ${err.message}`)
    process.exitCode = 1
  } finally {
    await browser.close()
  }

  report.finished_at = new Date().toISOString()
  report.exit_code = process.exitCode || 0
  const reportPath = path.join(OUT_DIR, 'report-chat-input.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\nReport: ${reportPath}`)
  console.log(`Exit code: ${report.exit_code}`)
})().catch((err) => {
  console.error('Probe failed:', err)
  process.exit(1)
})
