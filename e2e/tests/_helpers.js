// Shared helpers for beta-polish-batch-1 playwright tests.
// Every test opens the vault as the authenticated test user (pratikcpednekar_test2
// on the test Supabase project). Auth is loaded from the shared storageState
// so tests never hit the login screen themselves.

const FEATURE_FLAGS = { vault_redesign: true }

export async function primeVault(page) {
  await page.addInitScript((flags) => {
    localStorage.setItem('hridai_features', JSON.stringify(flags))
    localStorage.setItem('hridai_beta_acknowledged', 'true')
  }, FEATURE_FLAGS)
}

export async function gotoVault(page, path = '/vault/chat') {
  await primeVault(page)
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  // Guardrail: if auth expired we bounce to /signup — fail fast with a
  // clear message so the developer knows to re-run auth-bootstrap.js.
  await page.waitForURL(/\/vault(\/|$)/, { timeout: 15_000 })
}

export async function waitForChatReady(page) {
  // Chat is ready when the composer textarea is enabled and greeting has landed
  // (or empty-state is shown). We wait for the greeting bubble OR the composer.
  await page.waitForSelector('textarea', { timeout: 30_000 })
  // Small settle so the greeting SSE completes before assertions
  await page.waitForTimeout(500)
}
