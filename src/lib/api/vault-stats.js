// src/lib/api/vault-stats.js
import { apiFetch } from '../api-client.js'

export async function getStats() {
  return apiFetch('/vault/stats')
}
