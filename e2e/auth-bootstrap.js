// e2e/auth-bootstrap.js
//
// One command, two modes:
//
//   1. SILENT REFRESH (first attempt, fully headless)
//      If /tmp/hridai-e2e-state.json already exists, try to use it. Supabase
//      JS auto-refreshes the access token using the saved refresh_token as the
//      page hydrates. If that lands us on /vault/*, we re-save the (now
//      refreshed) state and exit — no UI, no password.
//
//   2. INTERACTIVE LOGIN (fallback)
//      If no state exists, or the refresh_token is itself expired/revoked,
//      fall back to opening a real Chromium window for the user to log in
//      normally. Same as the original behavior — password stays between user
//      and browser, never touches env vars or transcripts.
//
// Re-run this script anytime your verify.js calls start failing with
// auth/redirect issues. Refresh wins when it can; you only do the manual
// login when the refresh_token has actually expired.
//
// Usage:
//   node e2e/auth-bootstrap.js
//
// Env (optional):
//   APP_URL          default http://localhost:5174
//   STATE_FILE       default /tmp/hridai-e2e-state.json
//   FORCE_INTERACTIVE  set to 1 to skip silent refresh and always show window

import { chromium } from 'playwright'
import fs from 'fs'

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'
const FORCE_INTERACTIVE = process.env.FORCE_INTERACTIVE === '1'

async function trySilentRefresh() {
  if (FORCE_INTERACTIVE) return false
  if (!fs.existsSync(STATE_FILE)) {
    console.log('No existing state file — going straight to interactive login.')
    return false
  }
  console.log('Existing state found — attempting silent refresh first...')

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ storageState: STATE_FILE, viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  try {
    await page.goto(`${APP_URL}/vault/chat`, { waitUntil: 'domcontentloaded', timeout: 15_000 })
    // Give the Supabase SDK time to read localStorage and auto-refresh the
    // access_token, plus the router time to either confirm /vault/* or
    // redirect to /signup.
    await page.waitForTimeout(3_500)
    const finalUrl = page.url()
    if (finalUrl.includes('/vault/')) {
      // Auth survived (refreshed or still valid). Re-save state so any
      // freshly-issued tokens land on disk for the next run.
      await ctx.storageState({ path: STATE_FILE })
      console.log(`✓ Silent refresh succeeded — state re-saved to ${STATE_FILE}`)
      await browser.close()
      return true
    }
    console.log(`Silent refresh did not land on /vault (got ${finalUrl}); falling back to interactive login.`)
    await browser.close()
    return false
  } catch (err) {
    console.log(`Silent refresh errored: ${err.message.split('\n')[0]}; falling back to interactive login.`)
    await browser.close().catch(() => {})
    return false
  }
}

async function interactiveLogin() {
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

  try {
    await page.waitForURL(/\/vault(\/|$)/, { timeout: 5 * 60_000 }) // 5 minutes
  } catch (err) {
    console.error('Timed out waiting for /vault redirect. Did you finish logging in?')
    await browser.close()
    process.exit(2)
  }

  // Let Supabase session settle.
  await page.waitForTimeout(1500)

  await ctx.storageState({ path: STATE_FILE })
  console.log(`✓ Auth state saved to ${STATE_FILE}`)
  console.log('You can close the Chromium window now (or it will close itself).')

  await browser.close()
}

;(async () => {
  const refreshed = await trySilentRefresh()
  if (!refreshed) {
    await interactiveLogin()
  }
  process.exit(0)
})().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
