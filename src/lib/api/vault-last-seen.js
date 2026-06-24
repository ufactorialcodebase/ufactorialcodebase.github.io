import { apiFetch } from '../api-client.js'

/**
 * Returns the user's last-seen timestamp (ISO) used by WelcomeStrip for the
 * "since you were last here" delta.
 *
 * Backed by MAX(chat_transcripts.updated_at) for the user — see spec §6 F7.
 * Returns null if the endpoint isn't yet shipped (404) or any error occurs;
 * the caller treats null as "use totals fallback wording."
 */
export async function getLastSeen() {
  try {
    const res = await apiFetch('/sessions/last-seen')
    return res?.last_seen_at || null
  } catch {
    return null
  }
}
