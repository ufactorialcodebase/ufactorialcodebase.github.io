// src/lib/api/vault-counts.js
/**
 * Get totals (and raw lists) for the welcome strip — count of entities,
 * topics, topics with a captured decision, topics with non-empty open
 * questions.
 *
 * Returns _rawTopics / _rawEntities alongside counts so F7 can compute
 * deltas without a second fetch.
 */
import { getEntities } from './vault-entities.js'
import { getTopics } from './vault-topics.js'

export async function getWelcomeCounts() {
  const [eRes, tRes] = await Promise.all([
    getEntities().catch(() => ({ entities: [] })),
    getTopics().catch(() => ({ topics: [] })),
  ])
  const entities = eRes.entities || []
  const topics = tRes.topics || []
  return {
    people: entities.length,
    threads: topics.length,
    decisions: topics.filter(t => !!t.last_decision).length,
    openQuestions: topics.filter(t => Array.isArray(t.open_questions) && t.open_questions.length > 0).length,
    _rawTopics: topics,
    _rawEntities: entities,
  }
}
