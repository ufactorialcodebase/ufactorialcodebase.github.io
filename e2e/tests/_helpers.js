// Shared helpers for beta-polish-batch-1 playwright tests.
// Every test opens the vault as the authenticated test user (pratikcpednekar_test2
// on the test Supabase project). Auth is loaded from the shared storageState
// so tests never hit the login screen themselves.

import { expect } from '@playwright/test'

const FEATURE_FLAGS = { vault_redesign: true }

/**
 * Drive the code-first signup form the way a real user does now:
 * access code and consent boxes come first; email/password (and Google)
 * stay disabled until the code validates AND both boxes are checked.
 * Checking the first box moves focus off the code field, firing the
 * blur-triggered /api/auth/validate call.
 */
export async function signupViaUI(page, { code, email, password }) {
  await page.goto('/signup')
  await page.fill('#access-code', code)
  const validateResponse = page.waitForResponse(
    (resp) => resp.url().includes('/auth/validate') && resp.request().method() === 'POST',
    { timeout: 10_000 }
  )
  await page.locator('input[type="checkbox"]').nth(0).check()
  await validateResponse
  await page.locator('input[type="checkbox"]').nth(1).check()
  // The gated fields unlock once the validation state lands.
  await expect(page.locator('#signup-email')).toBeEnabled({ timeout: 5_000 })
  await page.fill('#signup-email', email)
  await page.fill('#signup-password', password)
  await page.locator('form').getByRole('button', { name: 'Create account' }).click()
}

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
