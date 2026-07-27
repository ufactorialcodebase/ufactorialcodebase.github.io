// src/lib/world-view-utils.test.js
import { describe, it, expect } from 'vitest'
import { rankNodeMatches, groupConnections } from './world-view-utils'

const NODES = [
  { id: 'you', label: 'You', type: 'you' },
  { id: 'e1', label: 'Sarah', type: 'person' },
  { id: 'e2', label: 'Sara Lee', type: 'person' },
  { id: 'e3', label: 'Acme Corp', type: 'org' },
  { id: 'e4', label: 'San Francisco', type: 'place' },
  { id: 't1', label: 'Marathon training', type: 'topic' },
  { id: 'e5', label: 'Casa Rara', type: 'org' },
]

describe('rankNodeMatches', () => {
  it('empty or whitespace query matches nothing', () => {
    expect(rankNodeMatches(NODES, '')).toEqual([])
    expect(rankNodeMatches(NODES, '   ')).toEqual([])
  })

  it('matches case-insensitive substrings', () => {
    const ids = rankNodeMatches(NODES, 'SAN').map((n) => n.id)
    expect(ids).toContain('e4')
  })

  it('ranks exact > prefix > infix', () => {
    const labels = rankNodeMatches(NODES, 'sara').map((n) => n.label)
    // 'Sara Lee' starts with the query; 'Sarah' also starts with it;
    // alphabetical tiebreak puts 'Sara Lee' first. 'Casa Rara' contains
    // 'sa ra'? no — sanity: infix matchers rank after prefix matchers.
    expect(labels[0]).toBe('Sara Lee')
    expect(labels).toContain('Sarah')
  })

  it('exact match wins over prefix match', () => {
    const labels = rankNodeMatches(NODES, 'sarah').map((n) => n.label)
    expect(labels[0]).toBe('Sarah')
  })

  it('never returns the you node', () => {
    expect(rankNodeMatches(NODES, 'you').some((n) => n.id === 'you')).toBe(false)
  })

  it('respects the limit', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ id: `n${i}`, label: `node ${i}`, type: 'person' }))
    expect(rankNodeMatches(many, 'node').length).toBe(8)
  })
})

describe('groupConnections', () => {
  const conns = [
    { otherId: 'you', otherType: 'you', relation: 'spouse' },
    { otherId: 't1', otherType: 'topic', relation: 'mentioned in' },
    { otherId: 'e3', otherType: 'org', relation: 'works at' },
    { otherId: 'e1', otherType: 'person', relation: 'friend' },
    { otherId: 'e4', otherType: 'location', relation: 'lives in' },
    { otherId: 'e9', otherType: 'organization', relation: 'board member' },
    { otherId: 'x1', otherType: 'gadget', relation: 'owns' },
  ]

  it('groups in fixed People/Organizations/Places/Topics/Other order', () => {
    const { groups } = groupConnections(conns)
    expect(groups.map((g) => g.name)).toEqual(['People', 'Organizations', 'Places', 'Topics', 'Other'])
  })

  it('org and organization types share the Organizations bucket', () => {
    const { groups } = groupConnections(conns)
    const orgs = groups.find((g) => g.name === 'Organizations')
    expect(orgs.items.map((i) => i.otherId).sort()).toEqual(['e3', 'e9'])
  })

  it('location maps to Places', () => {
    const { groups } = groupConnections(conns)
    expect(groups.find((g) => g.name === 'Places').items[0].otherId).toBe('e4')
  })

  it('pulls the you connection out of the buckets', () => {
    const { youConnection, groups } = groupConnections(conns)
    expect(youConnection.relation).toBe('spouse')
    expect(groups.flatMap((g) => g.items).some((i) => i.otherId === 'you')).toBe(false)
  })

  it('omits empty groups', () => {
    const { groups } = groupConnections([{ otherId: 'e1', otherType: 'person', relation: 'friend' }])
    expect(groups.map((g) => g.name)).toEqual(['People'])
  })

  it('handles empty input', () => {
    expect(groupConnections([])).toEqual({ youConnection: null, groups: [] })
    expect(groupConnections(null)).toEqual({ youConnection: null, groups: [] })
  })
})
