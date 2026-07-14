// Item 6: create_artifact tool cards get a clickable title that navigates
// to /vault/artifacts and opens the matching artifact in the SidePanel.
//
// ISS-231 shipped — tool_complete SSE events now carry
// `result: {artifact_id, title}` for artifact tools, so the frontend
// prefers the id-based `?open=<uuid>` route. `?openTitle=<title>` stays
// as a defensive fallback for any backend that hasn't populated
// `result`. This test asserts the id-path is live end-to-end: if the
// backend ever regresses to `result: null` for artifact tools, the
// strict href regex flips red immediately instead of silently
// succeeding on the fallback.
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

// Loose UUID-ish shape — Supabase artifact_id is a UUIDv4 (36 chars with
// hyphens), but the test isn't gated on exact format. Just require the
// id to look like a real identifier: at least 20 hex/hyphen chars after
// `?open=`.
const OPEN_ID_HREF = /\?open=[0-9a-fA-F][0-9a-fA-F-]{19,}/

test('artifact tool card deep-links by id (?open=<uuid>) end-to-end', async ({ page }) => {
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
  // Post-ISS-231: must be `?open=<uuid>`, not the `?openTitle=` fallback.
  // Fallback flip means backend regressed to result:null — treat as bug.
  expect(href, `href should use ?open=<uuid> id path, got: ${href}`).toMatch(OPEN_ID_HREF)

  await link.click()
  await page.waitForURL(OPEN_ID_HREF, { timeout: 10_000 })

  // Panel opens with the artifact reader. The panel title element takes the
  // artifact.title, so assert the title text is present in the DOM.
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible({ timeout: 15_000 })

  await page.screenshot({ path: 'e2e/screenshots/06-artifact-deep-link.png', fullPage: false })
})
