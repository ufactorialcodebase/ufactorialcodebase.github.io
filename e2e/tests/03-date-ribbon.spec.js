// Item 3: date ribbon appears at the top of the message stream. A fresh
// session only produces "Today" ribbons, so the playwright test asserts the
// integration — the ribbon component actually renders in the DOM with the
// right pill styling and the "Today" label — and the cross-day boundary
// logic is covered by the format-utils vitest suite.
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

test('a "Today" date ribbon renders at the top of a fresh chat', async ({ page }) => {
  test.setTimeout(180_000)
  await gotoVault(page, '/vault/chat')
  await waitForChatReady(page)

  const composer = page.locator('textarea').first()
  await composer.click()
  await composer.fill('ribbon check')
  await composer.press('Enter')

  await expect(page.locator('[data-testid="ai-message-body"]').last())
    .toBeVisible({ timeout: 90_000 })

  const ribbons = page.locator('[data-testid="date-ribbon"]')
  await expect(ribbons.first()).toBeVisible()
  const text = (await ribbons.first().textContent())?.trim()
  expect(text).toBe('Today')

  const position = await ribbons.first().evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('sticky')

  await page.screenshot({ path: 'e2e/screenshots/03-date-ribbon.png', fullPage: false })
})
