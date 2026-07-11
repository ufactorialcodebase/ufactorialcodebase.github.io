// Feature 4 (revamped): clicking a node in the World force graph adds a
// yellow drop-shadow "glow" via SVG filter to that node + its 1st / 2nd /
// 3rd-degree neighbours. Glow intensity decays by degree; anything at
// 4+ hops or disconnected renders with NO filter — completely normal
// appearance, no dimming. Panel opens without a backdrop so the graph
// stays legible. Click the background to clear glow + close panel.
//
// Reverts vs the earlier opacity-ramp implementation: no <circle opacity>
// changes anymore; only the `filter` attribute distinguishes highlighted
// nodes.
import { test, expect } from '@playwright/test'
import { gotoVault } from './_helpers.js'

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

test.describe('Feature 4 — world node glow highlight', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/vault/world', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE_WORLD) })
    )
    // Return empty entities / topics so mention_count enrichment doesn't
    // change node sizes in the fixture test.
    await page.route('**/api/vault/entities*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ entities: [] }) })
    )
    await page.route('**/api/vault/topics*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ topics: [] }) })
    )
  })

  test('SVG defs include a glow filter per tier + a dim filter', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/world')
    await page.waitForSelector('svg circle[data-node-type="person"]', { timeout: 15_000 })

    for (const id of ['node-glow-0', 'node-glow-1', 'node-glow-2', 'node-glow-3', 'node-dim']) {
      const el = page.locator(`svg defs #${id}`)
      await expect(el).toHaveCount(1)
    }
  })

  test('click node → glow on lit subgraph + dim filter on the rest so highlight pops', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/world')
    await page.waitForSelector('svg circle[data-node-type="person"]', { timeout: 15_000 })
    await page.waitForTimeout(700)

    const firstPerson = page.locator('svg circle[data-node-type="person"]').first()
    await firstPerson.click()

    const panel = page.locator('[data-testid="world-node-panel"]')
    await expect(panel).toBeVisible({ timeout: 5_000 })

    // No dim backdrop overlay — graph stays visible behind the panel.
    expect(await page.locator('div.bg-black\\/40').count()).toBe(0)

    await page.waitForTimeout(200)

    // Highlighted subgraph: nodes in the lit cluster carry a glow filter.
    // Non-highlighted: dim filter (desaturated) + reduced opacity so the
    // lit cluster pops visually. "you" carries no filter — always native.
    const state = await page.$$eval('svg circle[data-node-type]', (circles) =>
      circles.map((c) => ({
        type: c.getAttribute('data-node-type'),
        filter: c.getAttribute('filter'),
        opacity: parseFloat(c.getAttribute('opacity') ?? '1'),
      }))
    )
    const glowing = state.filter((s) => s.filter && s.filter.includes('node-glow-'))
    const dimmed = state.filter((s) => s.filter && s.filter.includes('node-dim'))
    const you = state.find((s) => s.type === 'you')

    expect(glowing.length, 'at least the clicked node should glow').toBeGreaterThanOrEqual(1)
    expect(dimmed.length, 'nodes outside the 3-hop radius should be dimmed').toBeGreaterThanOrEqual(1)
    expect(you?.filter, '"you" should never carry a filter').toBeNull()

    // Glowing nodes stay fully opaque; dimmed nodes fade to the DIM_STATE
    // opacity floor so the lit cluster reads distinctly.
    for (const g of glowing) expect(g.opacity).toBeGreaterThanOrEqual(1)
    for (const d of dimmed) expect(d.opacity, 'dimmed nodes fade to signal off-cluster').toBeLessThan(1)

    await page.screenshot({ path: 'e2e/screenshots/f4-world-glow-active.png', fullPage: false })
  })

  test('click background → all filters cleared + panel closes', async ({ page }) => {
    test.setTimeout(60_000)
    await gotoVault(page, '/vault/world')
    await page.waitForSelector('svg circle[data-node-type="person"]', { timeout: 15_000 })
    await page.waitForTimeout(700)

    await page.locator('svg circle[data-node-type="person"]').first().click()
    await expect(page.locator('[data-testid="world-node-panel"]')).toBeVisible({ timeout: 5_000 })

    const svg = page.locator('svg').first()
    const box = await svg.boundingBox()
    await page.mouse.click(box.x + 10, box.y + 10)

    await expect(page.locator('[data-testid="world-node-panel"]')).toBeHidden({ timeout: 3_000 })
    await page.waitForTimeout(200)

    // After clearing: no glow, no dim, everything back to full opacity.
    const state = await page.$$eval('svg circle[data-node-type]', (circles) =>
      circles.map((c) => ({
        filter: c.getAttribute('filter'),
        opacity: parseFloat(c.getAttribute('opacity') ?? '1'),
      }))
    )
    for (const s of state) {
      expect(s.filter, 'no filter should remain after clearing').toBeFalsy()
      expect(s.opacity, 'all opacity should reset to 1').toBeGreaterThanOrEqual(1)
    }
  })

  test('node radius scales by mention_count when enriched from cache', async ({ page }) => {
    test.setTimeout(60_000)
    // Override the entities mock so Alice has 20 mentions, Bob has 0.
    await page.route('**/api/vault/entities*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          entities: [
            { id: 'A', name: 'Alice', mention_count: 20 },
            { id: 'B', name: 'Bob', mention_count: 0 },
          ],
        }),
      })
    )

    await gotoVault(page, '/vault/world')
    await page.waitForSelector('svg circle[data-node-type="person"]', { timeout: 15_000 })
    await page.waitForTimeout(500)

    const aliceR = await page.locator('svg circle[data-node-type="person"]').first().getAttribute('r')
    // Alice with 20 mentions → base(10) + log(21)*3.5 ≈ 20.6
    // Bob with 0 mentions   → base(10) + log(1)*3.5 = 10
    expect(parseFloat(aliceR)).toBeGreaterThan(15)

    // Fetch all persons and find the smallest — should be ≤ 10 (Bob or beyond).
    const radii = await page.$$eval('svg circle[data-node-type="person"]', (circles) =>
      circles.map((c) => parseFloat(c.getAttribute('r')))
    )
    expect(Math.min(...radii)).toBeLessThanOrEqual(12)
    expect(Math.max(...radii) / Math.min(...radii)).toBeGreaterThan(1.4)
  })
})
