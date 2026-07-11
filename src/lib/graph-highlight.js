// Graph highlight utilities for the World force graph.
//
// When a user clicks a node we run an undirected BFS and produce a
// distance map (nodeId → hops). ForceGraph reads the map and applies a
// yellow drop-shadow glow to the clicked node + its 1st / 2nd / 3rd
// degree neighbours — glow intensity decreases by degree. Nodes at
// 4+ hops or disconnected stay COMPLETELY NORMAL (no dim, no fade) so
// the graph remains readable at all times. This replaces the earlier
// opacity-ramp version that pushed non-highlighted nodes to a floor —
// user found the fade-out visually unpleasant; additive glow reads
// better because it draws attention without hiding context.

export const MAX_HIGHLIGHT_DEGREE = 3

// Tier index → drop-shadow config used to build the SVG <filter>
// definitions in ForceGraph. Lower index = brighter / larger halo.
// stdDeviation drives the blur radius; floodOpacity the punch.
export const GLOW_TIERS = [
  { id: 'node-glow-0', stdDeviation: 12, floodOpacity: 1.0 },   // clicked
  { id: 'node-glow-1', stdDeviation: 8,  floodOpacity: 0.85 },  // 1° neighbours
  { id: 'node-glow-2', stdDeviation: 5,  floodOpacity: 0.55 },  // 2°
  { id: 'node-glow-3', stdDeviation: 3,  floodOpacity: 0.30 },  // 3°
]

// Warm yellow — matches the "you" node palette so the highlight reads
// as "in your orbit." Used as the DARK-MODE default; the warm/light
// theme overrides via --graph-glow-color in vault-theme-warm.css.
// ForceGraph reads the CSS var at filter-setup time; this is the
// fallback when the var is missing.
export const GLOW_COLOR = '#fbbf24'

// Non-highlighted node/label/edge treatment when a highlight is
// active. Nodes get their saturation cut (fill still reads as the
// original hue, just muted) AND their opacity reduced — the pair is
// what makes the glowing subgraph pop instead of feeling like a subtle
// tint. Kept as a plain object here so a downstream consumer can
// probe / test the exact values.
export const DIM_FILTER_ID = 'node-dim'
export const DIM_STATE = {
  saturation: 0.35,          // feColorMatrix saturate — 0=grey, 1=full
  opacity: 0.5,              // circle opacity when dimmed
  labelOpacity: 0.4,         // text opacity when dimmed
  edgeOpacityMultiplier: 0.15, // dim edges to 15% of their strength-derived base
}

// Undirected BFS from a source node over the raw edges array. Returns
// a Map<nodeId, distance>. Distance to source is 0. Walks out to
// MAX_HIGHLIGHT_DEGREE hops — anything further is treated as "no glow."
export function bfsDistances(sourceId, edges, maxDegree = MAX_HIGHLIGHT_DEGREE) {
  if (!sourceId || !Array.isArray(edges)) return new Map()

  // d3 mutates edge.source / edge.target into node objects after
  // simulation setup, so we accept both id-strings and object-with-.id
  // shapes when walking a live graph.
  const adj = new Map()
  const idOf = (v) => (v && typeof v === 'object' && v.id !== undefined) ? v.id : v
  for (const e of edges) {
    const s = idOf(e.source)
    const t = idOf(e.target)
    if (s === undefined || t === undefined) continue
    if (!adj.has(s)) adj.set(s, new Set())
    if (!adj.has(t)) adj.set(t, new Set())
    adj.get(s).add(t)
    adj.get(t).add(s)
  }

  const distances = new Map()
  distances.set(sourceId, 0)
  let frontier = [sourceId]
  for (let d = 1; d <= maxDegree; d++) {
    const nextFrontier = []
    for (const node of frontier) {
      const neighbours = adj.get(node)
      if (!neighbours) continue
      for (const neighbour of neighbours) {
        if (!distances.has(neighbour)) {
          distances.set(neighbour, d)
          nextFrontier.push(neighbour)
        }
      }
    }
    if (nextFrontier.length === 0) break
    frontier = nextFrontier
  }
  return distances
}

// Glow tier index for a node given the active distance map. null means
// "no glow" — either no highlight is active, or the node is 4+ hops
// out or disconnected. Non-null values are indices into GLOW_TIERS.
export function glowTierForDistance(distances, nodeId) {
  if (!distances) return null
  const d = distances.get(nodeId)
  if (d === undefined) return null
  if (d < 0 || d >= GLOW_TIERS.length) return null
  return d
}
