// src/lib/api/daily-limit.js
//
// Daily usage limit (ISS-214) — detect the backend's structured 429 and
// persist the reset time across in-app navigation.
//
// The backend returns HTTP 429 with detail either as a plain STRING
// (rate limit, weekly free-tier limit) or as an object shaped:
//   { code: "daily_cost_ceiling", message: "...", resets_at: "<ISO-8601>" }
// Only the object form is a daily-limit signal. Anything else is left alone
// for its existing handler.

export const DAILY_LIMIT_CODE = 'daily_cost_ceiling'
export const DAILY_LIMIT_STORAGE_KEY = 'hridai.dailyLimitResetsAt'

// Fallback message when we've hydrated the blocked state from localStorage
// without a live 429 — we don't have the fresh copy to hand, so we use the
// canonical backend string. Any subsequent live 429 overrides this.
export const DAILY_LIMIT_FALLBACK_MESSAGE =
  "You've reached today's usage limit. Your conversations are saved — we'll pick up right where we left off when the limit resets."

/**
 * Inspect a parsed 429 body and decide whether it is the daily-cost-ceiling
 * signal. Returns null when it isn't, so callers can fall back to their
 * existing string-detail handling untouched.
 *
 * @param {any} body — the parsed JSON body of a 429 response
 * @returns {{ resetsAt: string, message: string } | null}
 */
export function parseDailyLimit(body) {
  const detail = body && body.detail
  if (!detail || typeof detail !== 'object') return null
  if (detail.code !== DAILY_LIMIT_CODE) return null
  if (typeof detail.resets_at !== 'string' || !detail.resets_at) return null
  return {
    resetsAt: detail.resets_at,
    message: typeof detail.message === 'string' && detail.message
      ? detail.message
      : "You've reached today's usage limit.",
  }
}

export function readStoredResetsAt() {
  try {
    const raw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY)
    if (!raw) return null
    const ts = Date.parse(raw)
    if (Number.isNaN(ts)) {
      localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY)
      return null
    }
    if (ts <= Date.now()) {
      localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY)
      return null
    }
    return raw
  } catch {
    return null
  }
}

export function writeStoredResetsAt(iso) {
  try {
    localStorage.setItem(DAILY_LIMIT_STORAGE_KEY, iso)
  } catch {
    // localStorage disabled — the countdown will still work in-memory; the
    // block just won't survive a hard refresh, which is acceptable degradation.
  }
}

export function clearStoredResetsAt() {
  try {
    localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY)
  } catch { /* noop */ }
}

/**
 * Format remaining ms as "Xh Ym" (>= 1h), "Ym" (< 1h), or "<1m" in the tail.
 * Uses local math on absolute timestamps — never surfaces "UTC" or "midnight".
 */
export function formatRemaining(remainingMs) {
  if (remainingMs <= 0) return '<1m'
  const totalMinutes = Math.floor(remainingMs / 60000)
  if (totalMinutes < 1) return '<1m'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 1) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
