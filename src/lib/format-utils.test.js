import { describe, it, expect } from 'vitest'
import { formatDateRibbon, formatMessageTime, localDayKey, timeAgo, daysUntilDate } from './format-utils.js'

// All ribbon assertions use a fixed "now" so the tests survive being run on
// any weekday. now = Wed, Jul 8 2026, 15:00 local.
const NOW = new Date(2026, 6, 8, 15, 0, 0)

describe('formatDateRibbon', () => {
  it('labels same-day as "Today"', () => {
    expect(formatDateRibbon(new Date(2026, 6, 8, 3, 0, 0), NOW)).toBe('Today')
    expect(formatDateRibbon(new Date(2026, 6, 8, 22, 30, 0), NOW)).toBe('Today')
  })

  it('labels prior day as "Yesterday"', () => {
    expect(formatDateRibbon(new Date(2026, 6, 7, 23, 59, 0), NOW)).toBe('Yesterday')
    expect(formatDateRibbon(new Date(2026, 6, 7, 0, 0, 0), NOW)).toBe('Yesterday')
  })

  it('labels 2–6 days ago with the full weekday name', () => {
    expect(formatDateRibbon(new Date(2026, 6, 6, 12, 0, 0), NOW)).toBe('Monday')
    expect(formatDateRibbon(new Date(2026, 6, 5, 12, 0, 0), NOW)).toBe('Sunday')
    expect(formatDateRibbon(new Date(2026, 6, 3, 12, 0, 0), NOW)).toBe('Friday')
    expect(formatDateRibbon(new Date(2026, 6, 2, 12, 0, 0), NOW)).toBe('Thursday')
  })

  it('labels 7+ days ago as "Weekday, Mon DD"', () => {
    expect(formatDateRibbon(new Date(2026, 6, 1, 12, 0, 0), NOW)).toBe('Wed, Jul 1')
    expect(formatDateRibbon(new Date(2026, 5, 15, 12, 0, 0), NOW)).toBe('Mon, Jun 15')
    expect(formatDateRibbon(new Date(2025, 11, 25, 12, 0, 0), NOW)).toBe('Thu, Dec 25')
  })

  it('returns null for bad input', () => {
    expect(formatDateRibbon(null, NOW)).toBeNull()
    expect(formatDateRibbon('not a date', NOW)).toBeNull()
  })
})

describe('formatMessageTime', () => {
  it('formats today as HH:MM 24h', () => {
    const now = new Date()
    const iso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 7).toISOString()
    expect(formatMessageTime(iso)).toBe('14:07')
  })

  it('returns null for bad input', () => {
    expect(formatMessageTime(null)).toBeNull()
    expect(formatMessageTime('bogus')).toBeNull()
  })
})

describe('localDayKey', () => {
  it('collapses same local day to same key regardless of time', () => {
    const a = localDayKey(new Date(2026, 6, 8, 0, 0).toISOString())
    const b = localDayKey(new Date(2026, 6, 8, 23, 59).toISOString())
    expect(a).toBe(b)
  })
  it('separates adjacent days', () => {
    const a = localDayKey(new Date(2026, 6, 8, 12).toISOString())
    const b = localDayKey(new Date(2026, 6, 9, 12).toISOString())
    expect(a).not.toBe(b)
  })
})

// ISS-248: persona-demo anchor overrides "now". These tests cover the
// key invariant: passing an explicit `now` makes the function agree
// with the caller's frame regardless of what the browser thinks the
// real time is.
describe('formatDateRibbon (persona anchor)', () => {
  // Alex's frozen story anchor: June 20, 2026
  const ALEX_NOW = new Date(2026, 5, 20, 10, 0, 0)

  it('with story-time anchor, "today" is anchor-relative not real-Date.now()', () => {
    // A message dated June 20 is Today from Alex's frame, even though
    // real "now" would treat it as months ago.
    const june20 = new Date(2026, 5, 20, 14, 0, 0)
    expect(formatDateRibbon(june20, ALEX_NOW)).toBe('Today')
  })

  it('accepts an ISO string as `now`', () => {
    const iso = '2026-06-20T10:00:00Z'
    const june19 = new Date(2026, 5, 19, 14, 0, 0)
    expect(formatDateRibbon(june19, iso)).toBe('Yesterday')
  })

  it('accepts an epoch ms as `now`', () => {
    const ms = new Date(2026, 5, 20, 10, 0, 0).getTime()
    const june14 = new Date(2026, 5, 14, 12, 0, 0)
    // 6 days ago → weekday name
    expect(formatDateRibbon(june14, ms)).toBeTruthy()
  })

  it('with no `now` given, falls back to real Date.now()', () => {
    // Sanity: this is the pre-ISS-248 behaviour, still works.
    expect(formatDateRibbon(new Date(2000, 0, 1))).toMatch(/,/)  // old date → "Weekday, Mon DD"
  })
})

describe('timeAgo (persona anchor)', () => {
  const ALEX_NOW = new Date(2026, 5, 20, 10, 0, 0)

  it('with story-time anchor, "3 days ago" is anchor-relative', () => {
    const june17 = new Date(2026, 5, 17, 10, 0, 0)
    expect(timeAgo(june17.toISOString(), ALEX_NOW)).toBe('3 days ago')
  })

  it('anchor-relative "Today" holds even when real now is months later', () => {
    // June 20 mention, story anchor is June 20 → Today.
    const june20 = new Date(2026, 5, 20, 8, 0, 0)
    expect(timeAgo(june20.toISOString(), ALEX_NOW)).toBe('Today')
  })

  it('with no `now`, falls back to real Date.now()', () => {
    expect(timeAgo(new Date(2000, 0, 1).toISOString())).toContain('months ago')
  })
})

describe('daysUntilDate (persona anchor)', () => {
  const ALEX_NOW = new Date(2026, 5, 20, 10, 0, 0)  // June 20, 2026

  it('with story-time anchor, "days until" is anchor-relative', () => {
    // Alex's June 21 date is 1 day away from June 20, not months from real-now.
    expect(daysUntilDate('06-21', ALEX_NOW)).toBe(1)
  })

  it('wraps to next year when the date is in the anchor-relative past', () => {
    // June 19 already passed from June 20's frame → wraps to next year's June 19.
    // Days from Jun 20 2026 to Jun 19 2027 ≈ 364.
    expect(daysUntilDate('06-19', ALEX_NOW)).toBeGreaterThan(360)
  })

  it('with no `now`, falls back to real Date.now()', () => {
    // Just verify it returns a non-null number — value depends on real today.
    expect(typeof daysUntilDate('12-25')).toBe('number')
  })
})
