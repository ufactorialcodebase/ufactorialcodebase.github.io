import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Security: never ship source maps in production. Vite's default is
    // false; set explicitly because this setting controls how readable
    // the production JS bundle is in DevTools.
    sourcemap: false,
  },
})
