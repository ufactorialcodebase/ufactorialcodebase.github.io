// src/lib/world-view-utils.js
//
// Pure helpers for the World tab's search bar and grouped connections
// panel — extracted so ranking/grouping rules are unit-testable without
// mounting the graph.

const TYPE_COLORS = {
  you: '#fbbf24',
  person: '#60a5fa',
  org: '#34d399',
  organization: '#34d399',
  location: '#fb923c',
  place: '#fb923c',
  other: '#c084fc',
}

/**
 * Type→color mapping shared by the force graph, the search suggestions
 * and the panel rows (raw API nodes may not carry a color).
 */
export function getNodeColor(node) {
  if (node.id === 'you') return TYPE_COLORS.you
  if (node.type === 'topic') return '#c084fc'
  return TYPE_COLORS[node.type] || TYPE_COLORS.other
}

/**
 * Rank world nodes against a search query.
 * Case-insensitive substring match on the node label; exact match beats
 * prefix match beats infix match, ties break alphabetically. "you" is
 * never returned (it can't be selected). Empty/whitespace query → [].
 */
export function rankNodeMatches(nodes, query, limit = 8) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []
  return (nodes || [])
    .filter((n) => n.id !== 'you' && (n.label || '').toLowerCase().includes(q))
    .sort((a, b) => {
      const al = a.label.toLowerCase()
      const bl = b.label.toLowerCase()
      const aExact = al === q
      const bExact = bl === q
      if (aExact !== bExact) return aExact ? -1 : 1
      const aStarts = al.startsWith(q)
      const bStarts = bl.startsWith(q)
      if (aStarts !== bStarts) return aStarts ? -1 : 1
      return al.localeCompare(bl)
    })
    .slice(0, limit)
}

// Fixed display order for the grouped connections panel.
export const CONNECTION_GROUP_ORDER = ['People', 'Organizations', 'Places', 'Topics', 'Other']

function bucketForType(type) {
  const t = (type || '').toLowerCase()
  if (t === 'person') return 'People'
  if (t === 'org' || t === 'organization') return 'Organizations'
  if (t === 'place' || t === 'location') return 'Places'
  if (t === 'topic') return 'Topics'
  return 'Other'
}

/**
 * Group a flat connections list (as built by WorldTab) into the fixed
 * People / Organizations / Places / Topics / Other order. The "you"
 * connection is pulled out separately (`youConnection`) — it's the most
 * important context and doesn't belong under a type bucket. Groups with
 * no entries are omitted; entries keep their incoming (alphabetical)
 * order within each group.
 *
 * Returns { youConnection: conn | null, groups: [{ name, items }] }.
 */
export function groupConnections(connections) {
  let youConnection = null
  const byGroup = new Map()
  for (const c of connections || []) {
    if (c.otherId === 'you') {
      // Keep the first you-edge (dedup upstream makes multiples rare)
      if (!youConnection) youConnection = c
      continue
    }
    const bucket = bucketForType(c.otherType)
    if (!byGroup.has(bucket)) byGroup.set(bucket, [])
    byGroup.get(bucket).push(c)
  }
  const groups = CONNECTION_GROUP_ORDER
    .filter((name) => byGroup.has(name))
    .map((name) => ({ name, items: byGroup.get(name) }))
  return { youConnection, groups }
}
