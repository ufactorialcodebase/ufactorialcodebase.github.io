// src/lib/api/vault-topics.js
import { apiFetch } from '../api-client.js'

// Backend GET /vault/topics defaults to limit=200 (max 500). Same hazard
// as getEntities — silent cap inflates / under-reports counts and hides
// older topics. Default raised to the backend max (500); proper fix
// tracked in the same backend ISS as the entities cap.
const DEFAULT_LIMIT = 500

export async function getTopics(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  query.set('limit', String(params.limit ?? DEFAULT_LIMIT))
  return apiFetch(`/vault/topics?${query.toString()}`)
}

export async function updateTopic(id, data) {
  return apiFetch(`/vault/topics/${id}`, { method: 'PUT', body: data })
}

export async function deleteTopic(id) {
  return apiFetch(`/vault/topics/${id}`, { method: 'DELETE' })
}
