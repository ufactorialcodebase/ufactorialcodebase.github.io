import { describe, it, expect } from 'vitest'
import {
  bfsDistances,
  nodeOpacity,
  edgeOpacity,
  DEGREE_OPACITY,
  REST_OPACITY,
} from './graph-highlight.js'

// A small hand-drawn graph so BFS behaviour is verifiable at a glance.
//
//   you ── A ── B ── C ── D ── E
//    \    |         |
//     F   G ─────── H       (island: I ── J)
//
// Adjacency (undirected):
//   you-A, you-F, A-B, A-G, B-C, C-D, C-H, D-E, G-H, I-J
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
    const d = bfsDistances('you', EDGES)
    expect(d.get('you')).toBe(0)
  })

  it('walks undirected — a person\'s neighbours light "you" as 1°', () => {
    const d = bfsDistances('A', EDGES)
    expect(d.get('you')).toBe(1)
    expect(d.get('B')).toBe(1)
    expect(d.get('G')).toBe(1)
  })

  it('respects the 3-hop cutoff', () => {
    const d = bfsDistances('you', EDGES)
    expect(d.get('you')).toBe(0)
    expect(d.get('A')).toBe(1)
    expect(d.get('F')).toBe(1)
    expect(d.get('B')).toBe(2)
    expect(d.get('G')).toBe(2)
    expect(d.get('C')).toBe(3)
    expect(d.get('H')).toBe(3)
    // D and E are 4+ hops from 'you' via the shortest path; must be absent
    expect(d.has('D')).toBe(false)
    expect(d.has('E')).toBe(false)
  })

  it('takes the shortest path when multiple exist', () => {
    // C has two paths to A: A → B → C (2 hops) and A → G → H → C (3 hops).
    // BFS must return the shorter one.
    const d = bfsDistances('A', EDGES)
    expect(d.get('C')).toBe(2)
  })

  it('leaves disconnected components out of the map', () => {
    const d = bfsDistances('you', EDGES)
    expect(d.has('I')).toBe(false)
    expect(d.has('J')).toBe(false)
  })

  it('handles d3-mutated edges (source/target as node objects)', () => {
    // After d3.forceLink, edge.source and edge.target become node OBJECTS
    // (not id strings). BFS must still work.
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
})

describe('nodeOpacity', () => {
  it('returns full opacity when no distance map is active', () => {
    expect(nodeOpacity(null, 'A')).toBe(1)
  })

  it('scales down by degree', () => {
    const d = new Map([['you', 0], ['A', 1], ['B', 2], ['C', 3]])
    expect(nodeOpacity(d, 'you')).toBe(DEGREE_OPACITY[0])
    expect(nodeOpacity(d, 'A')).toBe(DEGREE_OPACITY[1])
    expect(nodeOpacity(d, 'B')).toBe(DEGREE_OPACITY[2])
    expect(nodeOpacity(d, 'C')).toBe(DEGREE_OPACITY[3])
  })

  it('drops nodes beyond 3° to the REST floor', () => {
    const d = new Map([['you', 0]])
    expect(nodeOpacity(d, 'X')).toBe(REST_OPACITY)
  })
})

describe('edgeOpacity', () => {
  it('returns baseOpacity when no distance map is active', () => {
    expect(edgeOpacity(null, 'A', 'B', 0.5)).toBe(0.5)
  })

  it('takes the FURTHER endpoint\'s degree', () => {
    const d = new Map([['A', 1], ['B', 2], ['C', 3]])
    // A-B: further is B at 2°
    expect(edgeOpacity(d, 'A', 'B', 1)).toBe(DEGREE_OPACITY[2])
    // A-C: further is C at 3°
    expect(edgeOpacity(d, 'A', 'C', 1)).toBe(DEGREE_OPACITY[3])
  })

  it('drops to REST when either endpoint is off-highlight', () => {
    const d = new Map([['A', 1]])
    expect(edgeOpacity(d, 'A', 'X', 1)).toBe(REST_OPACITY)
    expect(edgeOpacity(d, 'X', 'Y', 1)).toBe(REST_OPACITY)
  })

  it('multiplies by baseOpacity so tie strength survives the highlight', () => {
    const d = new Map([['A', 0], ['B', 1]])
    expect(edgeOpacity(d, 'A', 'B', 0.6)).toBe(DEGREE_OPACITY[1] * 0.6)
  })
})
