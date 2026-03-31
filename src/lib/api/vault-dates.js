// src/lib/api/vault-dates.js
import { apiFetch } from '../api-client.js'

export async function getDates() {
  return apiFetch('/vault/dates')
}

export async function createDate(data) {
  return apiFetch('/vault/dates', { method: 'POST', body: data })
}

export async function deleteDate(name) {
  return apiFetch('/vault/dates', { method: 'DELETE', body: { name } })
}
