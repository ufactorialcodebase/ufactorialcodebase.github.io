/**
 * ISS-236 — signup/auth flow regression suite.
 *
 * TEST Supabase has "Confirm email" OFF (coordinator-confirmed 2026-07-10):
 * signUp() immediately followed by signIn() succeeds with zero email
 * round-trip. baseline-02 asserts that success path (auto-signin -> /vault/chat).
 *
 * baseline-03/04/05 exercise a DIFFERENT real path: magic-link sign-in
 * (LoginForm's "Send magic link instead", independent of the confirm-email
 * setting). We simulate the email click via GoTrue's admin `generate_link`
 * endpoint (POST /auth/v1/admin/generate_link, service_role key) rather than
 * hand-navigating to a guessed callback URL — `generate_link` returns the
 * EXACT `action_link` the email would contain, including the real
 * `redirect_to` target (defaults to the project's Site URL since the backend
 * passes no `email_redirect_to`). Where that link actually lands the user IS
 * the thing under test, so simulating with a guessed URL would assume the
 * answer. Navigating the browser to the action_link reproduces the email
 * click end-to-end: GoTrue verifies the token and redirects with session
 * tokens in the URL fragment, exactly like a real click.
 *
 * Runtime requirements (documented in docs/dispatch/iss-236-baseline-findings.md):
 *   - frontend dev server on http://localhost:5173
 *   - backend on http://localhost:8000 with SUPABASE_ENV=test
 *   - E2E_SUPABASE_SERVICE_KEY env var = SUPABASE_KEY from backend .env.test
 *     (service_role key for the TEST project hruvdrxbzghqyrfecbxm)
 *
 * Safety: hard-guarded to the TEST Supabase project ref. Refuses to run
 * otherwise.
 */

import { test, expect } from '@playwright/test'

// Fresh, unauthenticated browser state — the repo-wide config preloads a
// signed-in session from /tmp/hridai-e2e-state.json, which would mask the
// entire signup funnel.
test.use({ storageState: { cookies: [], origins: [] } })

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://hruvdrxbzghqyrfecbxm.supabase.co'
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY
const ACCESS_CODE = process.env.E2E_ACCESS_CODE || 'E2E-BASELINE-SIGNUP'

// One identity per run, shared across the serial flow below.
const RUN_ID = Date.now()
// NOTE: reserved TLDs (.test etc.) are rejected by the backend's EmailStr
// validation — use a subdomain of the owner's domain (no MX, mail just drops).
const EMAIL = `e2e.baseline.${RUN_ID}@e2e.ufactorial.com`
const PASSWORD = `E2eBaseline!${RUN_ID}`

const SHOT_DIR = 'e2e/screenshots'

function adminHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

/** Mint the multi-use e2e access code on the TEST project if it doesn't exist. */
async function ensureAccessCode(request) {
  const q = `${SUPABASE_URL}/rest/v1/demo_access_codes?code=eq.${ACCESS_CODE}&select=code,use_count,max_uses,is_active`
  const existing = await request.get(q, { headers: adminHeaders() })
  expect(existing.ok()).toBeTruthy()
  const rows = await existing.json()
  if (rows.length > 0) {
    expect(rows[0].is_active).toBeTruthy()
    expect(rows[0].use_count).toBeLessThan(rows[0].max_uses)
    return
  }
  const insert = await request.post(`${SUPABASE_URL}/rest/v1/demo_access_codes`, {
    headers: adminHeaders(),
    data: {
      code: ACCESS_CODE,
      mode: 'unified',
      max_uses: 500,
      use_count: 0,
      is_active: true,
      notes: '{"cohort_name":"E2E-BASELINE","source":"e2e","description":"ISS-236 baseline signup-flow tests (test project only)"}',
    },
  })
  expect(insert.ok()).toBeTruthy()
}

/**
 * Simulate the user clicking the verification link in their email:
 * ask GoTrue for the exact link the email would contain.
 * Falls back from type=signup to type=magiclink (both confirm the email on
 * verify; signup is what the confirmation email actually uses).
 */
async function generateEmailVerificationLink(request) {
  for (const type of ['signup', 'magiclink']) {
    const body = { type, email: EMAIL }
    if (type === 'signup') body.password = PASSWORD
    const res = await request.post(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      headers: adminHeaders(),
      data: body,
    })
    if (res.ok()) {
      const data = await res.json()
      const link = data.action_link || data.properties?.action_link
      if (link) return { link, type }
    }
  }
  throw new Error('generate_link failed for both signup and magiclink types')
}

