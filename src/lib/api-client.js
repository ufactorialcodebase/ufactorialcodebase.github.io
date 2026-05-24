// src/lib/api-client.js
import { supabase } from './supabase'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Browser timezone header (ISS-103) so the backend computes "today" in the
 * user's local timezone instead of server UTC. Sent on chat-turn requests.
 * Kept separate from auth headers — getAuthHeaders() callers detect
 * "not authenticated" via an empty object, which this must not disturb.
 * @returns {Object} { 'X-Timezone': '<IANA zone>' } or {} if unavailable.
 */
export function getTimezoneHeader() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz ? { 'X-Timezone': tz } : {}
  } catch {
    return {}
  }
}

/**
 * Get auth headers. JWT takes priority over access code.
 */
export async function getAuthHeaders() {
  const path = window.location.pathname

  // Production vault (/vault/*) — always use JWT, never access code.
  // Prevents stale demo access codes from overriding user identity.
  if (path.startsWith('/vault')) {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        return { 'Authorization': `Bearer ${session.access_token}` }
      }
    }
    return {}
  }

  // Demo and try-it-out routes — access code first, JWT fallback.
  // Prevents JWT from leaking real user data into demo sessions
  // (JWT is in localStorage, shared across tabs).
  const code = sessionStorage.getItem('hrdai_access_code')
  if (code) {
    return { 'X-Access-Code': code }
  }
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      return { 'Authorization': `Bearer ${session.access_token}` }
    }
  }
  return {}
}

/**
 * Create a Stripe Checkout session and return the URL.
 * @returns {Promise<string>} Checkout URL to redirect to
 */
export async function createCheckoutSession() {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to create checkout session')
  }
  const data = await res.json()
  return data.checkout_url
}

/**
 * Create a Stripe Customer Portal session and return the URL.
 * @returns {Promise<string>} Portal URL to redirect to
 */
export async function createPortalSession() {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}/payments/portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to create portal session')
  }
  const data = await res.json()
  return data.portal_url
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
