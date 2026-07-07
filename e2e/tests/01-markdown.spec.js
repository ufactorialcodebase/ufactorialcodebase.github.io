// Item 1: Chat renders markdown (bold, italic, inline code) rather than the
// literal ``**word**`` / ``*word*`` / ``` `word` ``` characters. Sends a real
// LLM turn asking for a specific markdown echo, then walks the AI reply DOM
// for the parsed elements. Headings must NOT render as heading tags (spec
// says: bold, italic, code, code blocks, lists, links — no headings).
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

test('AI messages render markdown as HTML, not literal characters', async ({ page }) => {
  test.setTimeout(180_000)
  await gotoVault(page, '/vault/chat')
  await waitForChatReady(page)

  const composer = page.locator('textarea').first()
  await composer.click()
  await composer.fill(
    'For this test please repeat back to me exactly this text, verbatim, with no other words: '
    + 'This is **bold** and *italic* and `code`. Also `# a heading` should not become a heading tag.'
  )
  await composer.press('Enter')

  const lastAi = page.locator('[data-testid="ai-message-body"]').last()
  await expect(lastAi.locator('strong')).toHaveCount(1, { timeout: 90_000 })
  await expect(lastAi.locator('em')).toHaveCount(1)
  await expect(lastAi.locator('code')).toHaveCount(2)

  await expect(lastAi.locator('h1, h2, h3, h4, h5, h6')).toHaveCount(0)

  const literalStars = await lastAi.locator('text=/\\*\\*bold\\*\\*/').count()
  expect(literalStars).toBe(0)

  await page.screenshot({ path: 'e2e/screenshots/01-markdown.png', fullPage: false })
})
