/**
 * Entity view: entity-to-entity connections + name / relationship editing.
 *
 * Runs as the owner's TEST-project account (populated graph) via an
 * admin-minted session. The test EDITS real rows (name, relationship
 * label) and restores the exact original values in afterAll via the API,
 * so the account ends unchanged.
 *
 * Runtime requirements: same as world-view-features.spec.js.
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SUPABASE_REF = 'hruvdrxbzghqyrfecbxm'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY
const EMAIL = 'pratikcpednekar@gmail.com'
const API = 'http://localhost:8000/api'
const SHOT_DIR = 'e2e/screenshots'

let session = null
let target = null       // person entity with >=1 entity-entity edge
let targetEdge = null   // one of its edges {id, label, otherLabel}
let originalEntity = null

function authHeaders() {
  return { Authorization: `Bearer ${session.access_token}` }
}

test.describe.serial('Entity view: connections + editing', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set').toBeTruthy()
    expect(ANON_KEY, 'E2E_SUPABASE_ANON_KEY must be set').toBeTruthy()
    expect(SUPABASE_URL).toContain(SUPABASE_REF)

    const linkRes = await request.post(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      data: { type: 'magiclink', email: EMAIL },
    })
    expect(linkRes.ok()).toBeTruthy()
    const linkData = await linkRes.json()
    const tokenHash = linkData.hashed_token || linkData.properties?.hashed_token
    const verifyRes = await request.post(`${SUPABASE_URL}/auth/v1/verify`, {
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      data: { type: 'magiclink', token_hash: tokenHash },
    })
    expect(verifyRes.ok()).toBeTruthy()
    session = await verifyRes.json()

    // Pick a PERSON with an entity-to-entity edge (People tab defaults to
    // the person filter). World edges now carry the relationship row id.
    const world = await (await request.get(`${API}/vault/world`, { headers: authHeaders() })).json()
    const nodesById = new Map(world.nodes.map((n) => [n.id, n]))
    for (const n of world.nodes) {
      if (n.id === 'you' || n.type !== 'person') continue
      const edge = world.edges.find((e) => {
        if (!e.id) return false // only kg_relationships edges are editable
        const touches = e.source === n.id || e.target === n.id
        if (!touches) return false
        const other = nodesById.get(e.source === n.id ? e.target : e.source)
        return other && other.id !== 'you' && other.type !== 'topic'
      })
      if (edge) {
        const otherId = edge.source === n.id ? edge.target : edge.source
        target = n
        targetEdge = {
          id: edge.id,
          label: (edge.label || '').replace(/_/g, ' '),
          rawLabel: edge.label,
          otherLabel: nodesById.get(otherId).label,
        }
        break
      }
    }
    expect(target, 'account needs a person with an entity-entity relationship').toBeTruthy()
    console.log(`[entity-spec] target: ${target.label} —(${targetEdge.label})→ ${targetEdge.otherLabel}`)

    originalEntity = await (await request.get(`${API}/vault/entities/${target.id}`, { headers: authHeaders() })).json()
  })

  test.afterAll(async ({ request }) => {
    if (!session) return
    // Exact restore: entity name/aliases/relationship_to_self + edge label.
    if (originalEntity) {
      await request.put(`${API}/vault/entities/${target.id}`, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        data: {
          name: originalEntity.canonical_name || originalEntity.name,
          aliases: originalEntity.aliases || [],
          relationship_to_self: originalEntity.relationship_to_self || undefined,
        },
      })
    }
    if (targetEdge) {
      await request.put(`${API}/vault/relationships/${targetEdge.id}`, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        data: { relationship_type: targetEdge.rawLabel },
      })
    }
    console.log('[entity-spec] originals restored')
  })

  async function openPeople(page) {
    await page.addInitScript(([ref, sess]) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(sess))
      localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
      localStorage.setItem('hridai_beta_acknowledged', 'true')
      localStorage.setItem('hridai_onboarding_complete', 'true')
      localStorage.setItem('hridai_spotlight_tour_complete', 'true')
      localStorage.setItem('hridai_tab_hint_people', 'true')
    }, [SUPABASE_REF, session])
    await page.goto('/vault/people', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/vault\/people/, { timeout: 15_000 })
  }

  async function openTargetPanel(page, name = null) {
    await page.getByText(name || target.label, { exact: true }).first().click()
    await expect(page.getByTestId('entity-connections')).toBeVisible({ timeout: 10_000 })
  }

  test('panel shows entity-to-entity connections with click-through', async ({ page }) => {
    await openPeople(page)
    await openTargetPanel(page)
    const conns = page.getByTestId('entity-connections')
    await expect(conns.getByText(targetEdge.otherLabel, { exact: true })).toBeVisible()
    await expect(conns.getByText(targetEdge.label).first()).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/entity-01-connections.png` })

    // Click-through: the connected entity becomes the selected one
    await conns.getByText(targetEdge.otherLabel, { exact: true }).click()
    await expect(
      page.getByRole('heading', { name: targetEdge.otherLabel }).or(
        page.getByText(targetEdge.otherLabel, { exact: true }).first()
      ).first()
    ).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/entity-02-clickthrough.png` })
  })

  test('relationship label edits persist across reload', async ({ page }) => {
    await openPeople(page)
    await openTargetPanel(page)
    const conns = page.getByTestId('entity-connections')

    const putDone = page.waitForResponse((r) =>
      r.url().includes('/vault/relationships/') && r.request().method() === 'PUT' && r.ok()
    )
    await conns.getByText(targetEdge.label).first().click()
    const input = page.locator("input:focus")
    await input.fill('e2e-edited-label')
    await input.press('Enter')
    await putDone

    await page.reload({ waitUntil: 'domcontentloaded' })
    await openTargetPanel(page)
    await expect(page.getByTestId('entity-connections').getByText('e2e-edited-label')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/entity-03-relation-edited.png` })
  })

  test('entity rename persists, old name becomes an alias', async ({ page }) => {
    await openPeople(page)
    await openTargetPanel(page)

    const newName = `${target.label}-e2e`
    const putDone = page.waitForResponse((r) =>
      r.url().includes('/vault/entities/') && r.request().method() === 'PUT' && r.ok()
    )
    // The header name InlineEdit is inside the side panel
    await page.getByTestId('entity-name-edit').getByText(target.label, { exact: true }).click()
    const input = page.locator("input:focus")
    await input.fill(newName)
    await input.press('Enter')
    await putDone

    await page.reload({ waitUntil: 'domcontentloaded' })
    await openTargetPanel(page, newName)
    // New name shows; old name is now an alias chip
    await expect(page.getByText(newName, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(target.label, { exact: true }).first()).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/entity-04-renamed-with-alias.png` })
  })
})
