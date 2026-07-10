// Node-size scaling for the World force graph.
//
// User feedback on Item 8: edge stroke-width scaling by tie strength
// didn't read as intended visually. Reverted. Replaced with node-size
// scaling by mention frequency — more-mentioned nodes render larger,
// capped so a single outlier can't dominate.
//
// To REVERT to the pre-batch-2 fixed-size behaviour, change
// NODE_SIZE_MODE to 'fixed' below. Everything else in the graph
// pipeline is unchanged; the mode read-through in ForceGraph.jsx is
// the only place the mode matters.

export const NODE_SIZE_MODES = ['frequency', 'fixed']

// Current mode. Flip to 'fixed' to revert.
export const NODE_SIZE_MODE = 'frequency'

// Fixed-size fallbacks (used both in 'fixed' mode and as defaults when
// mention_count is missing from a node in 'frequency' mode).
export const FIXED_RADII = {
  you: 24,
  topic: 10,
  default: 12,
}

// Frequency-scaling knobs. Log scale so a rare 100-mention outlier
// doesn't dwarf everything. Capped MIN..MAX below "you" (24) so the
// central anchor stays visually distinct.
export const FREQUENCY_RADIUS = {
  min: 10,
  max: 22,
  base: 10,
  k: 3.5,  // radius growth rate — nudge up for more aggressive scaling
}

// Compute the radius d3 should use for a node. `mode` defaults to the
// module-level NODE_SIZE_MODE but is overridable for testing.
export function computeNodeRadius(node, mode = NODE_SIZE_MODE) {
  if (!node) return FIXED_RADII.default
  if (node.id === 'you') return FIXED_RADII.you

  const count = node.mention_count
  const canScale = mode === 'frequency' && typeof count === 'number' && count >= 0

  if (canScale) {
    const { min, max, base, k } = FREQUENCY_RADIUS
    const scaled = base + Math.log(1 + count) * k
    return Math.max(min, Math.min(max, scaled))
  }

  // Fallback (fixed mode, or count missing in frequency mode)
  return node.type === 'topic' ? FIXED_RADII.topic : FIXED_RADII.default
}
