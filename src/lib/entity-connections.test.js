// src/lib/entity-connections.test.js
import { describe, it, expect } from 'vitest'
import { entityConnections } from './entity-connections'

const WORLD = {
  nodes: [
    { id: 'you', label: 'You', type: 'you' },
    { id: 'e1', label: 'Sarah', type: 'person' },
    { id: 'e2', label: 'Acme', type: 'organization' },
    { id: 'e3', label: 'Karwar', type: 'place' },
    { id: 't1', label: 'Baby prep', type: 'topic' },
  ],
  edges: [
    { id: 'rel-1', source: 'e1', target: 'e2', label: 'works_at' },
    { id: 'rel-2', source: 'e3', target: 'e1', label: 'lives_in' },
    { source: 'you', target: 'e1', label: 'spouse' },
    { source: 't1', target: 'e1', label: 'mentioned_in' },
    { id: 'rel-3', source: 'e2', target: 'e3', label: 'located_in' },
  ],
}

describe('entityConnections', () => {
  it('returns entity-to-entity edges for both directions', () => {
    const conns = entityConnections('e1', WORLD)
    expect(conns.map((c) => c.otherId).sort()).toEqual(['e2', 'e3'])
  })

  it('excludes the you-edge and topic links', () => {
    const conns = entityConnections('e1', WORLD)
    expect(conns.some((c) => c.otherId === 'you')).toBe(false)
    expect(conns.some((c) => c.otherId === 't1')).toBe(false)
  })

  it('humanizes labels and carries the relationship row id', () => {
    const conns = entityConnections('e1', WORLD)
    const acme = conns.find((c) => c.otherId === 'e2')
    expect(acme.relation).toBe('works at')
    expect(acme.relId).toBe('rel-1')
  })

  it('sorts by the other label', () => {
    const conns = entityConnections('e1', WORLD)
    expect(conns.map((c) => c.otherLabel)).toEqual(['Acme', 'Karwar'])
  })

  it('dedupes identical (other, relation) pairs', () => {
    const world = {
      nodes: WORLD.nodes,
      edges: [
        { id: 'a', source: 'e1', target: 'e2', label: 'works_at' },
        { id: 'b', source: 'e2', target: 'e1', label: 'works_at' },
      ],
    }
    expect(entityConnections('e1', world).length).toBe(1)
  })

  it('handles null world / unknown entity', () => {
    expect(entityConnections('e1', null)).toEqual([])
    expect(entityConnections(null, WORLD)).toEqual([])
    expect(entityConnections('missing', WORLD)).toEqual([])
  })
})
