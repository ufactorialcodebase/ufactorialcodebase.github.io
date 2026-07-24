/**
 * Onboarding UI end-to-end: fresh signup → BetaWelcome → OnboardingTour
 * (2 panes) → SpotlightTour (4 steps) → TabHint on first tab visit.
 *
 * Runs as a genuinely NEW user (fresh signup per run) because the entire
 * feature is gated on first-visit localStorage state that the shared e2e
 * auth profile has long since accumulated.
 *
 * Runtime requirements (same as baseline-signup-flow.spec.js):
 *   - frontend dev server on http://localhost:5173
 *   - backend on http://localhost:8000 with SUPABASE_ENV=test
 *   - E2E_SUPABASE_SERVICE_KEY = SUPABASE_KEY from backend .env.test
 *
 * Safety: hard-guarded to the TEST Supabase project ref.
 */

import { test, expect } from '@playwright/test'

// Fresh, unauthenticated browser state — never the shared signed-in profile.
test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const ACCESS_CODE = process.env.E2E_ACCESS_CODE || 'E2E-BASELINE-SIGNUP'

const RUN_ID = Date.now()
const EMAIL = `e2e.onboarding.${RUN_ID}@e2e.ufactorial.com`
const PASSWORD = `E2eOnboarding!${RUN_ID}`

const SHOT_DIR = 'e2e/screenshots'

function adminHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function ensureAccessCode(request) {
  const q = `${SUPABASE_URL}/rest/v1/demo_access_codes?code=eq.${ACCESS_CODE}&select=code,use_count,max_uses,is_active`
  const existing = await request.get(q, { headers: adminHeaders() })
  expect(existing.ok()).toBeTruthy()
  const rows = await existing.json()
  if (rows.length > 0) {
    expect(rows[0].is_active).toBeTruthy()
    expect(rows[0].use_count).toBeLessThan(rows[0].max_uses)
    return
  }
  const insert = await request.post(`${SUPABASE_URL}/rest/v1/demo_access_codes`, {
    headers: adminHeaders(),
    data: {
      code: ACCESS_CODE,
      mode: 'unified',
      max_uses: 500,
      use_count: 0,
      is_active: true,
      notes: '{"cohort_name":"E2E-BASELINE","source":"e2e","description":"e2e signup-flow tests (test project only)"}',
    },
  })
  expect(insert.ok()).toBeTruthy()
}

/** Assert the spotlight hole is ringed around the given anchor (±6px pad). */
async function expectHoleOnAnchor(page, anchorName) {
  const anchorBox = await page.locator(`[data-tour-anchor="${anchorName}"]`).boundingBox()
  await expect(async () => {
    const holeBox = await page.getByTestId('spotlight-hole').boundingBox()
    expect(Math.abs(holeBox.y - (anchorBox.y - 5))).toBeLessThan(3)
    expect(Math.abs(holeBox.x - (anchorBox.x - 5))).toBeLessThan(3)
  }).toPass({ timeout: 5_000 })
}

