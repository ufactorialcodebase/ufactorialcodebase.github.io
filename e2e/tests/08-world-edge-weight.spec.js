// Item 8: force-graph edges render with a stroke-width scaled by tie
// strength. The heaviest edge should be at least 2x wider than the
// lightest for the visual signal to land. When every edge has the same
// strength (uniform data) the assertion is skipped — nothing to prove.
//
// Runs after Items 5 + 7 so the shared test-user backing store already
// has enough people / places / topics / relationships to produce varied
// edge strengths in the world graph — no separate seed needed.
import { test, expect } from '@playwright/test'
import { gotoVault } from './_helpers.js'

test.describe('Item 8 — edge stroke-width by weight', () => {
  test('heaviest edge is >= 2x wider than lightest', async ({ page }) => {
    test.setTimeout(90_000)
    await gotoVault(page, '/vault/world')
    await page.locator('[data-testid="world-node-filter"]')
      .or(page.getByText('world graph is empty', { exact: false }))
      .first().waitFor({ timeout: 30_000 })

    const anyEdge = page.locator('svg line[data-strength]')
    if ((await anyEdge.count()) === 0) {
      test.skip(true, 'no edges — nothing to weight')
      return
    }

    await page.waitForTimeout(600)

    const widths = await page.$$eval('svg line[data-strength]', (lines) =>
      lines.map((l) => parseFloat(l.getAttribute('stroke-width') || '1'))
    )
    expect(widths.length).toBeGreaterThan(0)

    const strengths = await page.$$eval('svg line[data-strength]', (lines) =>
      lines.map((l) => parseFloat(l.getAttribute('data-strength') || '0'))
    )
    const uniqStrengths = Array.from(new Set(strengths.map((s) => Math.round(s * 100) / 100)))
    if (uniqStrengths.length < 2) {
      test.skip(true, `all ${strengths.length} edges have the same strength (${uniqStrengths[0]}) — nothing to compare`)
      return
    }

    const max = Math.max(...widths)
    const min = Math.min(...widths.filter((w) => w > 0))
    expect(max / min).toBeGreaterThanOrEqual(2)

    await page.screenshot({ path: 'e2e/screenshots/08-world-edge-weight.png', fullPage: false })
  })
})
