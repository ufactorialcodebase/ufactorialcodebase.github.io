/**
 * Code-first signup + Google OAuth flow (replaces the ISS-236 (3a) suite
 * that exercised the now-removed /complete-signup page).
 *
 * New flow under test:
 *   1. /signup asks for the access code + T&C/age consent FIRST. Until the
 *      code validates AND both boxes are checked, email/password and the
 *      Google button are disabled.
 *   2. Clicking "Continue with Google" stashes the validated code + consent
 *      in sessionStorage (survives the same-tab OAuth round trip).
 *   3. /auth/callback finishes signup itself for a first-time identity:
 *      complete_signup RPC with the stashed code, then acceptance_log rows.
 *      There is NO second form. A first-time identity arriving without a
 *      stash (e.g. new user clicked Google on the Sign in tab) is signed out
 *      and bounced back to /signup with an explanation.
 *
 * SCOPE NOTE (unchanged from the previous suite): the Google provider is not
 * enabled on TEST Supabase, so the Google consent screen itself is not
 * automatable. Everything on OUR side of the redirect is:
 *   - the pre-redirect gate + stash (oauth-02 intercepts the /authorize
 *     navigation before it leaves localhost), and
 *   - the post-redirect callback logic, driven with a real Supabase session
 *     minted via GoTrue's admin generate_link (all auth methods converge to
 *     the identical session shape — same inferred equivalence as before).
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const RUN_ID = Date.now()
const SHOT_DIR = 'e2e/screenshots'
const CODE = `E2E-OAUTH-${RUN_ID}`

const STASH_CODE_KEY = 'hridai_pending_signup_code'
const STASH_CONSENT_KEY = 'hridai_pending_signup_consent'

function adminHeaders() {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' }
}

async function mintCode(request, code, fields) {
  const insert = await request.post(`${SUPABASE_URL}/rest/v1/demo_access_codes`, {
    headers: adminHeaders(), data: { code, ...fields },
  })
  expect(insert.ok()).toBeTruthy()
}

/** Unlock the signup form: valid code + both consent boxes. */
async function unlockSignupGate(page, code) {
  await page.goto('/signup')
  await page.fill('#access-code', code)
  const validateResponse = page.waitForResponse(
    (resp) => resp.url().includes('/auth/validate') && resp.request().method() === 'POST',
    { timeout: 10_000 }
  )
  await page.locator('input[type="checkbox"]').nth(0).check() // blurs the code field
  await validateResponse
  await page.locator('input[type="checkbox"]').nth(1).check()
  await expect(page.locator('#signup-email')).toBeEnabled({ timeout: 5_000 })
}

/**
 * Simulate "a provider just authenticated `email`": mint a verify link via
 * GoTrue's admin generate_link, harvest the session tokens from its /verify
 * redirect WITHOUT following it, and deliver them to this worktree's own
 * /auth/callback (same mechanism as the previous suite; detectSessionInUrl
 * works from any origin the tokens are delivered to).
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

  const fragment = location.includes('#') ? location.split('#')[1] : ''
  const query = location.includes('?') ? location.split('?')[1].split('#')[0] : ''
  return `${baseURL}/auth/callback${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}`
}

/** Seed the signup-intent stash on every page load, as if the user had just
 * clicked the (unlocked) Google button before the OAuth redirect. */
async function seedStash(page, code) {
  await page.addInitScript(([codeKey, consentKey, c]) => {
    sessionStorage.setItem(codeKey, c)
    sessionStorage.setItem(consentKey, 'true')
  }, [STASH_CODE_KEY, STASH_CONSENT_KEY, code])
}

