// src/lib/api/vault-artifacts.js
import { apiFetch } from '../api-client.js'

export async function getArtifacts(params = {}) {
  const query = new URLSearchParams()
  if (params.content_type) query.set('content_type', params.content_type)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return apiFetch(`/vault/artifacts${qs ? '?' + qs : ''}`)
}

export async function getArtifact(id) {
  return apiFetch(`/vault/artifacts/${id}`)
}

export async function updateArtifact(id, data) {
  return apiFetch(`/vault/artifacts/${id}`, { method: 'PUT', body: data })
}

export async function deleteArtifact(id) {
  return apiFetch(`/vault/artifacts/${id}`, { method: 'DELETE' })
}
