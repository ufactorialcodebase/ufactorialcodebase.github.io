// Feature 2 — rename a list item in place. Backend contract:
//   PATCH /vault/lists/<name>/items  {old_value, new_value, notes}
//   200 → updated list
//   404 → list or old_value missing
//   409 → new_value collides with a different existing item
//
// Mocked via page.route so this test doesn't depend on chat data.
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
  ],
}

// route helper — returns `state` so tests can drive server-side collision
// behaviour by mutating `state.mode`.
async function primeLists(page, list) {
  const state = { current: { ...list }, mode: 'ok' } // 'ok' | 'collision' | '404'
  await page.route('**/api/vault/lists*', (route) => {
    const req = route.request()
    if (req.method() === 'GET' && !req.url().includes(`/${encodeURIComponent(list.name)}`)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ lists: [state.current] }),
      })
    }
    return route.continue()
  })
  await page.route(`**/api/vault/lists/${encodeURIComponent(list.name)}/items`, (route) => {
    const req = route.request()
    if (req.method() === 'PATCH') {
      const body = JSON.parse(req.postData() || '{}')
      if (state.mode === 'collision') {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ detail: `'${body.new_value}' already exists in this list` }),
        })
      }
      if (state.mode === '404') {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ detail: `'${body.old_value}' not found` }),
        })
      }
      // Apply the rename in place, preserving position + notes update.
      const items = state.current.items.map((i) =>
        i.value === body.old_value
          ? { value: body.new_value, notes: body.notes ?? i.notes }
          : i
      )
      // Checked_values follows if applicable.
      const checked = (state.current.checked_values || []).map((v) =>
        v === body.old_value ? body.new_value : v
      )
      state.current = { ...state.current, items, checked_values: checked }
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

test.describe('Feature 2 — list item rename', () => {
  test('hover reveals Edit → save renames + persists position', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeLists(page, FIXTURE_LIST)
    await gotoVault(page, '/vault/lists')

    const detail = page.locator('[data-testid="list-detail"]')
    await expect(detail).toBeVisible({ timeout: 15_000 })

    // Click the edit button on "eggs".
    const eggs = page.locator('[data-testid="list-item"][data-item-value="eggs"]')
    await eggs.locator('[data-testid="list-item-edit"]').click({ force: true })
    await expect(eggs).toHaveAttribute('data-editing', 'true')

    // Change value + notes.
    await eggs.locator('[data-testid="list-item-edit-value"]').fill('brown eggs')
    await eggs.locator('[data-testid="list-item-edit-notes"]').fill('half dozen')
    await eggs.locator('[data-testid="list-item-edit-save"]').click()

    // Row exits edit mode + shows the new value.
    await expect(page.locator('[data-testid="list-item"][data-item-value="brown eggs"]')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('[data-testid="list-item"][data-item-value="eggs"]')).toHaveCount(0)

    // Position preserved (middle of the list — was index 1, still index 1).
    const order = await page.$$eval('[data-testid="list-item"]', (nodes) =>
      nodes.map((n) => n.getAttribute('data-item-value'))
    )
    expect(order).toEqual(['milk', 'brown eggs', 'bread'])

    // Backend saw the PATCH with correct body.
    expect(state.current.items[1].value).toBe('brown eggs')
    expect(state.current.items[1].notes).toBe('half dozen')

    await page.screenshot({ path: 'e2e/screenshots/f2-list-item-rename.png', fullPage: false })
  })

  test('cancel → no PATCH, item unchanged', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeLists(page, FIXTURE_LIST)
    await gotoVault(page, '/vault/lists')

    const eggs = page.locator('[data-testid="list-item"][data-item-value="eggs"]')
    await eggs.locator('[data-testid="list-item-edit"]').click({ force: true })
    await eggs.locator('[data-testid="list-item-edit-value"]').fill('SHOULD NOT PERSIST')
    await eggs.locator('[data-testid="list-item-edit-cancel"]').click()

    await expect(page.locator('[data-testid="list-item"][data-item-value="eggs"]')).toBeVisible()
    // Server state untouched.
    expect(state.current.items[1].value).toBe('eggs')
  })

  test('collision (409) → rollback + toast, item unchanged', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeLists(page, FIXTURE_LIST)
    state.mode = 'collision'
    await gotoVault(page, '/vault/lists')

    const eggs = page.locator('[data-testid="list-item"][data-item-value="eggs"]')
    await eggs.locator('[data-testid="list-item-edit"]').click({ force: true })
    await eggs.locator('[data-testid="list-item-edit-value"]').fill('milk')
    await eggs.locator('[data-testid="list-item-edit-save"]').click()

    // Sonner toast surfaces the collision.
    await expect(page.getByText(/already exists/i).first()).toBeVisible({ timeout: 5_000 })

    // Row rolls back — original value still there.
    await expect(page.locator('[data-testid="list-item"][data-item-value="eggs"]')).toBeVisible()
    await expect(page.locator('[data-testid="list-item"][data-item-value="milk"]')).toHaveCount(1)
  })
})
