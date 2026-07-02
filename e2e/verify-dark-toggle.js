// e2e/verify-dark-toggle.js
//
// Diagnostic: what actually happens when the user clicks the Dark mode
// toggle in Settings, with the vault_redesign flag ON.
//
// Captures three states — initial, after first click, after second click —
// each time reading the four independent signals that should stay in sync:
//   - localStorage['hridai-theme']
//   - <html>.classList.contains('dark')
//   - VaultLayout wrapper class (vault-theme vs vault-theme-warm)
//   - Toggle knob aria-checked
//
// If these disagree we have a state-sync bug (my hypothesis: useTheme
// dispatches its same-tab storage event before the localStorage-write
// useEffect fires, so other useTheme instances read the stale value).

import { chromium } from 'playwright'
import fs from 'fs'

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'

if (!fs.existsSync(STATE_FILE)) {
  console.error(`Auth state not found at ${STATE_FILE}. Run e2e/auth-bootstrap.js first.`)
  process.exit(1)
}

async function snapshot(page, label) {
  const s = await page.evaluate(() => {
    const layoutEl = document.querySelector('[class*="vault-theme"]')
    const layoutClass = layoutEl?.className.match(/vault-theme(?:-warm)?/)?.[0] || null
    const toggleBtn = document.querySelector('button[role="switch"][aria-label="Dark mode"]')
    // Body element read out of the current theme's --bg-primary so we can see
    // what the browser is actually painting behind everything.
    const bgVar = layoutEl ? window.getComputedStyle(layoutEl).backgroundColor : null
    return {
      localStorage_theme: localStorage.getItem('hridai-theme'),
      html_hasDarkClass: document.documentElement.classList.contains('dark'),
      layoutClass,
      toggle_ariaChecked: toggleBtn?.getAttribute('aria-checked') || null,
      layout_bg_computed: bgVar,
    }
  })
  console.log(`\n[${label}]`)
  console.log(`  localStorage.hridai-theme  = ${s.localStorage_theme}`)
  console.log(`  html.classList has .dark   = ${s.html_hasDarkClass}`)
  console.log(`  layout class               = ${s.layoutClass}`)
  console.log(`  toggle aria-checked        = ${s.toggle_ariaChecked}`)
  console.log(`  layout computed bg         = ${s.layout_bg_computed}`)
  return s
}

;(async () => {
  console.log(`Diagnosing dark toggle at ${APP_URL}/vault/profile (flag ON)`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1440, height: 900 },
  })
  await ctx.addInitScript(() => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    localStorage.setItem('hridai_beta_acknowledged', 'true')
    localStorage.setItem('hridai-theme', 'light')  // force known baseline
  })

  const page = await ctx.newPage()
  await page.goto(`${APP_URL}/vault/profile`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.waitForSelector('button[role="switch"][aria-label="Dark mode"]', { timeout: 15_000 })
  await page.waitForTimeout(1_500)

  const s0 = await snapshot(page, 'INITIAL (light, flag on)')
  await page.screenshot({ path: '/tmp/hridai-e2e/dark-toggle-0-initial.png', fullPage: false })

  // Click 1: light -> dark
  await page.click('button[role="switch"][aria-label="Dark mode"]')
  await page.waitForTimeout(800)
  const s1 = await snapshot(page, 'AFTER 1st CLICK (expected: dark)')
  await page.screenshot({ path: '/tmp/hridai-e2e/dark-toggle-1-after-click.png', fullPage: false })

  // Click 2: dark -> light
  await page.click('button[role="switch"][aria-label="Dark mode"]')
  await page.waitForTimeout(800)
  const s2 = await snapshot(page, 'AFTER 2nd CLICK (expected: light again)')
  await page.screenshot({ path: '/tmp/hridai-e2e/dark-toggle-2-back.png', fullPage: false })

  // Consistency check: after each click, all four signals must agree on the same theme.
  function coherent(s, expected /* 'dark' | 'light' */) {
    const wantsDark = expected === 'dark'
    const results = {
      localStorage_matches: s.localStorage_theme === expected,
      htmlClass_matches: s.html_hasDarkClass === wantsDark,
      // With flag on: dark => vault-theme; light => vault-theme-warm
      layoutClass_matches: wantsDark ? s.layoutClass === 'vault-theme' : s.layoutClass === 'vault-theme-warm',
      toggle_matches: (s.toggle_ariaChecked === 'true') === wantsDark,
    }
    const allOk = Object.values(results).every(Boolean)
    console.log(`  coherent with "${expected}"? ${allOk ? '✓ YES' : '✗ NO ' + JSON.stringify(results)}`)
    return allOk
  }

  console.log('\n=== Coherence ===')
  const ok0 = coherent(s0, 'light')
  const ok1 = coherent(s1, 'dark')
  const ok2 = coherent(s2, 'light')

  await browser.close()
  const anyFail = !(ok0 && ok1 && ok2)
  console.log(`\nDiagnosis: ${anyFail ? 'INCOHERENT — signals disagree, sync bug confirmed' : 'coherent, no bug'}`)
  process.exit(anyFail ? 1 : 0)
})().catch((err) => {
  console.error('Probe failed:', err)
  process.exit(1)
})
