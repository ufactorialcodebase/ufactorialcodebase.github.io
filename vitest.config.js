// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    // Node 25 ships a native WebStorage global whose methods surface as
    // "not a function" without a valid `--localstorage-file` path. Every
    // test that touches localStorage was failing until commit 245c6fd
    // added `NODE_OPTIONS=--no-webstorage` to the npm scripts.
    //
    // Problem with the npm-script approach: it only applies to `npm test`
    // invocations. Bare `npx vitest` or `vitest` bypassed it and
    // localStorage broke again. Setting execArgv at the vitest config
    // level pushes the flag into every spawned worker regardless of how
    // vitest is invoked, making the fix invocation-independent.
    //
    // Vitest 4 removed `poolOptions.forks.execArgv` in favor of the
    // top-level `test.execArgv` used below.
    pool: 'forks',
    execArgv: ['--no-webstorage'],
    // Playwright specs live under e2e/tests/*.spec.js and use the
    // @playwright/test runner — vitest picking them up produces
    // "Playwright Test did not expect test() to be called here."
    exclude: ['**/node_modules/**', 'dist/**', 'e2e/**', '.worktrees/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', 'dist/', '**/*.config.*', 'e2e/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
