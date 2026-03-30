// src/lib/api/vault-entities.js
import { apiFetch } from '../api-client.js'

export async function getEntities(params = {}) {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.limit) query.set('limit', params.limit)
  if (params.offset) query.set('offset', params.offset)
  const qs = query.toString()
  return apiFetch(`/vault/entities${qs ? '?' + qs : ''}`)
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
