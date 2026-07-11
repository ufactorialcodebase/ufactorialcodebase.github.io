/**
 * ISS-236 (3a) — Google OAuth signup flow.
 *
 * SCOPE NOTE (labeled per coordinator's observed/documented/inferred rule):
 * The Google provider is NOT YET enabled on TEST Supabase (owner action
 * pending — Dashboard → Auth → Providers → Google). A real end-to-end
 * "click Continue with Google → Google consent screen → redirect back" is
 * therefore not automatable here and is UNTESTED by this file (observed
 * fact, not a gap in the code below).
 *
 * What IS tested, and how: the actual code this session built is the
 * /auth/callback + /complete-signup logic — i.e., what happens AFTER any
 * auth method (OAuth or otherwise) hands back a valid Supabase session.
 * That logic only reads `session.user.id` / `session.user.email` and does
 * not know or care whether the session came from Google OAuth or a magic
 * link — both converge to the identical session/JWT shape. So we simulate
 * "a provider just authenticated this user" with GoTrue's admin
 * `generate_link` (magiclink type), the same mechanism baseline-03 already
 * uses, and drive the browser through the real /auth/callback component.
 * This is an INFERRED equivalence (Supabase's documented architecture: all
 * auth methods produce the same session shape), not an OBSERVED Google
 * OAuth run.
 *
 * mc-04's "OAuth email matches existing password account" case (4d) is
 * covered the same way: oauth-03 below simulates a RETURNING identity
 * (access_code_id already set) and confirms /auth/callback routes straight
 * to /vault/chat, skipping /complete-signup — the exact mechanism that
 * governs the merge case IF Supabase's account-linking-by-verified-email
 * setting produces the same auth_id for both sign-in methods (owner-side
 * Dashboard setting, not something this code controls or invents around).
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const RUN_ID = Date.now()
const SHOT_DIR = 'e2e/screenshots'
const CODE = `E2E-OAUTH-${RUN_ID}`

function adminHeaders() {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' }
}

async function mintCode(request, code, fields) {
  const insert = await request.post(`${SUPABASE_URL}/rest/v1/demo_access_codes`, {
    headers: adminHeaders(), data: { code, ...fields },
  })
  expect(insert.ok()).toBeTruthy()
}

/**
 * Simulate "a provider just authenticated `email`": mint a verify link via
 * GoTrue's admin generate_link, then hit GoTrue's own /verify endpoint
 * directly to harvest the session tokens it issues — WITHOUT following its
 * redirect. This sidesteps a pre-existing, already-tracked issue
 * (baseline-03): generate_link's redirect_to is not allow-listed for this
 * worktree's dev port and GoTrue silently substitutes the project's Site
 * URL instead. detectSessionInUrl works from any origin the tokens are
 * delivered to, so we deliver them to THIS worktree's own /auth/callback
 * directly rather than relying on GoTrue's redirect target.
 */
async function getCallbackUrlForNewSession(request, baseURL, email, password) {
  let verifyUrl
  for (const type of ['magiclink', 'signup']) {
    const body = { type, email }
    if (type === 'signup') body.password = password
    const res = await request.post(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      headers: adminHeaders(), data: body,
    })
    if (res.ok()) {
      const data = await res.json()
      const link = data.action_link || data.properties?.action_link
      if (link) { verifyUrl = link; break }
    }
  }
  if (!verifyUrl) throw new Error('generate_link failed')

  const verifyRes = await request.get(verifyUrl, { maxRedirects: 0 })
  const location = verifyRes.headers()['location']
  if (!location) throw new Error(`GoTrue /verify did not redirect (status ${verifyRes.status()})`)

  // location is like "http://localhost:5173/#access_token=...&refresh_token=...&type=..."
  const fragment = location.includes('#') ? location.split('#')[1] : ''
  const query = location.includes('?') ? location.split('?')[1].split('#')[0] : ''
  return `${baseURL}/auth/callback${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}`
}

