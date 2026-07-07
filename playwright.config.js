// Playwright config for product-experience/beta-polish-batch-1.
// Tests target a locally running frontend at http://localhost:5173 backed by
// SUPABASE_ENV=test backend at http://localhost:8000. Auth state is loaded
// from /tmp/hridai-e2e-state.json (produced by e2e/auth-bootstrap.js on first
// interactive login as pratikcpednekar_test2 on the test Supabase project).

import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.APP_URL || 'http://localhost:5173'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './e2e/test-results',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: './e2e/playwright-report', open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    storageState: STATE_FILE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1280, height: 900 },
    // Local dev — Supabase and API are on localhost; no network shims.
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
