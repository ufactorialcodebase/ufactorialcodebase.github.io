import { apiFetch } from '../api-client.js'

/**
 * Returns a single episode by id, or null on any error / 404.
 */
export async function getEpisode(episodeId) {
  if (!episodeId) return null
  try {
    return await apiFetch(`/vault/episodes/${encodeURIComponent(episodeId)}`)
  } catch {
    return null
  }
}
