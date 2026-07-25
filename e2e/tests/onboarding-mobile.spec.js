/**
 * Mobile vault navigation: cluster bottom nav (Chat / Memories / Notebook /
 * World), cluster sheets, distinct context-panel icon, and the settings
 * screen's back-to-chat button. Fresh signup per run (same rationale +
 * runtime requirements as onboarding-flow.spec.js).
 */

import { test, expect } from '@playwright/test'

test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 390, height: 844 },
})

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const ACCESS_CODE = process.env.E2E_ACCESS_CODE || 'E2E-BASELINE-SIGNUP'

const RUN_ID = Date.now()
const EMAIL = `e2e.mobile.${RUN_ID}@e2e.ufactorial.com`
const PASSWORD = `E2eMobile!${RUN_ID}`

const SHOT_DIR = 'e2e/screenshots'

test.describe.serial('Mobile: cluster nav + top bar', () => {
  test.beforeAll(() => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set (SUPABASE_KEY from backend .env.test)').toBeTruthy()
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
  })

  test('bottom-nav clusters, sheets, and settings back button', async ({ page }) => {
    // ── Fresh signup ──
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

    // ── Dismiss beta notice + welcome tour; spotlights must NOT run on mobile ──
    await page.getByRole('button', { name: 'Got it' }).click()
    await expect(page.getByText('Welcome to your HridAI')).toBeVisible()
    await page.getByRole('button', { name: 'Skip tour' }).click()
    await page.waitForTimeout(600)
    await expect(page.getByTestId('spotlight-tour')).toHaveCount(0)

    // ── Bottom nav: 4 clusters, no "More" ──
    const nav = page.getByRole('navigation', { name: 'Bottom navigation' })
    for (const label of ['Chat', 'Memories', 'Notebook', 'World']) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible()
    }
    await expect(nav.getByText('More')).toHaveCount(0)
    await page.screenshot({ path: `${SHOT_DIR}/mob-01-bottom-nav.png` })

    // ── Memories sheet: Self / Network / Topics (no Threads anywhere) ──
    await nav.getByText('Memories', { exact: true }).click()
    for (const label of ['Self', 'Network', 'Topics']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
    await expect(page.getByText('Threads')).toHaveCount(0)
    await page.waitForTimeout(400) // slide-up animation settles
    await page.screenshot({ path: `${SHOT_DIR}/mob-02-memories-sheet.png` })

    // Tapping an item navigates and closes the sheet
    await page.getByText('Topics', { exact: true }).click()
    await page.waitForURL(/\/vault\/topics/)
    await expect(page.getByTestId('tab-hint-topics')).toBeVisible()

    // ── Notebook sheet: Dates / Todos / Lists / Artifacts ──
    await nav.getByText('Notebook', { exact: true }).click()
    for (const label of ['Dates', 'Todos', 'Lists', 'Artifacts']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
    await page.waitForTimeout(400) // slide-up animation settles
    await page.screenshot({ path: `${SHOT_DIR}/mob-03-notebook-sheet.png` })
    await page.getByText('Todos', { exact: true }).click()
    await page.waitForURL(/\/vault\/todos/)

    // ── Top bar: context toggle only on chat, and not a brain clash ──
    await nav.getByText('Chat', { exact: true }).click()
    await page.waitForURL(/\/vault\/chat/)
    await expect(page.getByLabel('Toggle context panel')).toBeVisible()

    // ── Settings: gear opens profile; gear is replaced by back-to-chat ──
    const topBar = page.getByTestId('mobile-top-bar')
    await topBar.getByLabel('Settings').click()
    await page.waitForURL(/\/vault\/profile/)
    await expect(topBar.getByLabel('Settings')).toHaveCount(0)
    const back = topBar.getByLabel('Back to chat')
    await expect(back).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/mob-04-profile-back.png` })
    await back.click()
    await page.waitForURL(/\/vault\/chat/)
  })
})