test.describe.serial('ISS-236 (3a): Google OAuth signup flow', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set').toBeTruthy()
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
    await mintCode(request, CODE, {
      mode: 'unified', max_uses: 2, use_count: 0, is_active: true,
      notes: '{"source":"e2e","purpose":"oauth complete-signup"}',
    })
  })

  test('oauth-01-google-button-visible-alongside-email-password', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    // Email/password form still present — OAuth is additive, not a replacement.
    await expect(page.locator('#access-code')).toBeVisible()
    await expect(page.locator('#signup-email')).toBeVisible()

    // Sign-in tab also gets the button.
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.locator('#login-email')).toBeVisible()

    await page.screenshot({ path: `${SHOT_DIR}/oauth-01-buttons-visible.png` })
  })

  test('oauth-02-first-time-identity-routes-to-complete-signup', async ({ page, request, baseURL }) => {
    const email = `e2e.oauth02.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `OAuthTest!02${RUN_ID}`)

    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/complete-signup/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'One more step' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/oauth-02-complete-signup-page.png` })

    // Finish the flow: enter the access code, accept T&C/age (required —
    // fresh OAuth signups must not skip legal consent), land in the app.
    await page.fill('#oauth-access-code', CODE)
    await page.locator('input[type="checkbox"]').nth(0).check()
    await page.locator('input[type="checkbox"]').nth(1).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })
    await page.screenshot({ path: `${SHOT_DIR}/oauth-02-landed-in-app.png` })

    // access_code_id must actually be populated via complete_signup's RPC path.
    const row = await request.get(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=access_code_id`,
      { headers: adminHeaders() }
    ).then((r) => r.json())
    expect(row[0]?.access_code_id).toBeTruthy()
  })

  test('oauth-03-returning-identity-skips-complete-signup', async ({ page, request, baseURL }) => {
    // Reuse oauth-02's now-linked email — a fresh session for the SAME
    // identity should skip straight to /vault/chat.
    const email = `e2e.oauth02.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `irrelevant-${RUN_ID}`)

    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })
    await page.screenshot({ path: `${SHOT_DIR}/oauth-03-returning-user-vault.png` })
  })

  test('oauth-04-invalid-code-on-complete-signup-shows-clean-error', async ({ page, request, baseURL }) => {
    const email = `e2e.oauth04.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `OAuthTest!04${RUN_ID}`)

    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/complete-signup/, { timeout: 15_000 })

    await page.fill('#oauth-access-code', 'E2E-OAUTH-NONEXISTENT-XYZ')
    await page.locator('input[type="checkbox"]').nth(0).check()
    await page.locator('input[type="checkbox"]').nth(1).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(/does not exist|invalid access code/i)).toBeVisible({ timeout: 15_000 })
    await page.screenshot({ path: `${SHOT_DIR}/oauth-04-invalid-code-error.png` })
  })

  test('oauth-05-complete-signup-requires-tos-and-age-consent', async ({ page, request, baseURL }) => {
    // Regression lock for a real compliance gap: fresh OAuth users landing
    // on /complete-signup must not be able to finish signup without ever
    // seeing T&C/Privacy/age consent (previously only shown on the Create
    // Account tab; OAuth signups skipped it entirely).
    const email = `e2e.oauth05.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `OAuthTest!05${RUN_ID}`)

    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/complete-signup/, { timeout: 15_000 })

    await expect(page.getByText('I am at least 18 years old')).toBeVisible()
    await expect(page.getByText(/I agree to the/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()

    await page.fill('#oauth-access-code', CODE)
    const continueButton = page.getByRole('button', { name: 'Continue' })

    // Neither box checked: submit is blocked.
    await expect(continueButton).toBeDisabled()

    // Only one box checked: still blocked.
    await page.locator('input[type="checkbox"]').nth(0).check()
    await expect(continueButton).toBeDisabled()

    // Both checked: submit is now allowed.
    await page.locator('input[type="checkbox"]').nth(1).check()
    await expect(continueButton).toBeEnabled()
    await page.screenshot({ path: `${SHOT_DIR}/oauth-05-consent-required.png` })
  })
})