test.describe.serial('Onboarding: tour + spotlights + tab hints for a fresh signup', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set (SUPABASE_KEY from backend .env.test)').toBeTruthy()
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
    await ensureAccessCode(request)
  })

  test('full new-user onboarding chain', async ({ page }) => {
    // ── Signup as a brand-new user ──
    await page.goto('/signup')
    await page.fill('#access-code', ACCESS_CODE)
    const validateResponse = page.waitForResponse(
      (resp) => resp.url().includes('/auth/validate') && resp.request().method() === 'POST',
      { timeout: 10_000 }
    )
    await page.fill('#signup-email', EMAIL)
    await validateResponse
    await page.fill('#signup-password', PASSWORD)
    await page.locator('input[type="checkbox"]').nth(0).check()
    await page.locator('input[type="checkbox"]').nth(1).check()
    await page.locator('form').getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })

    // Signup seeds vault_redesign → warm light theme + v2 rail
    await expect(page.locator('.vault-theme-warm')).toBeVisible({ timeout: 15_000 })

    // ── 1. Beta notice sits on top; dismiss it ──
    await expect(page.getByText('HridAI is in beta')).toBeVisible({ timeout: 15_000 })
    await page.screenshot({ path: `${SHOT_DIR}/onb-01-beta-welcome.png` })
    await page.getByRole('button', { name: 'Got it' }).click()

    // ── 2. Welcome tour pane 1 ──
    await expect(page.getByText('Welcome to your HridAI')).toBeVisible()
    await expect(page.getByText('1 of 2')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/onb-02-tour-pane1.png` })
    await page.getByRole('button', { name: "See what's inside →" }).click()

    // ── 3. Welcome tour pane 2 ──
    await expect(page.getByText('Everything gets organized here')).toBeVisible()
    await expect(page.getByTestId('onboarding-tour').getByText('Notebook', { exact: true })).toBeVisible()
    await expect(page.getByText('2 of 2')).toBeVisible()
    // Pagination dots must track the pane (dot 2 active = accent color)
    const dot1Style = await page.getByLabel('Go to pane 1').getAttribute('style')
    const dot2Style = await page.getByLabel('Go to pane 2').getAttribute('style')
    console.log(`[dots pane2] dot1=${dot1Style} | dot2=${dot2Style}`)
    expect(dot2Style).toContain('accent-warm')
    expect(dot1Style).not.toContain('accent-warm')
    await page.screenshot({ path: `${SHOT_DIR}/onb-03-tour-pane2.png` })
    await page.getByRole('button', { name: "Let's start →" }).click()

    // ── 4. Spotlight step 1: chat composer ──
    await expect(page.getByText('This is your chat.')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('spotlight-hole')).toBeVisible()
    // The page dim must actually paint (box-shadow-based dims silently fail
    // in Chromium — assert the top dim rect has real size and color).
    await expect(page.getByTestId('spotlight-dim')).toHaveCSS('background-color', 'rgba(43, 33, 26, 0.72)')
    const dimBox = await page.getByTestId('spotlight-dim').boundingBox()
    expect(dimBox.height).toBeGreaterThan(100)
    await expectHoleOnAnchor(page, 'composer')
    await page.screenshot({ path: `${SHOT_DIR}/onb-04-spotlight-composer.png` })
    await page.getByRole('button', { name: 'Next →' }).click()

    // ── 5. Spotlight step 2: world ──
    await expect(page.getByText('Your world, visualized.')).toBeVisible()
    await expectHoleOnAnchor(page, 'world')
    await page.screenshot({ path: `${SHOT_DIR}/onb-05-spotlight-world.png` })
    await page.getByRole('button', { name: 'Next →' }).click()

    // ── 6. Spotlight step 3: memory cluster (Self tile rows) ──
    await expect(page.getByText('Everything I remember about your world.')).toBeVisible()
    await expect(page.getByText('Location · San Francisco, CA')).toBeVisible()
    await expect(page.getByText('Health · Running weekly, sleep 7 hrs')).toBeVisible()
    await expectHoleOnAnchor(page, 'memory')
    await page.screenshot({ path: `${SHOT_DIR}/onb-06-spotlight-memory.png` })
    await page.getByRole('button', { name: 'Next →' }).click()

    // ── 7. Spotlight step 4: notebook cluster ──
    await expect(page.getByText('The things I keep for you.')).toBeVisible()
    await expect(page.getByText(/You can directly create, edit, or delete them in the Notebook/)).toBeVisible()
    await expectHoleOnAnchor(page, 'notebook')
    await page.screenshot({ path: `${SHOT_DIR}/onb-07-spotlight-notebook.png` })
    await page.getByRole('button', { name: "Let's start →" }).click()

    // Tour complete — overlays gone, flags set
    await expect(page.getByTestId('spotlight-tour')).toHaveCount(0)
    const flags = await page.evaluate(() => ({
      onboarding: localStorage.getItem('hridai_onboarding_complete'),
      spotlight: localStorage.getItem('hridai_spotlight_tour_complete'),
    }))
    expect(flags.onboarding).toBe('true')
    expect(flags.spotlight).toBe('true')

    // ── 8. First visit to Network tab → TabHint (empty variant) ──
    await page.goto('/vault/people')
    const hint = page.getByTestId('tab-hint-people')
    await expect(hint).toBeVisible({ timeout: 10_000 })
    await expect(hint.getByText("Everyone we've talked about lives here.")).toBeVisible()
    await page.waitForTimeout(600) // fade-in completes
    await page.screenshot({ path: `${SHOT_DIR}/onb-08-tabhint-people.png` })

    // Dismiss → persists across reload
    await hint.getByRole('button', { name: 'Dismiss hint' }).click()
    await expect(page.getByTestId('tab-hint-people')).toHaveCount(0)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    await expect(page.getByTestId('tab-hint-people')).toHaveCount(0)

    // Reloading chat never re-shows tour or spotlights
    await page.goto('/vault/chat')
    await page.waitForTimeout(1200)
    await expect(page.getByTestId('onboarding-tour')).toHaveCount(0)
    await expect(page.getByTestId('spotlight-tour')).toHaveCount(0)
  })
})
