// src/components/vault/world/ForceGraph.rebuild.test.jsx
//
// ISS: world view visibly "loaded 2-3 times" — the vault cache's
// stale-while-revalidate refetches hand WorldTab new array identities
// for unchanged data, and every identity change rebuilt the whole d3
// simulation. These tests pin the structural-signature guard: identical
// content with fresh identities must NOT rebuild; changed content must.
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ForceGraph from './ForceGraph'

const NODES = [
  { id: 'you', label: 'You', type: 'you' },
  { id: 'e1', label: 'Sarah', type: 'person' },
  { id: 'e2', label: 'Acme', type: 'org' },
]
const EDGES = [
  { source: 'you', target: 'e1', label: 'spouse', strength: 0.8 },
  { source: 'e1', target: 'e2', label: 'works_at', strength: 0.5 },
]

const clone = (arr) => arr.map((x) => ({ ...x }))

function buildCount(container) {
  return Number(container.querySelector('svg')?.getAttribute('data-build-count') || 0)
}

describe('ForceGraph rebuild guard', () => {
  it('builds once on mount', () => {
    const { container } = render(
      <ForceGraph nodes={NODES} edges={EDGES} width={800} height={600} />
    )
    expect(buildCount(container)).toBe(1)
    expect(container.querySelectorAll('circle').length).toBe(3)
  })

  it('same content with new array identities does NOT rebuild', () => {
    const { container, rerender } = render(
      <ForceGraph nodes={NODES} edges={EDGES} width={800} height={600} />
    )
    const gBefore = container.querySelector('svg g')
    rerender(<ForceGraph nodes={clone(NODES)} edges={clone(EDGES)} width={800} height={600} />)
    rerender(<ForceGraph nodes={clone(NODES)} edges={clone(EDGES)} width={800} height={600} />)
    expect(buildCount(container)).toBe(1)
    // Same DOM subtree — nothing was torn down
    expect(container.querySelector('svg g')).toBe(gBefore)
  })

  it('new callback identities do not rebuild either', () => {
    const { container, rerender } = render(
      <ForceGraph nodes={NODES} edges={EDGES} width={800} height={600} onNodeClick={() => {}} />
    )
    rerender(
      <ForceGraph nodes={NODES} edges={EDGES} width={800} height={600} onNodeClick={() => {}} />
    )
    expect(buildCount(container)).toBe(1)
  })

  it('genuinely changed content rebuilds (and keeps prior node positions)', () => {
    const { container, rerender } = render(
      <ForceGraph nodes={NODES} edges={EDGES} width={800} height={600} />
    )
    // mention_count enrichment landing changes node radii → legit rebuild
    const enriched = NODES.map((n) => (n.id === 'e1' ? { ...n, mention_count: 12 } : { ...n }))
    rerender(<ForceGraph nodes={enriched} edges={clone(EDGES)} width={800} height={600} />)
    expect(buildCount(container)).toBe(2)
    expect(container.querySelectorAll('circle').length).toBe(3)
  })

  it('resize rebuilds', () => {
    const { container, rerender } = render(
      <ForceGraph nodes={NODES} edges={EDGES} width={800} height={600} />
    )
    rerender(<ForceGraph nodes={NODES} edges={EDGES} width={900} height={600} />)
    expect(buildCount(container)).toBe(2)
  })
})
