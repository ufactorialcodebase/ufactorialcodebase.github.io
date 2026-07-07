import { describe, it, expect } from 'vitest'
import { formatDateRibbon, formatMessageTime, localDayKey } from './format-utils.js'

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
