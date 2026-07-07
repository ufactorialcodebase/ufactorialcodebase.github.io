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
