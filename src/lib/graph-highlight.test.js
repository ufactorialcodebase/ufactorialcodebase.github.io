import { describe, it, expect } from 'vitest'
import {
  bfsDistances,
  glowTierForDistance,
  GLOW_TIERS,
  MAX_HIGHLIGHT_DEGREE,
} from './graph-highlight.js'

// Hand-drawn graph so BFS behaviour is verifiable at a glance.
//
//   you ── A ── B ── C ── D ── E
//    \    |         |
//     F   G ─────── H       (island: I ── J)
const EDGES = [
  { source: 'you', target: 'A' },
  { source: 'you', target: 'F' },
  { source: 'A', target: 'B' },
  { source: 'A', target: 'G' },
  { source: 'B', target: 'C' },
  { source: 'C', target: 'D' },
  { source: 'C', target: 'H' },
  { source: 'D', target: 'E' },
  { source: 'G', target: 'H' },
  { source: 'I', target: 'J' },
]

describe('bfsDistances', () => {
  it('marks the source node as distance 0', () => {
    expect(bfsDistances('you', EDGES).get('you')).toBe(0)
  })

  it('walks undirected — a person\'s neighbours light "you" as 1°', () => {
    const d = bfsDistances('A', EDGES)
    expect(d.get('you')).toBe(1)
    expect(d.get('B')).toBe(1)
    expect(d.get('G')).toBe(1)
  })

  it('respects the 3-hop cutoff', () => {
    const d = bfsDistances('you', EDGES)
    expect(d.get('B')).toBe(2)
    expect(d.get('G')).toBe(2)
    expect(d.get('C')).toBe(3)
    expect(d.get('H')).toBe(3)
    // D, E are ≥4 hops — must be absent from the map
    expect(d.has('D')).toBe(false)
    expect(d.has('E')).toBe(false)
  })

  it('takes the shortest path when multiple exist', () => {
    // C is reachable A → B → C (2) OR A → G → H → C (3). BFS returns 2.
    expect(bfsDistances('A', EDGES).get('C')).toBe(2)
  })

  it('leaves disconnected components out of the map', () => {
    const d = bfsDistances('you', EDGES)
    expect(d.has('I')).toBe(false)
    expect(d.has('J')).toBe(false)
  })

  it('handles d3-mutated edges (source/target as node objects)', () => {
    const mutated = [
      { source: { id: 'you' }, target: { id: 'A' } },
      { source: { id: 'A' }, target: { id: 'B' } },
    ]
    const d = bfsDistances('you', mutated)
    expect(d.get('A')).toBe(1)
    expect(d.get('B')).toBe(2)
  })

  it('returns empty map on bad input', () => {
    expect(bfsDistances(null, EDGES).size).toBe(0)
    expect(bfsDistances('you', null).size).toBe(0)
  })

  it('MAX_HIGHLIGHT_DEGREE matches the number of glow tiers minus the clicked one', () => {
    // Sanity: if you add a 4th non-source tier to GLOW_TIERS, bump the
    // cutoff so BFS actually reaches it.
    expect(GLOW_TIERS.length).toBe(MAX_HIGHLIGHT_DEGREE + 1)
  })
})

describe('glowTierForDistance', () => {
  it('returns null when no distance map is active', () => {
    expect(glowTierForDistance(null, 'A')).toBeNull()
  })

  it('returns null for nodes outside the highlight radius', () => {
    // Node 'X' isn't in the distance map at all (disconnected or 4+ hops).
    const d = new Map([['A', 0]])
    expect(glowTierForDistance(d, 'X')).toBeNull()
  })

  it('maps distance directly to tier index', () => {
    const d = new Map([['A', 0], ['B', 1], ['C', 2], ['D', 3]])
    expect(glowTierForDistance(d, 'A')).toBe(0)
    expect(glowTierForDistance(d, 'B')).toBe(1)
    expect(glowTierForDistance(d, 'C')).toBe(2)
    expect(glowTierForDistance(d, 'D')).toBe(3)
  })

  it('returns null for distances ≥ GLOW_TIERS.length (defensive)', () => {
    const d = new Map([['A', 4], ['B', 99]])
    expect(glowTierForDistance(d, 'A')).toBeNull()
    expect(glowTierForDistance(d, 'B')).toBeNull()
  })

  it('GLOW_TIERS decrease in visual weight as tier index grows', () => {
    // Sanity: tier 0 should be the brightest / biggest halo, tier 3 the
    // subtlest. If someone re-orders, this test catches it.
    for (let i = 0; i < GLOW_TIERS.length - 1; i++) {
      expect(GLOW_TIERS[i].stdDeviation).toBeGreaterThan(GLOW_TIERS[i + 1].stdDeviation)
      expect(GLOW_TIERS[i].floodOpacity).toBeGreaterThan(GLOW_TIERS[i + 1].floodOpacity)
    }
  })
})
