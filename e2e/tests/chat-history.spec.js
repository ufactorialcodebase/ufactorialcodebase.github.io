/**
 * Device-switch continuation + rolling transcripts, end to end.
 *
 * Each test gets a FRESH browser context (the device-switch analog).
 * The serial flow creates its own timing so it never depends on how
 * recently the account was used:
 *   T1: mount → history strip renders; chat becomes ready
 *   T2: fresh context → within-window session adopted (NO greeting
 *       request), send one real message, capture the session id
 *   T3: fresh context again → same session adopted, the T2 exchange is
 *       visible as history, still no greeting request
 *   T4: Load older messages prepends a page; date ribbon present
 *
 * Costs one real LLM turn (T2). Uses the owner's TEST account via an
 * admin-minted session; nothing is mutated beyond one small chat turn.
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
let continuitySessionId = null

test.describe.serial('Chat history: continuation + rolling transcripts', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set').toBeTruthy()
    expect(ANON_KEY, 'E2E_SUPABASE_ANON_KEY must be set').toBeTruthy()
    expect(SUPABASE_URL).toContain(SUPABASE_REF)

    const linkRes = await request.post(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      data: { type: 'magiclink', email: EMAIL },
    })
    const linkData = await linkRes.json()
    const tokenHash = linkData.hashed_token || linkData.properties?.hashed_token
    const verifyRes = await request.post(`${SUPABASE_URL}/auth/v1/verify`, {
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      data: { type: 'magiclink', token_hash: tokenHash },
    })
    expect(verifyRes.ok()).toBeTruthy()
    session = await verifyRes.json()
  })

  async function openChat(page, { trackGreeting = null } = {}) {
    if (trackGreeting) {
      page.on('request', (req) => {
        if (req.url().includes('/chat/greeting')) trackGreeting.count++
      })
    }
    await page.addInitScript(([ref, sess]) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(sess))
      localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
      localStorage.setItem('hridai_beta_acknowledged', 'true')
      localStorage.setItem('hridai_onboarding_complete', 'true')
      localStorage.setItem('hridai_spotlight_tour_complete', 'true')
    }, [SUPABASE_REF, session])
    await page.goto('/vault/chat', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/vault\/chat/, { timeout: 15_000 })
    // Chat ready = composer enabled
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 30_000 })
  }

  test('T1: mount renders history and becomes ready', async ({ page }) => {
    await openChat(page)
    // Wait for a session to exist — set on greeting completion OR on
    // warm-session adoption. (The first run of this failed because T1
    // finished while its greeting was still in flight, so T2 found no
    // session inside the window.)
    await page.waitForFunction(
      () => !!sessionStorage.getItem('hrdai_session_id'),
      { timeout: 60_000 }
    )
    const bubbles = await page.locator('[data-testid="ai-message-body"]').count()
    expect(bubbles).toBeGreaterThan(0)
    await page.screenshot({ path: `${SHOT_DIR}/hist-01-initial.png` })
  })

  test('T2: fresh context adopts the warm session and continues it', async ({ page }) => {
    // T1 left a session with recent activity → this context must adopt it.
    const greeting = { count: 0 }
    await openChat(page, { trackGreeting: greeting })
    await page.waitForTimeout(1500)
    expect(greeting.count, 'no greeting request when continuing').toBe(0)

    // Send one real turn into the adopted session. The composer stays
    // enabled during processing (stop+queue design), so "turn finished" =
    // the stop button turning back into the send button.
    await page.locator('textarea').fill('Continuity check — please reply with just: OK')
    await page.locator('textarea').press('Enter')
    await expect(page.getByLabel('Stop response')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByLabel('Send message')).toBeVisible({ timeout: 120_000 })
    await page.waitForTimeout(1000)

    continuitySessionId = await page.evaluate(() => sessionStorage.getItem('hrdai_session_id'))
    expect(continuitySessionId).toBeTruthy()
    console.log(`[hist-spec] continuity session: ${continuitySessionId}`)
    await page.screenshot({ path: `${SHOT_DIR}/hist-02-sent.png` })
  })

  test('T3: another fresh context = device switch; same session, exchange visible, no greeting', async ({ page }) => {
    const greeting = { count: 0 }
    await openChat(page, { trackGreeting: greeting })
    // Wait for the bootstrap to finish adopting (session id lands)
    await page.waitForFunction(
      () => !!sessionStorage.getItem('hrdai_session_id'),
      { timeout: 30_000 }
    )

    expect(greeting.count, 'no greeting request on device switch').toBe(0)
    const adopted = await page.evaluate(() => sessionStorage.getItem('hrdai_session_id'))
    expect(adopted).toBe(continuitySessionId)
    // The T2 exchange appears as transcript history on the new device
    await expect(page.getByText('Continuity check — please reply with just: OK')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/hist-03-device-switch.png` })
  })

  test('T4: Load older messages prepends a page with date separation', async ({ page }) => {
    await openChat(page)
    await page.waitForTimeout(1500)
    const btn = page.getByTestId('load-older-messages')
    await expect(btn).toBeVisible()

    const before = await page.locator('[data-testid="ai-message-body"]').count()
    await btn.click()
    await expect(async () => {
      const after = await page.locator('[data-testid="ai-message-body"]').count()
      expect(after).toBeGreaterThan(before)
    }).toPass({ timeout: 10_000 })
    await expect(page.getByTestId('date-ribbon').first()).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/hist-04-load-older.png` })
  })
})
