// Item 6: create_artifact tool cards get a clickable title that navigates
// to /vault/artifacts and opens the matching artifact in the SidePanel.
// Backend gap: `tool_complete` doesn't include the new artifact_id yet
// (ISS-231), so the frontend links today with `?openTitle=<title>`
// (case-insensitive first match) and will prefer `?open=<id>` once the
// backend surfaces the id in the SSE payload.
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

test('artifact tool card links to the Artifacts tab and opens the artifact', async ({ page }) => {
  test.setTimeout(180_000)
  await gotoVault(page, '/vault/chat')
  await waitForChatReady(page)

  const title = `Beta polish deep link ${Date.now()}`
  const composer = page.locator('textarea').first()
  await composer.click()
  await composer.fill(
    `Please create an artifact with the exact title "${title}" and content "smoke test for the deep-link feature." One short sentence of acknowledgement after — no extras.`
  )
  await composer.press('Enter')

  const link = page.locator('[data-testid="artifact-link"]').last()
  await expect(link).toBeVisible({ timeout: 90_000 })
  const linkTitle = await link.getAttribute('data-artifact-title')
  expect(linkTitle).toBe(title)

  const href = await link.getAttribute('href')
  expect(href).toContain('/vault/artifacts?')
  expect(href).toMatch(/open(Title)?=/)

  await link.click()
  await page.waitForURL(/\/vault\/artifacts\?/, { timeout: 10_000 })

  // Panel opens with the artifact reader. The panel title element takes the
  // artifact.title, so assert the title text is present in the DOM.
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible({ timeout: 15_000 })

  await page.screenshot({ path: 'e2e/screenshots/06-artifact-deep-link.png', fullPage: false })
})
