// Item 7: the World graph gets an "All / Entities only" filter above the
// canvas. "Entities only" hides topic nodes and any edge that references
// one, keeping the "you" anchor + person / org / place entities visible.
// The playwright assertion counts SVG circles by `data-node-type` before
// and after the toggle.
import { test, expect } from '@playwright/test'
import { gotoVault, waitForChatReady } from './_helpers.js'

async function sendChatMessage(page, message) {
  const composer = page.locator('textarea').first()
  await composer.click()
  await composer.fill(message)
  await composer.press('Enter')
  await page.waitForSelector('text=/\\d+(\\.\\d+)?s response/', { timeout: 90_000 })
}

test.describe('Item 7 — Entities-only world filter', () => {
  test.beforeAll(async ({ browser }) => {
    // Ensure the World graph has both entity nodes AND topic nodes so the
    // toggle is meaningful. Two turns naming distinct entities + explicit
    // topic phrases; reset triggers session-end persistence.
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await gotoVault(page, '/vault/chat')
    await waitForChatReady(page)
    await sendChatMessage(page, 'Seed for world graph: my friend Priya lives in Chennai. I am worried about my daughter Aria starting school in September.')
    await sendChatMessage(page, 'One more: my mentor Dan runs Slack Fund. Also, I am planning a trip to Kyoto next spring.')
    const resetBtn = page.getByTitle('Reset conversation')
    if (await resetBtn.isVisible().catch(() => false)) {
      await resetBtn.click()
    }
    await ctx.close()
  })

  test('Entities-only filter hides topic nodes; entities remain visible', async ({ page }) => {
    test.setTimeout(90_000)
    await gotoVault(page, '/vault/world')

    // Wait until the graph or an empty state has rendered.
    await page.locator('[data-testid="world-node-filter"]')
      .or(page.getByText('world graph is empty', { exact: false }))
      .first().waitFor({ timeout: 30_000 })

    const filter = page.locator('[data-testid="world-node-filter"]')
    if (!(await filter.isVisible().catch(() => false))) {
      test.skip(true, 'seed did not produce a world graph — filter skipped')
      return
    }

    // d3 draws SVG circles with data-node-type — count them by type.
    const countByType = async (type) =>
      page.locator(`svg circle[data-node-type="${type}"]`).count()

    // Give the force sim a moment to paint all circles.
    await page.waitForSelector('svg circle[data-node-type]', { timeout: 15_000 })
    await page.waitForTimeout(400)

    const topicsBefore = await countByType('topic')
    const personsBefore = await countByType('person')
    if (topicsBefore === 0) {
      test.skip(true, 'no topic nodes present — nothing for Entities-only to filter')
      return
    }

    const entitiesBtn = filter.locator('button[data-filter="entities"]')
    await entitiesBtn.click()
    // React re-renders + d3 remounts the graph — allow a paint.
    await page.waitForTimeout(500)

    const topicsAfter = await countByType('topic')
    const personsAfter = await countByType('person')

    expect(topicsAfter).toBe(0)
    expect(personsAfter).toBe(personsBefore)

    // Toggling back to All restores the topic nodes.
    const allBtn = filter.locator('button[data-filter="all"]')
    await allBtn.click()
    await page.waitForTimeout(500)
    const topicsRestored = await countByType('topic')
    expect(topicsRestored).toBeGreaterThan(0)

    await page.screenshot({ path: 'e2e/screenshots/07-world-entities-only.png', fullPage: false })
  })
})
