/**
 * Onboarding shows ONCE per browser — not on every login.
 *
 * Confirms the localStorage gating semantics end-to-end:
 *   1. Fresh signup → beta notice + tour + spotlights appear, get
 *      completed/skipped.
 *   2. Sign off, sign back IN (same browser) → NOTHING re-appears.
 *   3. Same account in a FRESH browser context (new-device analog) →
 *      the tour shows once more; spotlights correctly stay hidden
 *      (plain login doesn't seed vault_redesign — they belong to the
 *      redesigned rail).
 *
 * Runtime requirements: same as onboarding-flow.spec.js.
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const ACCESS_CODE = process.env.E2E_ACCESS_CODE || 'E2E-BASELINE-SIGNUP'

const RUN_ID = Date.now()
const EMAIL = `e2e.once.${RUN_ID}@e2e.ufactorial.com`
const PASSWORD = `E2eOnce!${RUN_ID}`

async function expectNoOnboarding(page) {
  await page.waitForTimeout(1_500) // spotlight first-measure delay is 350ms
  await expect(page.getByText('HridAI is in beta')).toHaveCount(0)
  await expect(page.getByTestId('onboarding-tour')).toHaveCount(0)
  await expect(page.getByTestId('spotlight-tour')).toHaveCount(0)
}

async function signIn(page) {
  await page.goto('/signup')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.fill('#login-email', EMAIL)
  await page.fill('#login-password', PASSWORD)
  await page.locator('form').getByRole('button', { name: /Sign in/ }).click()
  await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })
}

test.describe.serial('Onboarding appears once per browser, not per login', () => {
  test.beforeAll(() => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set').toBeTruthy()
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
  })

  test('first signup shows everything; re-login in the same browser shows nothing', async ({ page }) => {
    // ── Fresh signup: full onboarding fires ──
    await page.goto('/signup')
    await page.fill('#access-code', ACCESS_CODE)
    const validateResponse = page.waitForResponse(
      (r) => r.url().includes('/auth/validate') && r.request().method() === 'POST', { timeout: 10_000 }
    )
    await page.fill('#signup-email', EMAIL)
    await validateResponse
    await page.fill('#signup-password', PASSWORD)
    await page.locator('input[type="checkbox"]').nth(0).check()
    await page.locator('input[type="checkbox"]').nth(1).check()
    await page.locator('form').getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })

    await page.getByRole('button', { name: 'Got it' }).click()
    await expect(page.getByText('Welcome to your HridAI')).toBeVisible()
    await page.getByRole('button', { name: 'Skip tour' }).click()
    // Spotlights chain next (desktop + redesign flag seeded at signup)
    await expect(page.getByText('This is your chat.')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Skip tour' }).click()
    await expect(page.getByTestId('spotlight-tour')).toHaveCount(0)

    // ── Sign off, sign back in — same browser, flags persist ──
    await page.getByRole('button', { name: /Sign off/ }).click()
    await page.waitForURL(/\/signup/, { timeout: 15_000 })
    await signIn(page)
    await expectNoOnboarding(page)

    // Belt: a hard reload right after login also shows nothing
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectNoOnboarding(page)
  })

  test('same account, fresh browser (new device): tour shows once, spotlights stay hidden', async ({ page }) => {
    // This test gets a brand-new context (empty localStorage) — the
    // per-browser analog of logging in on a second device.
    await signIn(page)
    await expect(page.getByText('HridAI is in beta')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Got it' }).click()
    await expect(page.getByText('Welcome to your HridAI')).toBeVisible()
    await page.getByRole('button', { name: 'Skip tour' }).click()
    // Plain login does NOT seed vault_redesign → v1 rail → spotlights
    // must not fire (their anchors don't exist there).
    await page.waitForTimeout(1_500)
    await expect(page.getByTestId('spotlight-tour')).toHaveCount(0)
  })
})
