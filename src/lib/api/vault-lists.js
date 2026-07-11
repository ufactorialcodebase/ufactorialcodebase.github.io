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

// F2 — rename a list item in place (position preserved). Backend returns
// 200 with updated list, 404 if list or old_value missing, 409 on
// collision with a different existing item. If the row is in checklist
// mode and old_value was in checked_values, the checked state follows
// the rename (backend concern; frontend just re-renders from the
// returned list).
export async function updateListItem(listName, oldValue, newValue, notes) {
  return apiFetch(`/vault/lists/${encodeURIComponent(listName)}/items`, {
    method: 'PATCH',
    body: {
      old_value: oldValue,
      new_value: newValue,
      notes: notes ?? null,
    },
  })
}
