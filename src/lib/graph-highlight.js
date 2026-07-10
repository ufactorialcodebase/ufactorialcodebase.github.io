// Graph highlight utilities for the World force graph.
//
// When a user clicks a node we run an undirected BFS from that node and
// produce a distance map (nodeId → hops). ForceGraph reads the map to
// modulate opacity across nodes + edges + labels so the clicked node and
// its 1st / 2nd / 3rd degree neighbours read as a "lit up" subgraph
// (rest fade to a dim floor). BFS treats every edge as undirected —
// clicking a person will always light "you" up as a 1° neighbour when
// they share an edge.

export const MAX_HIGHLIGHT_DEGREE = 3

// Opacity ramp keyed by hops-from-source. Values chosen to be visually
// distinct (each step is a ~2× decay) while keeping non-highlighted
// nodes just barely visible so the user still has spatial context.
export const DEGREE_OPACITY = {
  0: 1.0,   // clicked node
  1: 0.75,  // 1st-degree neighbours
  2: 0.4,   // 2nd-degree
  3: 0.2,   // 3rd-degree
}
export const REST_OPACITY = 0.08

// Undirected BFS from a source node over the raw edges array. Returns a
// Map<nodeId, distance>. Distance to source is 0. Only walks out to
// MAX_HIGHLIGHT_DEGREE hops — anything further is treated as REST.
export function bfsDistances(sourceId, edges, maxDegree = MAX_HIGHLIGHT_DEGREE) {
  if (!sourceId || !Array.isArray(edges)) return new Map()

  // Build undirected adjacency. d3 mutates edge.source / edge.target into
  // node objects after simulation setup, so we accept both id-strings and
  // object-with-.id shapes when walking a live graph.
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

// Opacity for a single node given the active distance map.
//   distances === null → no highlight active (everything fully opaque)
//   node not in map    → node is beyond MAX_HIGHLIGHT_DEGREE (REST floor)
export function nodeOpacity(distances, nodeId) {
  if (!distances) return 1
  const d = distances.get(nodeId)
  if (d === undefined) return REST_OPACITY
  return DEGREE_OPACITY[d] ?? REST_OPACITY
}

// Opacity for an edge. Edge is only "lit" if BOTH endpoints are within
// the highlight radius; its brightness matches the FURTHER endpoint so an
// edge from 1° to 3° reads as 3°. Multiplied by the edge's base opacity
// (which is a function of tie strength, per Item 8) so the ramp still
// respects the underlying strength signal.
export function edgeOpacity(distances, sourceId, targetId, baseOpacity = 1) {
  if (!distances) return baseOpacity
  const sd = distances.get(sourceId)
  const td = distances.get(targetId)
  if (sd === undefined || td === undefined) return REST_OPACITY * baseOpacity
  const dist = Math.max(sd, td)
  const factor = DEGREE_OPACITY[dist] ?? REST_OPACITY
  return factor * baseOpacity
}
