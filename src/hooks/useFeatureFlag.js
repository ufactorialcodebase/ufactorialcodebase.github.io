import { useState, useEffect } from 'react'

const STORAGE_KEY = 'hridai_features'

function readFlags() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Read a per-user feature flag.
 *
 * Resolution order:
 *   1. localStorage `hridai_features.<flagName>` (per-device, instant)
 *   2. import.meta.env.VITE_<FLAGNAME>_DEFAULT === 'true' (env override for QA preview)
 *   3. false
 *
 * @param {string} flagName e.g. 'vault_redesign'
 * @returns {boolean}
 */
export function useFeatureFlag(flagName) {
  const [enabled, setEnabled] = useState(() => readFlags()[flagName] === true)

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setEnabled(readFlags()[flagName] === true)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [flagName])

  // Env override — applied last (highest precedence for QA preview builds)
  const envKey = `VITE_${flagName.toUpperCase()}_DEFAULT`
  if (import.meta.env[envKey] === 'true') return true

  return enabled
}

/**
 * Write a feature flag to localStorage (used by the Profile toggle).
 */
export function setFeatureFlag(flagName, value) {
  const flags = readFlags()
  flags[flagName] = !!value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  // Synthesise a storage event for the current tab (default storage event only fires across tabs).
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
}
