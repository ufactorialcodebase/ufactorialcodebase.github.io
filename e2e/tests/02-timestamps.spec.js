// Item 2: every message bubble shows a bottom-right timestamp. Today's
// messages render as HH:MM (which is what a live test will always produce
// because we just sent them a second ago). Text is muted and right-aligned.
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

test('every message bubble shows a bottom-right timestamp', async ({ page }) => {
  test.setTimeout(180_000)
  await gotoVault(page, '/vault/chat')
  await waitForChatReady(page)

  const composer = page.locator('textarea').first()
  await composer.click()
  await composer.fill('Quick timestamp check please, one short reply.')
  await composer.press('Enter')

  await expect(page.locator('[data-testid="ai-message-body"]').last())
    .toBeVisible({ timeout: 90_000 })

  const stamps = page.locator('[data-testid="message-timestamp"]')
  const count = await stamps.count()
  expect(count).toBeGreaterThanOrEqual(2)

  for (let i = 0; i < count; i++) {
    const stamp = stamps.nth(i)
    const text = (await stamp.textContent())?.trim()
    expect(text, `stamp #${i}`).toMatch(/^\d{2}:\d{2}$/)
    const alignment = await stamp.evaluate((el) => getComputedStyle(el).textAlign)
    expect(alignment).toBe('right')
  }

  await page.screenshot({ path: 'e2e/screenshots/02-timestamps.png', fullPage: false })
})
