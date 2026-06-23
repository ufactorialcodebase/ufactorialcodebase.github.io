// e2e/auth-bootstrap.js
//
// ONE-TIME setup: opens a real (non-headless) Chromium window, lets the
// user log in normally, then saves the resulting auth state (Supabase
// session tokens + cookies) to /tmp/hridai-e2e-state.json.
//
// The password is typed by the user into the Chromium window directly —
// it never goes through env vars, this file, or Claude's transcript.
//
// Subsequent verify.js runs read the saved state and run fully headless,
// no login required.
//
// Usage:
//   node e2e/auth-bootstrap.js
//
// Env (optional):
//   APP_URL          default http://localhost:5174
//   STATE_FILE       default /tmp/hridai-e2e-state.json

const { chromium } = require('playwright')

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'

;(async () => {
  console.log(`Opening ${APP_URL}/signup in Chromium...`)
  console.log('Log in normally. The script will detect /vault and save state.')
  console.log(`State will be written to: ${STATE_FILE}`)
  console.log()

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,900'],
  })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  await page.goto(`${APP_URL}/signup`)

  // Wait for redirect to /vault/* — this fires after a successful login.
  try {
    await page.waitForURL(/\/vault(\/|$)/, { timeout: 5 * 60_000 }) // 5 minutes
  } catch (err) {
    console.error('Timed out waiting for /vault redirect. Did you finish logging in?')
    await browser.close()
    process.exit(2)
  }

  // Give the session a moment to settle (Supabase token persisted, etc.)
  await page.waitForTimeout(1500)

  await ctx.storageState({ path: STATE_FILE })
  console.log(`✓ Auth state saved to ${STATE_FILE}`)
  console.log('You can close the Chromium window now (or it will close itself).')

  await browser.close()
  process.exit(0)
})().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
