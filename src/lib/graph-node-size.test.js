import { describe, it, expect } from 'vitest'
import {
  computeNodeRadius,
  NODE_SIZE_MODE,
  FIXED_RADII,
  FREQUENCY_RADIUS,
} from './graph-node-size.js'

describe('computeNodeRadius', () => {
  it('always returns "you" radius for the you node regardless of mode', () => {
    const you = { id: 'you', type: 'self' }
    expect(computeNodeRadius(you, 'frequency')).toBe(FIXED_RADII.you)
    expect(computeNodeRadius(you, 'fixed')).toBe(FIXED_RADII.you)
  })

  it('returns default fallback for unknown / missing nodes', () => {
    expect(computeNodeRadius(null, 'frequency')).toBe(FIXED_RADII.default)
    expect(computeNodeRadius(undefined, 'fixed')).toBe(FIXED_RADII.default)
  })

  it('in fixed mode: uses type-based defaults (topic = 10, other = 12)', () => {
    const topic = { id: 't1', type: 'topic', mention_count: 100 }
    const person = { id: 'p1', type: 'person', mention_count: 100 }
    expect(computeNodeRadius(topic, 'fixed')).toBe(FIXED_RADII.topic)
    expect(computeNodeRadius(person, 'fixed')).toBe(FIXED_RADII.default)
  })

  it('in frequency mode with missing mention_count: falls back to type default', () => {
    const person = { id: 'p1', type: 'person' }
    expect(computeNodeRadius(person, 'frequency')).toBe(FIXED_RADII.default)
    const topic = { id: 't1', type: 'topic' }
    expect(computeNodeRadius(topic, 'frequency')).toBe(FIXED_RADII.topic)
  })

  it('in frequency mode with 0 mentions: returns base radius (10)', () => {
    const p = { id: 'p1', type: 'person', mention_count: 0 }
    // base + log(1) * k = 10 + 0 = 10
    expect(computeNodeRadius(p, 'frequency')).toBe(FREQUENCY_RADIUS.base)
  })

  it('in frequency mode: radius grows with mention_count', () => {
    const r0 = computeNodeRadius({ id: 'a', type: 'person', mention_count: 0 }, 'frequency')
    const r5 = computeNodeRadius({ id: 'a', type: 'person', mention_count: 5 }, 'frequency')
    const r20 = computeNodeRadius({ id: 'a', type: 'person', mention_count: 20 }, 'frequency')
    expect(r5).toBeGreaterThan(r0)
    expect(r20).toBeGreaterThan(r5)
  })

  it('in frequency mode: never exceeds max cap even for very-mentioned nodes', () => {
    const p = { id: 'p1', type: 'person', mention_count: 10000 }
    expect(computeNodeRadius(p, 'frequency')).toBe(FREQUENCY_RADIUS.max)
  })

  it('in frequency mode: never drops below min floor', () => {
    // 0 mentions = base = min; anything negative or weird also floors to min.
    const p = { id: 'p1', type: 'person', mention_count: -5 }
    // Negative counts get treated as "no data" per canScale guard → falls back.
    // Verify EITHER floor behaviour (fallback = 12) OR the min clamp (10).
    const r = computeNodeRadius(p, 'frequency')
    expect(r).toBeGreaterThanOrEqual(FREQUENCY_RADIUS.min)
  })

  it('default mode is what NODE_SIZE_MODE says — flipping the constant flips behaviour', () => {
    // Sanity: the module-level constant is what ForceGraph will pass in
    // when no explicit mode is given. Confirm we're currently on
    // 'frequency' so the current wire-up is exercised, not 'fixed'.
    expect(NODE_SIZE_MODE).toBe('frequency')
    const p = { id: 'p1', type: 'person', mention_count: 10 }
    expect(computeNodeRadius(p)).toBe(computeNodeRadius(p, 'frequency'))
  })
})
