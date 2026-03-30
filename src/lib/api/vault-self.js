// src/lib/api/vault-self.js
import { apiFetch } from '../api-client.js'

export async function getSelf() {
  return apiFetch('/vault/self')
}

export async function updateSelf(aspect, data) {
  return apiFetch('/vault/self', {
    method: 'PUT',
    body: { aspect, data },
  })
}
