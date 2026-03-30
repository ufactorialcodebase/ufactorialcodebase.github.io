// src/lib/api-client.js
import { supabase } from './supabase'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Get auth headers. JWT takes priority over access code.
 */
export async function getAuthHeaders() {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      return { 'Authorization': `Bearer ${session.access_token}` }
    }
  }
  const code = sessionStorage.getItem('hrdai_access_code')
  if (code) {
    return { 'X-Access-Code': code }
  }
  return {}
}

/**
 * Fetch wrapper that adds auth headers and handles common errors.
 * @param {string} path - API path (e.g., '/vault/self')
 * @param {Object} options - fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} With message from API or network error
 */
export async function apiFetch(path, options = {}) {
  const authHeaders = await getAuthHeaders()
  const { headers: customHeaders, body, ...rest } = options

  const fetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...customHeaders,
    },
    ...rest,
  }

  if (body !== undefined) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, fetchOptions)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || `Request failed: ${response.status}`)
    error.status = response.status
    throw error
  }

  return response.json()
}
