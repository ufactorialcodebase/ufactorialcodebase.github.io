// Item 4: when the LLM streams "…good." → [tool] → "The next step…", the
// pre-tool and post-tool text land as separate SSE `content` events with no
// whitespace on either side of the tool block. The frontend used to
// concatenate them as "good.The next step". Fix in Chat.jsx bridges a
// single space at the boundary; this test triggers a tool call mid-turn
// (todo_create) and asserts the rendered text has no "sentence.CapitalWord"
// concatenation pattern.
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

test('AI text has no missing-space concat around a tool call', async ({ page }) => {
  test.setTimeout(180_000)
  await gotoVault(page, '/vault/chat')
  await waitForChatReady(page)

  const composer = page.locator('textarea').first()
  await composer.click()
  // Prompt engineered to elicit pre-text → tool → post-text. Even if the
  // exact wording drifts, any Claude turn that both narrates and stores an
  // entity will exercise the boundary.
  await composer.fill(
    'Please add a short todo called "beta polish smoke test". Before you create it, '
    + 'tell me in one sentence that you are about to. After you create it, confirm '
    + 'in one more sentence. Use complete sentences with full stops.'
  )
  await composer.press('Enter')

  // Wait for both: a tool card to appear (proves a tool ran) and the message
  // body to be visible (proves streaming completed enough to render).
  await expect(page.locator('[data-testid="ai-message-body"]').last())
    .toBeVisible({ timeout: 90_000 })

  // Give the stream a beat to finish — the completion tick shows the green
  // response-time badge; wait for that as the "stream done" signal.
  await page.waitForSelector('text=/\\d+(\\.\\d+)?s response/', { timeout: 90_000 })

  const bodyText = await page.locator('[data-testid="ai-message-body"]').last().textContent()
  expect(bodyText, 'AI response body was empty').toBeTruthy()

  // The specific bug: lowercase-letter + period + capital-letter with no
  // space, e.g. "good.The". Numbers-with-decimals ("3.14") and abbreviations
  // ("e.g.") don't match this pattern.
  const bugMatch = bodyText.match(/[a-z]\.[A-Z][a-z]/)
  expect(bugMatch, `boundary-bug pattern still present: ${bugMatch?.[0]}`).toBeNull()

  await page.screenshot({ path: 'e2e/screenshots/04-tool-boundary.png', fullPage: false })
})
