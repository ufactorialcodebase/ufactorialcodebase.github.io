// Feature 4: clicking a node in the World force graph lights up that
// node + its 1st/2nd/3rd-degree neighbours via opacity gradation, and
// dims the rest of the graph. Panel opens without a dim backdrop so the
// user can still see the highlighted subgraph while reading node details.
// Clicking the background clears the highlight and closes the panel.
//
// Uses a mocked /api/vault/world response so the test is deterministic +
// doesn't depend on chat-seeded data (chat pipeline is blocked on the
// backend RLS regression — see beta-polish-report.html).
import { test, expect } from '@playwright/test'
import { gotoVault } from './_helpers.js'

// A hand-drawn graph. From 'A':
//   1° → you, B, G
//   2° → F, C
//   3° → D, H
//   REST → E, I, J
const FIXTURE_WORLD = {
  nodes: [
    { id: 'you', label: 'You', type: 'you' },
    { id: 'A', label: 'Alice', type: 'person' },
    { id: 'B', label: 'Bob', type: 'person' },
    { id: 'C', label: 'Carol', type: 'person' },
    { id: 'D', label: 'David', type: 'person' },
    { id: 'E', label: 'Eve', type: 'person' },
    { id: 'F', label: 'Frank', type: 'organization' },
    { id: 'G', label: 'Gwen', type: 'person' },
    { id: 'H', label: 'HQ', type: 'organization' },
    { id: 'I', label: 'Iris', type: 'person' },
    { id: 'J', label: 'Jake', type: 'person' },
  ],
  edges: [
    { source: 'you', target: 'A', strength: 0.8 },
    { source: 'you', target: 'F', strength: 0.4 },
    { source: 'A', target: 'B', strength: 0.6 },
    { source: 'A', target: 'G', strength: 0.5 },
    { source: 'B', target: 'C', strength: 0.5 },
    { source: 'C', target: 'D', strength: 0.4 },
    { source: 'D', target: 'E', strength: 0.3 },
    { source: 'C', target: 'H', strength: 0.3 },
    { source: 'G', target: 'H', strength: 0.3 },
    { source: 'I', target: 'J', strength: 0.5 },
  ],
}

test.describe('Feature 4 — world node highlight', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/vault/world', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE_WORLD) })
    )
  })

  test('click node → BFS highlight + panel opens (no backdrop over graph)', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/world')

    // Wait for the graph to render (d3 draws circles with data-node-type).
    await page.waitForSelector('svg circle[data-node-type="person"]', { timeout: 15_000 })
    // Let the force sim settle for a frame or two.
    await page.waitForTimeout(700)

    // Click Alice (A) via her label. We locate by text and then click the
    // paired circle for reliability with a force-jitter layout.
    const aliceCircle = page.locator('svg circle[data-node-type="person"]').first()
    await aliceCircle.click()

    const panel = page.locator('[data-testid="world-node-panel"]')
    await expect(panel).toBeVisible({ timeout: 5_000 })

    // No dim backdrop overlay — this is the whole point of the feature.
    // The old shared SidePanel rendered a full-screen `bg-black/40` div;
    // the new WorldNodePanel does not. Assert no such overlay exists.
    const backdropCount = await page.locator('div.bg-black\\/40').count()
    expect(backdropCount).toBe(0)

    // Non-neighbour circles should be dimmed. Grab all circles' opacity
    // attributes and confirm at least one is at REST_OPACITY (0.08) —
    // node I or J (disconnected island) will be at REST.
    await page.waitForTimeout(300)  // let the highlight transition finish
    const opacities = await page.$$eval(
      'svg circle[data-node-type]',
      (circles) => circles.map((c) => parseFloat(c.getAttribute('opacity') ?? '1'))
    )
    const rest = opacities.filter((o) => o < 0.15)
    const lit = opacities.filter((o) => o >= 0.9)
    expect(rest.length, 'at least one non-neighbour circle should be dimmed').toBeGreaterThanOrEqual(1)
    expect(lit.length, 'at least one node (the clicked one) should stay fully opaque').toBeGreaterThanOrEqual(1)

    await page.screenshot({ path: 'e2e/screenshots/f4-world-highlight-active.png', fullPage: false })
  })

  test('click background → highlight clears + panel closes', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/world')
    await page.waitForSelector('svg circle[data-node-type="person"]', { timeout: 15_000 })
    await page.waitForTimeout(700)

    const aliceCircle = page.locator('svg circle[data-node-type="person"]').first()
    await aliceCircle.click()
    await expect(page.locator('[data-testid="world-node-panel"]')).toBeVisible({ timeout: 5_000 })

    // Click the SVG canvas outside any node — hit the SVG element itself
    // by clicking near a corner where no nodes will settle.
    const svg = page.locator('svg').first()
    const box = await svg.boundingBox()
    await page.mouse.click(box.x + 10, box.y + 10)

    await expect(page.locator('[data-testid="world-node-panel"]')).toBeHidden({ timeout: 3_000 })

    // After clearing, all circles should be back to opacity 1.
    await page.waitForTimeout(300)
    const opacities = await page.$$eval(
      'svg circle[data-node-type]',
      (circles) => circles.map((c) => parseFloat(c.getAttribute('opacity') ?? '1'))
    )
    for (const o of opacities) {
      expect(o).toBeGreaterThan(0.9)
    }
  })
})
