// src/lib/entity-connections.js
//
// Derive an entity's entity-to-entity connections from the world graph
// payload (already cached by the vault for the World tab — no extra
// endpoint). Topic links and the you-edge are excluded here: the entity
// panel shows topics as chips and the to-self relationship as its own
// editable field.

/**
 * @param {string} entityId
 * @param {{nodes: Array, edges: Array}|null} worldData
 * @returns {Array<{relId, otherId, otherLabel, otherType, relation}>}
 *   deduped by (otherId, relation), sorted by other label.
 */
export function entityConnections(entityId, worldData) {
  if (!entityId || !worldData?.edges?.length) return []
  const nodesById = new Map()
  for (const n of worldData.nodes || []) nodesById.set(n.id, n)

  const isEntityNode = (n) =>
    n && n.id !== 'you' && (n.type || '').toLowerCase() !== 'topic'

  const out = []
  const seen = new Set()
  for (const e of worldData.edges) {
    const isSource = e.source === entityId
    const isTarget = e.target === entityId
    if (!isSource && !isTarget) continue
    const otherId = isSource ? e.target : e.source
    const other = nodesById.get(otherId)
    if (!isEntityNode(other)) continue
    const relation = (e.label || e.type || 'related').replace(/_/g, ' ')
    const key = `${otherId}::${relation}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      relId: e.id || null,
      otherId,
      otherLabel: other.label || otherId,
      otherType: other.type,
      relation,
    })
  }
  out.sort((a, b) => a.otherLabel.localeCompare(b.otherLabel))
  return out
}
