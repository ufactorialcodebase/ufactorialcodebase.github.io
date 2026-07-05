// src/hooks/useDailyLimit.js
//
// Daily usage limit (ISS-214) — single source of truth for the persistent
// "you've hit today's usage limit" state.
//
// State model:
//   { resetsAt: string | null, source: 'greeting' | 'message' | 'mount' | null }
//
// Responsibilities:
//   * hydrate from localStorage on mount (auto-clear if the stored reset
//     time is already past)
//   * live countdown text derived from resetsAt (Xh Ym / Ym / <1m — user's
//     local time math, never surfacing "UTC")
//   * fire `onReset` when the countdown reaches zero so Chat can re-fetch the
//     greeting and re-enable the composer
//   * multi-tab sync via the storage event

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DAILY_LIMIT_FALLBACK_MESSAGE,
  DAILY_LIMIT_STORAGE_KEY,
  clearStoredResetsAt,
  formatRemaining,
  readStoredResetsAt,
  writeStoredResetsAt,
} from '../lib/api/daily-limit.js'

// Tick interval — display granularity is minutes, so 15s catches near-zero
// promptly without churning renders. The final second of a countdown just
// shows "<1m"; there's no per-second display we'd miss.
const TICK_MS = 15000

export function useDailyLimit({ onReset } = {}) {
  // Mount hydration is a LAZY initializer (not a mount useEffect) so
  // isBlocked is correct on the very first render. That lets Chat.jsx's
  // own mount effect skip its greeting fetch when the user is already
  // blocked, instead of firing a doomed request.
  const [resetsAt, setResetsAt] = useState(() => readStoredResetsAt())
  const [message, setMessage] = useState(() =>
    readStoredResetsAt() ? DAILY_LIMIT_FALLBACK_MESSAGE : null
  )
  const [source, setSource] = useState(() =>
    readStoredResetsAt() ? 'mount' : null
  )
  const [nowMs, setNowMs] = useState(() => Date.now())
  const onResetRef = useRef(onReset)

  useEffect(() => { onResetRef.current = onReset }, [onReset])

  // Countdown tick + auto-expiry. resetsAt is always a valid future ISO
  // string by the time it lands in state — the lazy initializer, activate(),
  // and the storage handler all validate before setting — so we don't need
  // to guard against NaN here.
  useEffect(() => {
    if (!resetsAt) return
    const target = Date.parse(resetsAt)
    const check = () => {
      const now = Date.now()
      setNowMs(now)
      if (now >= target) {
        setResetsAt(null)
        setMessage(null)
        setSource(null)
        clearStoredResetsAt()
        try { onResetRef.current?.() } catch (e) { console.warn('daily-limit onReset threw:', e) }
      }
    }
    check() // immediate — catches "loaded page right at reset"
    const id = setInterval(check, TICK_MS)
    return () => clearInterval(id)
  }, [resetsAt])

  // Multi-tab sync — if another tab activates or clears the block, follow.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== DAILY_LIMIT_STORAGE_KEY) return
      if (!e.newValue) {
        setResetsAt(null)
        setMessage(null)
        setSource(null)
        return
      }
      const ts = Date.parse(e.newValue)
      if (!Number.isNaN(ts) && ts > Date.now()) {
        setResetsAt(e.newValue)
        setMessage((prev) => prev || DAILY_LIMIT_FALLBACK_MESSAGE)
        setSource((prev) => prev || 'mount')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const activate = useCallback((nextResetsAt, nextMessage, nextSource) => {
    if (!nextResetsAt) return
    const ts = Date.parse(nextResetsAt)
    if (Number.isNaN(ts) || ts <= Date.now()) return
    writeStoredResetsAt(nextResetsAt)
    setResetsAt(nextResetsAt)
    setMessage(nextMessage || DAILY_LIMIT_FALLBACK_MESSAGE)
    setSource(nextSource || 'message')
    setNowMs(Date.now())
  }, [])

  const clear = useCallback(() => {
    clearStoredResetsAt()
    setResetsAt(null)
    setMessage(null)
    setSource(null)
  }, [])

  const isBlocked = Boolean(resetsAt)
  const remainingMs = resetsAt
    ? Math.max(0, Date.parse(resetsAt) - nowMs)
    : 0
  const remainingText = isBlocked ? formatRemaining(remainingMs) : ''

  return {
    isBlocked,
    source,
    resetsAt,
    message,
    remainingMs,
    remainingText,
    activate,
    clear,
  }
}
