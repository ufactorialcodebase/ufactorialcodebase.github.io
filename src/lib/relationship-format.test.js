// src/lib/relationship-format.test.js
import { describe, it, expect } from 'vitest'
import { humanizeRelationship, normalizeRelationship } from './relationship-format'

describe('relationship label round-trip', () => {
  it('humanizes underscores for display', () => {
    expect(humanizeRelationship('extended_family')).toBe('extended family')
    expect(humanizeRelationship('in_law')).toBe('in law')
    expect(humanizeRelationship('mother')).toBe('mother')
  })

  it('normalizes typed labels back to snake_case', () => {
    expect(normalizeRelationship('extended family')).toBe('extended_family')
    expect(normalizeRelationship('  Works  At ')).toBe('works_at')
    expect(normalizeRelationship('Mother')).toBe('mother')
  })

  it('round-trips stably: humanize → normalize → humanize', () => {
    for (const stored of ['extended_family', 'in_law', 'works_at', 'mother']) {
      expect(normalizeRelationship(humanizeRelationship(stored))).toBe(stored)
    }
  })

  it('passes through empty values', () => {
    expect(humanizeRelationship('')).toBe('')
    expect(normalizeRelationship(null)).toBe(null)
  })
})
