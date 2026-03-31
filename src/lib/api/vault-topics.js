// src/lib/api/vault-topics.js
import { apiFetch } from '../api-client.js'

export async function getTopics(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return apiFetch(`/vault/topics${qs ? '?' + qs : ''}`)
}

export async function updateTopic(id, data) {
  return apiFetch(`/vault/topics/${id}`, { method: 'PUT', body: data })
}

export async function deleteTopic(id) {
  return apiFetch(`/vault/topics/${id}`, { method: 'DELETE' })
}
