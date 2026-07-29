/**
 * Mobile vault navigation: cluster bottom nav (Chat / Memories / Notebook /
 * World), cluster sheets, distinct context-panel icon, and the settings
 * screen's back-to-chat button. Fresh signup per run (same rationale +
 * runtime requirements as onboarding-flow.spec.js).
 */

import { test, expect } from '@playwright/test'
import { signupViaUI } from './_helpers.js'

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

/** Assert the spotlight hole rings the given anchor; :visible picks the
 * mobile bottom-nav candidate over the hidden desktop-rail one. */
async function expectHoleOnAnchor(page, anchorName) {
  const anchorBox = await page.locator(`[data-tour-anchor="${anchorName}"]:visible`).boundingBox()
  await expect(async () => {
    const holeBox = await page.getByTestId('spotlight-hole').boundingBox()
    expect(Math.abs(holeBox.y - (anchorBox.y - 5))).toBeLessThan(3)
    expect(Math.abs(holeBox.x - (anchorBox.x - 5))).toBeLessThan(3)
  }).toPass({ timeout: 5_000 })
}

test.describe.serial('Mobile: cluster nav + top bar', () => {
  test.beforeAll(() => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set (SUPABASE_KEY from backend .env.test)').toBeTruthy()
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
  })

  test('bottom-nav clusters, sheets, and settings back button', async ({ page }) => {
    // ── Fresh signup (code-first flow) ──
    await signupViaUI(page, { code: ACCESS_CODE, email: EMAIL, password: PASSWORD })
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })

    // ── Dismiss beta notice + welcome tour ──
    await page.getByRole('button', { name: 'Got it' }).click()
    await expect(page.getByText('Welcome to your HridAI')).toBeVisible()
    await page.getByRole('button', { name: 'Skip tour' }).click()

    // ── Spotlights run on mobile too, ringing the bottom-nav clusters ──
    await expect(page.getByText('This is your chat.')).toBeVisible({ timeout: 10_000 })
    await expectHoleOnAnchor(page, 'composer')
    await page.screenshot({ path: `${SHOT_DIR}/mob-06-spotlight-composer.png` })
    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Your world, visualized.')).toBeVisible()
    await expectHoleOnAnchor(page, 'world')
    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('Everything I remember about your world.')).toBeVisible()
    await expectHoleOnAnchor(page, 'memory')
    // Tallest card must sit fully inside the viewport (bottom-anchored
    // cards cap their height to the space above the anchor and scroll
    // internally — regression: the card top used to slide off-screen).
    const card = page.getByText('Everything I remember about your world.')
      .locator('xpath=ancestor::div[contains(@class,"fixed")]').last()
    const cardBox = await card.boundingBox()
    expect(cardBox.y).toBeGreaterThanOrEqual(0)
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(845)
    await page.screenshot({ path: `${SHOT_DIR}/mob-07-spotlight-memories.png` })
    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText('The things I keep for you.')).toBeVisible()
    await expectHoleOnAnchor(page, 'notebook')
    await page.getByRole('button', { name: "Let's start →" }).click()
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

    // Context panel drops down from the top on mobile (full width, top ≈ 0)
    await page.getByLabel('Toggle context panel').click()
    const panel = page.getByTestId('context-panel')
    await expect(panel).toBeVisible()
    const panelBox = await panel.boundingBox()
    expect(panelBox.y).toBeLessThan(2)
    expect(panelBox.width).toBeGreaterThan(380) // full 390px viewport width
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${SHOT_DIR}/mob-05-context-dropdown.png` })
    await page.getByLabel('Close context panel').click()
    await expect(panel).toHaveCount(0)

    // ── Settings: gear opens profile; gear is replaced by back-to-chat ──
    const topBar = page.getByTestId('mobile-top-bar')
    await topBar.getByLabel('Settings').click()
    await page.waitForURL(/\/vault\/profile/)
    await expect(topBar.getByLabel('Settings')).toHaveCount(0)
    const back = topBar.getByLabel('Back to chat')
    await expect(back).toBeVisible()
    // The page's own "Back to chat" is desktop-only — exactly one back
    // control on the mobile settings screen.
    await expect(page.getByText('Back to chat', { exact: true })).toBeHidden()
    await page.screenshot({ path: `${SHOT_DIR}/mob-04-profile-back.png` })
    await back.click()
    await page.waitForURL(/\/vault\/chat/)
  })
})
