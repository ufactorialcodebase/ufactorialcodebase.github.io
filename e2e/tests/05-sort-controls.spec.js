// Item 5: Entities + Topics grids get a Sort chip strip. Topics have both
// Frequency (default) and Recency because `/vault/topics` returns both
// `mention_count` and `last_mentioned`. Entities get Recency only because
// `/vault/entities` returns raw kg_entities rows — no counts yet. That gap
// is filed as ISS-230; when it lands, add Frequency to ENTITY_SORT_OPTIONS.
//
// A dedicated beforeAll turn seeds the test user with a few entities +
// triggers session-end persistence so the sort chip actually mounts (the
// grids skip the SortToggle when the tab renders its empty state).
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

async function sendChatMessage(page, message) {
  const composer = page.locator('textarea').first()
  await composer.click()
  await composer.fill(message)
  await composer.press('Enter')
  await page.waitForSelector('text=/\\d+(\\.\\d+)?s response/', { timeout: 90_000 })
}

test.describe('Item 5 — sort controls', () => {
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await gotoVault(page, '/vault/chat')
    await waitForChatReady(page)
    // Two short seed turns naming distinct entities so `memory_store_entity`
    // fires and creates a couple of kg_entities rows.
    await sendChatMessage(page, 'Quick seed: my cousin Emily lives in Denver and works at Google.')
    await sendChatMessage(page, 'Another: my colleague Marco is based in Berlin at Spotify.')
    // Trigger session-end so PGBuilder creates topic rows too. Reset button
    // calls endSession server-side.
    const resetBtn = page.getByTitle('Reset conversation')
    if (await resetBtn.isVisible().catch(() => false)) {
      await resetBtn.click()
    }
    await ctx.close()
  })

  test('Topics tab exposes Frequency (default) and Recency sort chips, order changes on click', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/topics')
    // Wait for either the sort toggle (data path) or the empty-state text
    // to land — Playwright's `.or()` supports the mixed CSS+text locator.
    await page.locator('[data-testid="sort-toggle"]')
      .or(page.getByText('No topics tracked yet'))
      .first().waitFor({ timeout: 30_000 })

    const sortToggle = page.locator('[data-testid="sort-toggle"]').first()
    if (!(await sortToggle.isVisible().catch(() => false))) {
      test.skip(true, 'seed did not produce topics (async persistence) — SortToggle skipped')
      return
    }

    const freqBtn = sortToggle.locator('button[data-sort="frequency"]')
    const recBtn = sortToggle.locator('button[data-sort="recency"]')
    await expect(freqBtn).toBeVisible()
    await expect(recBtn).toBeVisible()
    await expect(freqBtn).toHaveClass(/font-medium/)
    await expect(recBtn).not.toHaveClass(/font-medium/)

    await recBtn.click()
    await expect(recBtn).toHaveClass(/font-medium/)
    await expect(freqBtn).not.toHaveClass(/font-medium/)

    await page.screenshot({ path: 'e2e/screenshots/05-topics-sort.png', fullPage: false })
  })

  test('People tab exposes Recency sort chip (Frequency deferred to ISS-230)', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/people')
    await page.locator('[data-testid="sort-toggle"]')
      .or(page.getByText('No people or places stored yet'))
      .first().waitFor({ timeout: 30_000 })

    const sortToggle = page.locator('[data-testid="sort-toggle"]').first()
    if (!(await sortToggle.isVisible().catch(() => false))) {
      test.skip(true, 'seed did not produce entities — SortToggle skipped')
      return
    }

    const recBtn = sortToggle.locator('button[data-sort="recency"]')
    await expect(recBtn).toBeVisible()
    await expect(recBtn).toHaveClass(/font-medium/)

    const freqBtn = sortToggle.locator('button[data-sort="frequency"]')
    await expect(freqBtn).toHaveCount(0)

    await page.screenshot({ path: 'e2e/screenshots/05-people-sort.png', fullPage: false })
  })
})
