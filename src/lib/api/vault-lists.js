// src/lib/api/vault-lists.js
import { apiFetch } from '../api-client.js'

export async function getLists(params = {}) {
  const query = new URLSearchParams()
  if (params.category) query.set('category', params.category)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return apiFetch(`/vault/lists${qs ? '?' + qs : ''}`)
}

export async function createList(data) {
  return apiFetch('/vault/lists', { method: 'POST', body: data })
}

export async function deleteList(id) {
  return apiFetch(`/vault/lists/${id}`, { method: 'DELETE' })
}

export async function addListItem(listName, value, notes) {
  return apiFetch(`/vault/lists/${encodeURIComponent(listName)}/items`, {
    method: 'POST',
    body: { value, notes: notes || null },
  })
}

export async function removeListItem(listName, value) {
  return apiFetch(`/vault/lists/${encodeURIComponent(listName)}/items`, {
    method: 'DELETE',
    body: { value },
  })
}

// ISS-241 (F1) — per-list checklist mode. When `is_checklist` is true, items
// with a value in `checked_values` render as "checked" and sink to the
// bottom of the list. Toggling off preserves `checked_values` so re-enabling
// restores state (per Q1b decision).
export async function setChecklistMode(listName, enabled) {
  return apiFetch(`/vault/lists/${encodeURIComponent(listName)}`, {
    method: 'PATCH',
    body: { is_checklist: enabled },
  })
}

export async function toggleCheckedValue(listName, value) {
  return apiFetch(`/vault/lists/${encodeURIComponent(listName)}/checked`, {
    method: 'POST',
    body: { value },
  })
}
