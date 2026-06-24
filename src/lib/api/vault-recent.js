/**
 * F5: recent context for the ContextPanel idle state.
 *
 * Until the backend GET /context/recent endpoint lands (see ISS-198 in
 * AI_manager_v2), this composes from existing list endpoints client-side:
 *   - topics: most recent 3 by last_mentioned
 *   - entities: most recent 5 by last_interaction_at
 *   - moments: most recent 3 derived from topic summaries (best-effort)
 *
 * When the real endpoint ships, replace the body with one apiFetch call.
 * The return shape is stable.
 */
import { getTopics } from './vault-topics.js'
import { getEntities } from './vault-entities.js'

export async function getRecentContext() {
  const [tRes, eRes] = await Promise.all([
    getTopics().catch(() => ({ topics: [] })),
    getEntities().catch(() => ({ entities: [] })),
  ])

  const topics = (tRes.topics || [])
    .slice()
    .sort((a, b) => new Date(b.last_mentioned || 0) - new Date(a.last_mentioned || 0))
    .slice(0, 3)

  const entities = (eRes.entities || [])
    .slice()
    .sort((a, b) => new Date(b.last_interaction_at || 0) - new Date(a.last_interaction_at || 0))
    .slice(0, 5)

  // Moments: derive from topics' last_decision or current_summary as placeholder
  // until the real recent topic_mentions endpoint ships.
  const moments = topics
    .map((t, i) => ({
      id: `moment-${i}`,
      summary: t.last_decision || (t.current_summary || '').slice(0, 140),
      created_at: t.last_mentioned,
    }))
    .filter(m => m.summary)
    .slice(0, 3)

  return { topics, entities, moments }
}