test.describe.serial('Code-first signup: gating + OAuth completion', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set').toBeTruthy()
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
    await mintCode(request, CODE, {
      mode: 'unified', max_uses: 3, use_count: 0, is_active: true,
      notes: '{"source":"e2e","purpose":"code-first oauth auto-complete"}',
    })
  })

  test('oauth-01-signup-methods-locked-until-code-and-consent', async ({ page }) => {
    await page.goto('/signup')
    const google = page.getByRole('button', { name: /continue with google/i })
    const emailInput = page.locator('#signup-email')

    // Everything gated at first paint.
    await expect(google).toBeDisabled()
    await expect(emailInput).toBeDisabled()
    await expect(page.locator('form').getByRole('button', { name: 'Create account' })).toBeDisabled()
    await page.screenshot({ path: `${SHOT_DIR}/oauth-01-locked.png` })

    // Valid code + both boxes unlocks every method…
    await unlockSignupGate(page, CODE)
    await expect(google).toBeEnabled()
    await page.screenshot({ path: `${SHOT_DIR}/oauth-01-unlocked.png` })

    // …and unchecking a consent box re-locks them.
    await page.locator('input[type="checkbox"]').nth(1).uncheck()
    await expect(google).toBeDisabled()
    await expect(emailInput).toBeDisabled()

    // Sign in tab: Google stays available with no gate (returning users).
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeEnabled()
  })

  test('oauth-02-google-click-stashes-code-and-consent-before-redirect', async ({ page }) => {
    await unlockSignupGate(page, CODE)

    // Block the navigation to GoTrue's /authorize so the test never leaves
    // localhost — the stash must already be written by then.
    await page.route('**/auth/v1/authorize*', (route) => route.abort('aborted'))
    await page.getByRole('button', { name: /continue with google/i }).click()

    await expect
      .poll(async () => page.evaluate(([k]) => sessionStorage.getItem(k), [STASH_CODE_KEY]), { timeout: 5_000 })
      .toBe(CODE)
    const consent = await page.evaluate(([k]) => sessionStorage.getItem(k), [STASH_CONSENT_KEY])
    expect(consent).toBe('true')
  })

  test('oauth-03-callback-auto-completes-first-time-signup', async ({ page, request, baseURL }) => {
    const email = `e2e.oauth03.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `OAuthTest!03${RUN_ID}`)

    await seedStash(page, CODE)
    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })

    // No "One more step" form — the callback finishes signup on its own and
    // lands the user in the app.
    await page.waitForURL(/\/vault\/chat/, { timeout: 30_000 })
    await page.screenshot({ path: `${SHOT_DIR}/oauth-03-auto-complete-vault.png` })

    // DB state: access code claimed via complete_signup…
    const users = await request.get(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=user_id,access_code_id`,
      { headers: adminHeaders() }
    ).then((r) => r.json())
    expect(users[0]?.access_code_id).toBeTruthy()

    // …and the consent given BEFORE the redirect is recorded — exactly the
    // 3 required document types.
    const acc = await request.get(
      `${SUPABASE_URL}/rest/v1/acceptance_log?user_id=eq.${users[0].user_id}&select=document_type`,
      { headers: adminHeaders() }
    ).then((r) => r.json())
    expect(acc.map((r) => r.document_type).sort()).toEqual(['age_18_plus', 'privacy', 'tos'])
  })

  test('oauth-04-returning-identity-goes-straight-to-vault', async ({ page, request, baseURL }) => {
    // Fresh session for oauth-03's now-linked identity: no stash needed,
    // no signup steps — straight in.
    const email = `e2e.oauth03.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `irrelevant-${RUN_ID}`)

    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })
    await page.screenshot({ path: `${SHOT_DIR}/oauth-04-returning-user-vault.png` })
  })

  test('oauth-05-first-time-identity-without-stash-is-bounced-to-signup', async ({ page, request, baseURL }) => {
    // A brand-new user who authenticated with Google WITHOUT going through
    // the code/consent gate (e.g. from the Sign in tab): no account is
    // created, they are signed out and told what to do.
    const email = `e2e.oauth05.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `OAuthTest!05${RUN_ID}`)

    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/signup\?oauth_error=/, { timeout: 20_000 })
    await expect(page.getByText(/enter your access code/i).first()).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/oauth-05-no-stash-bounced.png` })

    // No half-created account row.
    const users = await request.get(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=user_id`,
      { headers: adminHeaders() }
    ).then((r) => r.json())
    expect(users.length).toBe(0)

    // Session was cleared — the half-authenticated identity can't wander
    // into the vault.
    await page.goto('/vault/chat')
    await page.waitForURL(/\/signup/, { timeout: 15_000 })
  })

  test('oauth-06-stashed-code-that-fails-rpc-shows-clean-error', async ({ page, request, baseURL }) => {
    // The code passed blur-validation on /signup but fails complete_signup
    // at the callback (e.g. consumed/deactivated between validate and OAuth
    // return — simulated here with a nonexistent code). The user gets the
    // RPC's clean error back on /signup, not a dead end.
    const email = `e2e.oauth06.${RUN_ID}@e2e.ufactorial.com`
    const callbackUrl = await getCallbackUrlForNewSession(request, baseURL, email, `OAuthTest!06${RUN_ID}`)

    await seedStash(page, 'E2E-OAUTH-NONEXISTENT-XYZ')
    await page.goto(callbackUrl, { waitUntil: 'domcontentloaded' })

    await page.waitForURL(/\/signup\?oauth_error=/, { timeout: 20_000 })
    await expect(page.getByText(/does not exist|invalid|could not be completed/i).first()).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/oauth-06-rpc-failure-clean-error.png` })
  })
})
