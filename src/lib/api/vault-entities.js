// src/lib/api/vault-entities.js
import { apiFetch } from '../api-client.js'

// Backend GET /vault/entities defaults to limit=100 (max 500). Calling
// getEntities() without an explicit limit silently capped lists at 100,
// breaking WelcomeStrip counts ("exactly 100 people") and hiding entities
// beyond the first 100 from PeopleTab. Default raised to the backend max
// (500) here as an immediate workaround. Proper fix — raise the backend
// cap or expose a count endpoint — tracked separately (see ISS).
const DEFAULT_LIMIT = 500

export async function getEntities(params = {}) {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  query.set('limit', String(params.limit ?? DEFAULT_LIMIT))
  if (params.offset) query.set('offset', params.offset)
  return apiFetch(`/vault/entities?${query.toString()}`)
}

export async function getEntity(id) {
  return apiFetch(`/vault/entities/${id}`)
}

export async function updateEntity(id, data) {
  return apiFetch(`/vault/entities/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteEntity(id) {
  return apiFetch(`/vault/entities/${id}`, {
    method: 'DELETE',
  })
}

export async function mergeEntities(keepEntityId, removeEntityId) {
  return apiFetch('/vault/entities/merge', {
    method: 'POST',
    body: { keep_entity_id: keepEntityId, remove_entity_id: removeEntityId },
  })
}
