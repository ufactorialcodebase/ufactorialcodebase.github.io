import { apiFetch } from '../api-client.js'

const DEFAULT_LIMIT = 5

/**
 * Returns recent mentions for a topic, sorted by conversation_at desc.
 * Returns null on any error (e.g., 404 if backend endpoint not yet shipped) —
 * callers should treat null as "data unavailable, render placeholder".
 */
export async function getTopicMentions(topicId, { limit = DEFAULT_LIMIT, offset = 0 } = {}) {
  if (!topicId) return null
  try {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString()
    const res = await apiFetch(`/vault/topics/${encodeURIComponent(topicId)}/mentions?${qs}`)
    return res?.mentions ? { mentions: res.mentions, total: res.total ?? res.mentions.length } : null
  } catch {
    return null
  }
}
