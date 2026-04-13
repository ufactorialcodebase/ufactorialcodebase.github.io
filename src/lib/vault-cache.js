/**
 * Vault Data Cache — stale-while-revalidate pattern
 *
 * Module-level in-memory cache. Survives tab switches within a session.
 * Clears on page refresh (web) or app force-close (mobile). No disk I/O.
 *
 * Usage in tab components:
 *   import { useVaultData } from '../../lib/vault-cache'
 *   const { data, loading, error } = useVaultData('self', getSelf)
 */

import { useState, useEffect, useRef } from 'react'

// Module-level cache — shared across all components, persists across tab switches
const cache = new Map()

let _demoMode = false

export function setDemoMode(enabled) {
  _demoMode = enabled
}

/**
 * Get cached data for a key, or null if not cached.
 */
export function getCached(key) {
  return cache.has(key) ? cache.get(key) : null
}

/**
 * Set cached data for a key.
 */
export function setCached(key, data) {
  cache.set(key, data)
}

/**
 * Clear a specific key or the entire cache.
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Hook: stale-while-revalidate data fetching for Vault tabs.
 *
 * - If cached data exists, returns it immediately (loading=false)
 * - Fetches fresh data in background regardless
 * - Updates state silently when fresh data arrives
 * - On first load (no cache), shows loading state
 *
 * @param {string} cacheKey - Unique key for this data (e.g., 'self', 'entities', 'topics')
 * @param {Function} fetchFn - Async function that returns the data
 * @param {Object} options - { transform: fn to transform raw response }
 * @returns {{ data, loading, error, refetch }}
 */
export function useVaultData(cacheKey, fetchFn, options = {}) {
  const { transform } = options
  const cached = getCached(cacheKey)
  const [data, setData] = useState(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState(null)
  const fetchRef = useRef(0)

  const doFetch = async () => {
    const fetchId = ++fetchRef.current
    try {
      const result = await fetchFn()
      if (fetchRef.current !== fetchId) return // stale request
      const transformed = transform ? transform(result) : result
      setCached(cacheKey, transformed)
      setData(transformed)
      setLoading(false)
      setError(null)
    } catch (err) {
      if (fetchRef.current !== fetchId) return
      // Only show error if we don't have cached data to show
      if (!getCached(cacheKey)) {
        setError(err.message)
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    // In demo mode, only use cache — don't fetch from API
    if (_demoMode && getCached(cacheKey)) {
      const cached = getCached(cacheKey)
      setData(cached)
      setLoading(false)
      return
    }
    doFetch()
    return () => { fetchRef.current++ } // cancel on unmount
  }, [cacheKey])

  const refetch = () => {
    setLoading(!data)
    setError(null)
    doFetch()
  }

  return { data, loading, error, refetch }
}
