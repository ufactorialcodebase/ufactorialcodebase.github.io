// src/test/setup.js
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom in this project ships a partial `localStorage` stub whose
// methods (`getItem` / `setItem` / `clear`) are not functions — the
// symptom is `TypeError: localStorage.<method> is not a function`
// in every test that touches it. Replace with a working in-memory
// implementation once, at setup time, so component tests that read
// feature flags (VaultLayout, FeatureFlagsSection, IconRail) can
// exercise real storage instead of throwing.
if (typeof globalThis.localStorage?.setItem !== 'function') {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(String(k), String(v)) },
    removeItem: (k) => { store.delete(String(k)) },
    clear: () => { store.clear() },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size },
  }
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
