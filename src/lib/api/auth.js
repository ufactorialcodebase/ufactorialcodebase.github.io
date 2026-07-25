// src/lib/api/auth.js
import { BASE_URL } from '../api-client.js'

export function getAccessCode() {
  return sessionStorage.getItem('hrdai_access_code')
}

export function setAccessCode(code) {
  sessionStorage.setItem('hrdai_access_code', code)
}

export function clearAccessCode() {
  sessionStorage.removeItem('hrdai_access_code')
}

export function getSessionId() {
  return sessionStorage.getItem('hrdai_session_id')
}

export function setSessionId(sessionId) {
  sessionStorage.setItem('hrdai_session_id', sessionId)
}

export function clearSessionId() {
  sessionStorage.removeItem('hrdai_session_id')
}

export async function validateAccessCode(code) {
  try {
    const response = await fetch(`${BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    if (!response.ok) {
      const error = await response.json()
      return { valid: false, error: error.detail || 'Invalid access code' }
    }
    const data = await response.json()
    // /api/auth/validate always responds HTTP 200 — validity lives in the
    // body's is_valid field, not the HTTP status.
    if (!data.is_valid) {
      return { valid: false, error: data.error_message || 'Invalid access code' }
    }
    return { valid: true, mode: data.mode }
  } catch (error) {
    console.error('Access code validation error:', error)
    return { valid: false, error: 'Network error. Please try again.' }
  }
}

export async function useAccessCode(code) {
  try {
    const response = await fetch(`${BASE_URL}/auth/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.detail || 'Failed to activate code' }
    }
    const data = await response.json()
    return {
      success: true,
      userId: data.user_id,
      mode: data.mode,
      sessionsRemaining: data.sessions_remaining,
    }
  } catch (error) {
    console.error('Access code use error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}
