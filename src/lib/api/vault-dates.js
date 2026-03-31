// src/lib/api/vault-dates.js
import { apiFetch } from '../api-client.js'

export async function getDates() {
  return apiFetch('/vault/dates')
}

export async function createDate(data) {
  return apiFetch('/vault/dates', {
    method: 'POST',
    body: {
      name: data.name,
      month_day: data.month_day,
      year: data.year || null,
      date_type: data.date_type,
      recurs: data.recurs || 'annual',
      importance: data.importance || 'medium',
      notes: data.notes || null,
      person_name: data.person_name || null,
    },
  })
}

export async function deleteDate(name) {
  return apiFetch('/vault/dates', { method: 'DELETE', body: { name } })
}
