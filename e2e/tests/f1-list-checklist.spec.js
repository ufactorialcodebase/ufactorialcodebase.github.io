// Feature 1: per-list checklist mode.
//
// When the "Checklist" button in ListDetail is toggled on:
//   - the list gains `is_checklist: true` on the backend
//   - items with a value in `checked_values` render with a filled checkbox
//     + strikethrough + reduced opacity, and sink to the bottom of the list
//   - unchecked items stay at the top in their original order
// Toggling off preserves `checked_values` so re-enabling restores state.
//
// Backend contracts (ISS-241):
//   PATCH /vault/lists/<name>          body: {is_checklist: bool}
//   POST  /vault/lists/<name>/checked  body: {value: str}       (toggle)
//
// Mocked via page.route so this doesn't depend on chat data + gets a
// deterministic list to exercise.
import { test, expect } from '@playwright/test'
import { gotoVault } from './_helpers.js'

const FIXTURE_LIST = {
  id: 'list-1',
  name: 'Groceries',
  category: 'general',
  is_checklist: false,
  checked_values: [],
  items: [
    { value: 'milk', notes: null },
    { value: 'eggs', notes: 'dozen' },
    { value: 'bread', notes: null },
    { value: 'apples', notes: '6' },
  ],
}

async function primeLists(page, list) {
  const state = { current: { ...list } }
  await page.route('**/api/vault/lists*', (route) => {
    const req = route.request()
    // Only intercept the base list, not per-list-name paths (they're
    // matched by the more-specific routes below).
    if (req.method() === 'GET' && !req.url().includes(`${encodeURIComponent(list.name)}`)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ lists: [state.current] }),
      })
    }
    return route.continue()
  })
  await page.route(`**/api/vault/lists/${encodeURIComponent(list.name)}`, (route) => {
    const req = route.request()
    if (req.method() === 'PATCH') {
      const body = JSON.parse(req.postData() || '{}')
      if (typeof body.is_checklist === 'boolean') {
        state.current = { ...state.current, is_checklist: body.is_checklist }
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.current),
      })
    }
    return route.continue()
  })
  await page.route(`**/api/vault/lists/${encodeURIComponent(list.name)}/checked`, (route) => {
    const req = route.request()
    if (req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}')
      const checked = new Set(state.current.checked_values || [])
      if (checked.has(body.value)) checked.delete(body.value)
      else checked.add(body.value)
      state.current = { ...state.current, checked_values: Array.from(checked) }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.current),
      })
    }
    return route.continue()
  })
  return state
}

async function itemOrder(page) {
  return page.$$eval('[data-testid="list-item"]', (nodes) =>
    nodes.map((n) => n.getAttribute('data-item-value'))
  )
}

test.describe('Feature 1 — list checklist mode', () => {
  test('toggle checklist mode → checkboxes appear + optimistic PATCH', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeLists(page, FIXTURE_LIST)
    await gotoVault(page, '/vault/lists')

    const detail = page.locator('[data-testid="list-detail"]')
    await expect(detail).toBeVisible({ timeout: 15_000 })
    await expect(detail).toHaveAttribute('data-is-checklist', 'false')

    // Non-checklist mode: no checkboxes rendered.
    await expect(page.locator('[data-testid="list-item-checkbox"]')).toHaveCount(0)

    // Toggle on → checkboxes appear on all 4 items.
    await page.locator('[data-testid="checklist-mode-toggle"]').click()
    await expect(detail).toHaveAttribute('data-is-checklist', 'true')
    await expect(page.locator('[data-testid="list-item-checkbox"]')).toHaveCount(4)
    expect(state.current.is_checklist).toBe(true)

    await page.screenshot({ path: 'e2e/screenshots/f1-list-checklist-enabled.png', fullPage: false })
  })

  test('checking an item → sinks to bottom + line-through + counter updates', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeLists(page, { ...FIXTURE_LIST, is_checklist: true })
    await gotoVault(page, '/vault/lists')

    await expect(page.locator('[data-testid="list-detail"]')).toHaveAttribute('data-is-checklist', 'true')

    // Initial order matches the fixture.
    expect(await itemOrder(page)).toEqual(['milk', 'eggs', 'bread', 'apples'])
    await expect(page.locator('[data-testid="list-checked-count"]')).toContainText('0 checked')

    // Check "eggs" (second item). It should sink to the bottom.
    await page
      .locator('[data-testid="list-item"][data-item-value="eggs"]')
      .locator('[data-testid="list-item-checkbox"]')
      .click()

    // Optimistic update — order flips immediately.
    await expect(async () => {
      expect(await itemOrder(page)).toEqual(['milk', 'bread', 'apples', 'eggs'])
    }).toPass({ timeout: 3_000 })

    // Counter reflects it.
    await expect(page.locator('[data-testid="list-checked-count"]')).toContainText('1 checked')

    // The checked item carries the checked attribute + visual affordance.
    const eggs = page.locator('[data-testid="list-item"][data-item-value="eggs"]')
    await expect(eggs).toHaveAttribute('data-checked', 'true')
    await expect(eggs.locator('.line-through')).toBeVisible()

    // Backend saw the toggle.
    expect(state.current.checked_values).toContain('eggs')

    await page.screenshot({ path: 'e2e/screenshots/f1-list-checklist-checked-sinks.png', fullPage: false })
  })

  test('unchecking floats back up + backend state follows', async ({ page }) => {
    test.setTimeout(60_000)
    const startingList = {
      ...FIXTURE_LIST,
      is_checklist: true,
      checked_values: ['eggs', 'apples'],
    }
    const state = await primeLists(page, startingList)
    await gotoVault(page, '/vault/lists')

    await expect(page.locator('[data-testid="list-detail"]')).toHaveAttribute('data-is-checklist', 'true', { timeout: 10_000 })
    await expect(page.locator('[data-testid="list-item"]').first()).toBeVisible({ timeout: 10_000 })

    // Initial: eggs + apples checked → sink to bottom in that order.
    await expect(async () => {
      expect(await itemOrder(page)).toEqual(['milk', 'bread', 'eggs', 'apples'])
    }).toPass({ timeout: 5_000 })

    // Uncheck eggs — should float back to its original position (between milk and bread).
    await page
      .locator('[data-testid="list-item"][data-item-value="eggs"]')
      .locator('[data-testid="list-item-checkbox"]')
      .click()

    await expect(async () => {
      expect(await itemOrder(page)).toEqual(['milk', 'eggs', 'bread', 'apples'])
    }).toPass({ timeout: 3_000 })

    expect(state.current.checked_values).not.toContain('eggs')
    expect(state.current.checked_values).toContain('apples')
  })
})
