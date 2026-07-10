// Feature 3: Edit button on ArtifactReader turns title + content into an
// editable state; Save calls PUT /vault/artifacts/{id}; backend echoes
// back the updated artifact with an incremented version.
//
// Mocks the artifact list + detail fetch + the PUT so this test doesn't
// need a real chat-created artifact. Post-ISS-231 the deep-link path
// itself is tested by Item 6 in the batch-1 suite.
import { test, expect } from '@playwright/test'
import { gotoVault } from './_helpers.js'

const FIXTURE_ARTIFACT = {
  id: '11111111-2222-3333-4444-555555555555',
  title: 'Kyoto trip plan',
  content_type: 'action_plan',
  summary: 'Rough plan for the spring trip to Kyoto.',
  content: '# Day 1\n\n- Fushimi Inari\n- Gion walk',
  version: 1,
  updated_at: '2026-07-08T12:00:00Z',
}

async function primeArtifactRoutes(page, artifact) {
  const state = { current: { ...artifact } }

  await page.route('**/api/vault/artifacts?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ artifacts: [state.current] }),
    })
  )
  await page.route(`**/api/vault/artifacts/${artifact.id}`, (route) => {
    const req = route.request()
    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.current),
      })
    }
    if (req.method() === 'PUT') {
      const body = JSON.parse(req.postData() || '{}')
      // Mirror the backend semantics: title or content change bumps version.
      const bumped = body.content !== undefined || body.title !== undefined
      state.current = {
        ...state.current,
        ...body,
        version: bumped ? (state.current.version || 1) + 1 : state.current.version,
      }
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

test.describe('Feature 3 — edit artifact', () => {
  test('Edit button → change title + content → Save calls PUT + version bumps', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeArtifactRoutes(page, FIXTURE_ARTIFACT)
    await gotoVault(page, `/vault/artifacts?open=${FIXTURE_ARTIFACT.id}`)

    const reader = page.locator('[data-testid="artifact-reader"]')
    await expect(reader).toBeVisible({ timeout: 15_000 })
    await expect(reader).toHaveAttribute('data-editing', 'false')

    // Version pill starts at v1
    await expect(page.locator('[data-testid="artifact-version"]')).toHaveText('v1')

    // Click Edit → mode flips, title becomes input, content becomes textarea
    await page.locator('[data-testid="artifact-edit-button"]').click()
    await expect(reader).toHaveAttribute('data-editing', 'true')

    const titleInput = page.locator('[data-testid="artifact-title-input"]')
    const contentArea = page.locator('[data-testid="artifact-content-textarea"]')
    await expect(titleInput).toHaveValue(FIXTURE_ARTIFACT.title)
    await expect(contentArea).toHaveValue(FIXTURE_ARTIFACT.content)

    await titleInput.fill('Kyoto trip plan — v2')
    await contentArea.fill('# Day 1\n\n- Fushimi Inari\n- Gion walk\n- Nishiki market')

    // Save → PUT fires, panel returns to read mode, version pill bumps to v2
    await page.locator('[data-testid="artifact-save-button"]').click()
    await expect(reader).toHaveAttribute('data-editing', 'false', { timeout: 5_000 })
    await expect(page.locator('[data-testid="artifact-version"]')).toHaveText('v2')

    // The route state captured what the backend received — assert title +
    // content actually went through (proves the frontend sent both fields).
    expect(state.current.title).toBe('Kyoto trip plan — v2')
    expect(state.current.content).toContain('Nishiki market')

    await page.screenshot({ path: 'e2e/screenshots/f3-artifact-edit-saved.png', fullPage: false })
  })

  test('Cancel discards draft — no PUT fires', async ({ page }) => {
    test.setTimeout(60_000)
    const state = await primeArtifactRoutes(page, FIXTURE_ARTIFACT)
    await gotoVault(page, `/vault/artifacts?open=${FIXTURE_ARTIFACT.id}`)

    await page.locator('[data-testid="artifact-edit-button"]').click()
    await page.locator('[data-testid="artifact-title-input"]').fill('Different title')
    await page.locator('[data-testid="artifact-cancel-button"]').click()

    // Reader back in read mode, title reverted to the fixture
    await expect(page.locator('[data-testid="artifact-reader"]')).toHaveAttribute('data-editing', 'false')
    // Version pill unchanged
    await expect(page.locator('[data-testid="artifact-version"]')).toHaveText('v1')
    // Server state untouched
    expect(state.current.title).toBe(FIXTURE_ARTIFACT.title)
  })
})
