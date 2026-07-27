/**
 * World view features: search-to-select, grouped connections panel with
 * click-through re-anchoring, and the rebuild-guard (no visible reload
 * flicker).
 *
 * Runs as the owner's TEST-project account (pratikcpednekar@gmail.com,
 * populated graph) via an admin-minted magic-link session — no password
 * involved. Read-only interactions.
 *
 * Runtime requirements:
 *   - frontend dev server on http://localhost:5173
 *   - backend on http://localhost:8000 with SUPABASE_ENV=test
 *   - E2E_SUPABASE_SERVICE_KEY = SUPABASE_KEY from backend .env.test
 *   - E2E_SUPABASE_ANON_KEY   = anon key (frontend .env.local)
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SUPABASE_REF = 'hruvdrxbzghqyrfecbxm'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY
const EMAIL = 'pratikcpednekar@gmail.com'
const SHOT_DIR = 'e2e/screenshots'

let session = null
let targetNode = null // a non-you node with at least one non-you connection

test.describe.serial('World view: search + grouped panel + stable load', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set').toBeTruthy()
    expect(ANON_KEY, 'E2E_SUPABASE_ANON_KEY must be set').toBeTruthy()
    expect(SUPABASE_URL).toContain(SUPABASE_REF)

    // 1. Admin-mint a magic link for the account (test project only)
    const linkRes = await request.post(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      data: { type: 'magiclink', email: EMAIL },
    })
    expect(linkRes.ok()).toBeTruthy()
    const linkData = await linkRes.json()
    const tokenHash = linkData.hashed_token || linkData.properties?.hashed_token
    expect(tokenHash, 'generate_link must return hashed_token').toBeTruthy()

    // 2. Verify the token server-side → full session JSON (no browser redirect)
    const verifyRes = await request.post(`${SUPABASE_URL}/auth/v1/verify`, {
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      data: { type: 'magiclink', token_hash: tokenHash },
    })
    expect(verifyRes.ok()).toBeTruthy()
    session = await verifyRes.json()
    expect(session.access_token).toBeTruthy()

    // 3. Pick a target node from the REAL world payload: a non-you node
    //    with at least one edge to another non-you node (so the panel has
    //    clickable entries).
    const worldRes = await request.get('http://localhost:8000/api/vault/world', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    expect(worldRes.ok()).toBeTruthy()
    const world = await worldRes.json()
    const degree = new Map()
    for (const e of world.edges) {
      for (const id of [e.source, e.target]) {
        degree.set(id, (degree.get(id) || 0) + 1)
      }
    }
    const nonYouNeighbors = (id) =>
      world.edges.filter((e) => (e.source === id || e.target === id))
        .map((e) => (e.source === id ? e.target : e.source))
        .filter((o) => o !== 'you')
    targetNode = world.nodes
      .filter((n) => n.id !== 'you' && nonYouNeighbors(n.id).length > 0)
      .sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0))[0]
    expect(targetNode, 'account must have a connected non-you node').toBeTruthy()
    console.log(`[world-spec] target node: ${targetNode.label} (${targetNode.type}), edges=${degree.get(targetNode.id)}`)
  })

  async function openWorld(page) {
    // Install the session before the app boots, plus the redesign flag
    // and dismissed onboarding/hints so no overlay intercepts clicks.
    await page.addInitScript(([ref, sess]) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(sess))
      localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
      localStorage.setItem('hridai_beta_acknowledged', 'true')
      localStorage.setItem('hridai_onboarding_complete', 'true')
      localStorage.setItem('hridai_spotlight_tour_complete', 'true')
      localStorage.setItem('hridai_tab_hint_world', 'true')
    }, [SUPABASE_REF, session])
    await page.goto('/vault/world', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/vault\/world/, { timeout: 15_000 })
    await expect(page.locator('svg circle').first()).toBeVisible({ timeout: 20_000 })
  }

  test('graph loads once — no rebuild flicker', async ({ page }) => {
    await openWorld(page)
    // Let all three data sources (world + entities + topics revalidation)
    // land; the signature guard must absorb identical-content refetches.
    await page.waitForTimeout(8_000)
    const builds = Number(await page.locator('svg[data-build-count]').getAttribute('data-build-count'))
    console.log(`[world-spec] data-build-count after settle: ${builds}`)
    // Budget: 1 first build (+1 dev-only StrictMode remount at t≈0,
    // invisible) + at most 1 position-seeded enrichment rebuild when
    // mention counts land. Production ceiling is 2; dev ceiling 3.
    // Pre-fix this was unbounded — every revalidation and the post-load
    // container shrink each re-exploded the layout.
    expect(builds).toBeLessThanOrEqual(3)

    // User-visible stability: nodes must not jump after settle. Sample
    // positions, wait, resample — displacement stays small.
    const sample = () => page.evaluate(() =>
      [...document.querySelectorAll('svg circle')].slice(0, 5).map((c) => [
        Number(c.getAttribute('cx')), Number(c.getAttribute('cy')),
      ])
    )
    const before = await sample()
    await page.waitForTimeout(2_500)
    const after = await sample()
    const maxDelta = Math.max(...before.map(([x, y], i) =>
      Math.hypot(x - after[i][0], y - after[i][1])
    ))
    console.log(`[world-spec] max node displacement over 2.5s: ${maxDelta.toFixed(1)}px`)
    expect(maxDelta).toBeLessThan(40)
    await page.screenshot({ path: `${SHOT_DIR}/world-01-loaded.png` })
  })

  test('search selects the node and highlights like a manual click', async ({ page }) => {
    await openWorld(page)
    const input = page.getByTestId('world-search-input')
    await input.fill(targetNode.label.slice(0, Math.min(6, targetNode.label.length)))
    const results = page.getByTestId('world-search-results')
    await expect(results).toBeVisible()
    await results.getByText(targetNode.label, { exact: true }).first().click()

    // Panel opens titled with the node
    await expect(page.getByTestId('world-node-panel').getByText(targetNode.label).first()).toBeVisible()
    // Highlight active: glow filters applied to the selected subgraph and
    // dim filter to the rest — same as a manual node click.
    const glowCount = await page.locator('svg circle[filter*="glow"], svg circle[filter*="url"]').count()
    expect(glowCount).toBeGreaterThan(0)
    await page.screenshot({ path: `${SHOT_DIR}/world-02-search-selected.png` })
  })

  test('panel groups connections by type with recency, and click-through re-anchors', async ({ page }) => {
    await openWorld(page)
    // Select via search (same result as manual click)
    await page.getByTestId('world-search-input').fill(targetNode.label)
    await page.getByTestId('world-search-results').getByText(targetNode.label, { exact: true }).first().click()

    const connections = page.getByTestId('world-node-connections')
    await expect(connections).toBeVisible()

    // Group headers appear in the fixed order (only non-empty ones render)
    const headers = await connections.locator('[data-testid^="world-connection-group-"]').all()
    expect(headers.length).toBeGreaterThan(0)
    const order = ['people', 'organizations', 'places', 'topics', 'other']
    const seen = []
    for (const h of headers) {
      const tid = await h.getAttribute('data-testid')
      seen.push(tid.replace('world-connection-group-', ''))
    }
    const indices = seen.map((s) => order.indexOf(s))
    expect([...indices].sort((a, b) => a - b)).toEqual(indices) // already in fixed order
    console.log(`[world-spec] groups shown: ${seen.join(', ')}`)
    await page.screenshot({ path: `${SHOT_DIR}/world-03-grouped-panel.png` })

    // Click the first connection entry → it becomes the selected node
    const firstEntry = connections.locator('button').first()
    const entryLabel = (await firstEntry.locator('span span').first().textContent()).trim()
    await firstEntry.click()
    await expect(
      page.getByTestId('world-node-panel').getByText(entryLabel, { exact: true }).first()
    ).toBeVisible()
    // And the connections list now belongs to the new node (its own groups render)
    await expect(page.getByTestId('world-node-connections')).toBeVisible()
    console.log(`[world-spec] re-anchored onto: ${entryLabel}`)
    await page.screenshot({ path: `${SHOT_DIR}/world-04-reanchored.png` })
  })
})