test.describe.serial('ISS-236: signup + auth-callback regression suite', () => {
  test.beforeAll(async ({ request }) => {
    expect(SERVICE_KEY, 'E2E_SUPABASE_SERVICE_KEY must be set (SUPABASE_KEY from backend .env.test)').toBeTruthy()
    // Never run this against anything but the TEST project.
    expect(SUPABASE_URL).toContain('hruvdrxbzghqyrfecbxm')
    await ensureAccessCode(request)
  })

  test('baseline-01-try-hridai-button-goes-directly-to-signup', async ({ page }) => {
    await page.goto('/')
    const heroTry = page.locator('a', { hasText: 'Try HridAI' }).first()
    await expect(heroTry).toBeVisible()

    await heroTry.click()

    // FIXED: the hero CTA now navigates straight to /signup — no
    // scroll-then-hunt-for-a-second-button. Whichever "Try HridAI" button
    // the user clicks (hero or the Explore section further down), they land
    // on the signup form directly.
    await page.waitForURL(/\/signup/, { timeout: 10_000 })
    await expect(page.locator('#access-code')).toBeVisible()

    await page.screenshot({ path: `${SHOT_DIR}/baseline-01-try-hridai-goes-to-signup.png`, fullPage: false })
  })

  test('baseline-02-signup-submit-lands-in-app', async ({ page }) => {
    await page.goto('/signup')
    await page.fill('#access-code', ACCESS_CODE)

    // A real user sees the access-code field settle (border color reacts to
    // the blur-triggered /api/auth/validate call) before moving on to fill
    // email/password and hit submit — nobody fills a form faster than the
    // field-level feedback it's giving them. Wait for that call to resolve
    // here so the test mirrors realistic human pacing rather than racing
    // ahead of it.
    const validateResponse = page.waitForResponse(
      (resp) => resp.url().includes('/auth/validate') && resp.request().method() === 'POST',
      { timeout: 10_000 }
    )
    await page.fill('#signup-email', EMAIL) // moves focus off access-code, firing blur
    await validateResponse

    await page.fill('#signup-password', PASSWORD)
    await page.locator('input[type="checkbox"]').nth(0).check()
    await page.locator('input[type="checkbox"]').nth(1).check()
    // The tab toggle and the submit button share the "Create account" label —
    // scope to the form to hit the submit.
    await page.locator('form').getByRole('button', { name: 'Create account' }).click()

    // TEST Supabase has "Confirm email" OFF (coordinator-confirmed via
    // screenshot 2026-07-10): signUp() immediately followed by signIn()
    // succeeds with no email round-trip at all. Auto-signin landing in
    // /vault/chat IS the correct, expected outcome here — not a bug to work
    // around. (PROD's email-confirmation posture may differ; that path is
    // covered by the OAuth-callback correctness check, not this test.)
    await page.waitForURL(/\/vault\/chat/, { timeout: 20_000 })
    await expect(page.getByRole('heading', { name: 'Your HridAI' })).toBeVisible()

    await page.screenshot({ path: `${SHOT_DIR}/baseline-02-signup-success-vault.png` })
  })

  test('baseline-03-magic-link-click-lands-on-homepage-not-app', async ({ page, request }) => {
    const { link, type } = await generateEmailVerificationLink(request)

    // Record where GoTrue will redirect (the email's redirect_to target =
    // project Site URL, since backend passes no email_redirect_to).
    const linkUrl = new URL(link)
    const redirectTo = linkUrl.searchParams.get('redirect_to')
    console.log(`[baseline-03] link type=${type} redirect_to=${redirectTo}`)

    let landedUrl
    try {
      await page.goto(link, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000) // let any client-side auth/redirects run
      landedUrl = page.url()
    } catch (err) {
      // If the Site URL points somewhere unreachable, the link is a dead
      // end — an even harder failure than "lands on the homepage".
      landedUrl = `UNREACHABLE (${redirectTo}) — ${err.message.split('\n')[0]}`
    }
    console.log(`[baseline-03] landed on: ${landedUrl}`)

    // BROKEN TODAY (real, current bug — independent of confirm-email
    // setting): clicking a magic-link-style auth callback does NOT put the
    // user in the app. (The app = /vault/chat; /hridai is the authed
    // try-it-out.) This is the exact path LoginForm's "Send magic link
    // instead" produces for a real user.
    expect(landedUrl).not.toContain('/vault/chat')
    expect(landedUrl).not.toContain('/hridai')

    if (!landedUrl.startsWith('UNREACHABLE')) {
      await page.screenshot({ path: `${SHOT_DIR}/baseline-03-post-verification-landing.png` })
    }
  })

  test('baseline-04-signin-tab-hidden-after-verification-return', async ({ page }) => {
    // The user who ends up back on the signup page after verifying.
    await page.goto('/signup')

    // BROKEN TODAY: the page defaults to the "Create account" tab. The
    // sign-in form is NOT shown — the user has to spot the small "Sign in"
    // toggle and click it. (Nuance vs. dispatch wording: the toggle button
    // IS in the DOM, but sign-in is not the default and its form is hidden.)
    await expect(page.locator('#access-code')).toBeVisible() // signup form showing
    await expect(page.locator('#login-email')).toHaveCount(0) // login form absent
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

    await page.screenshot({ path: `${SHOT_DIR}/baseline-04-signup-tab-default.png` })
  })

  test('baseline-05-signin-tab-when-manually-found-requires-credential-re-entry', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // BROKEN TODAY: even though the user just verified their email, nothing
    // is pre-filled and no session exists — full credential re-entry.
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-email')).toHaveValue('')
    await expect(page.locator('#login-password')).toHaveValue('')

    await page.screenshot({ path: `${SHOT_DIR}/baseline-05-signin-requires-reentry.png` })
  })

  test('baseline-06-join-the-waitlist-lands-on-waitlist-section', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: 'Join the waitlist' }).click()

    // FIXED: this is a plain <a href="/#waitlist"> — a full page load of "/"
    // with a hash. ScrollToTop used to unconditionally force scroll to (0,0)
    // on every route change, fighting the browser's native anchor-scroll and
    // always winning, so the user landed at the top of the homepage and had
    // to find + click ANOTHER "Join the waitlist" link to actually get there.
    await page.waitForURL(/\/#waitlist/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'Join the waitlist' })).toBeInViewport({ timeout: 10_000 })

    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0) // not stuck at the top of the page

    await page.screenshot({ path: `${SHOT_DIR}/baseline-06-waitlist-section-reached.png` })
  })
})
