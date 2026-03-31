import { apiFetch } from '../api-client.js'

export async function getWorld() {
  return apiFetch('/vault/world')
}
