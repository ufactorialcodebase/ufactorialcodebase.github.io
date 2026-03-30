// src/lib/api/personas.js
import { BASE_URL } from '../api-client.js'

export async function startPersonaSession(accessCode, personaId) {
  try {
    const response = await fetch(`${BASE_URL}/personas/start-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Code': accessCode },
      body: JSON.stringify({ persona_id: personaId }),
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.detail || 'Failed to start persona session' }
    }
    const data = await response.json()
    if (!data.success) {
      return { success: false, error: data.error || 'Failed to start persona session' }
    }
    return { success: true, userId: data.user_id, personaId: data.persona_id }
  } catch (error) {
    console.error('Start persona session error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

export async function endPersonaSession(accessCode, durationMs = null) {
  try {
    const response = await fetch(`${BASE_URL}/personas/end-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Code': accessCode },
      body: JSON.stringify({ duration_ms: durationMs }),
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.detail || 'Failed to end persona session' }
    }
    const data = await response.json()
    return { success: true, personaId: data.persona_id, sessionDurationMs: data.session_duration_ms }
  } catch (error) {
    console.error('End persona session error:', error)
    return { success: false, error: 'Network error' }
  }
}

export function endPersonaSessionBeacon(accessCode) {
  if (!accessCode) return
  const url = `${BASE_URL}/personas/end-session`
  const data = JSON.stringify({ access_code: accessCode })
  const blob = new Blob([data], { type: 'application/json' })
  navigator.sendBeacon(url, blob)
}

export async function listPersonas() {
  try {
    const response = await fetch(`${BASE_URL}/personas`)
    if (!response.ok) {
      const error = await response.json()
      return { personas: [], error: error.detail || 'Failed to fetch personas' }
    }
    const data = await response.json()
    return { personas: data.personas || [] }
  } catch (error) {
    console.error('List personas error:', error)
    return { personas: [], error: 'Network error' }
  }
}

export async function getPersona(personaId) {
  try {
    const response = await fetch(`${BASE_URL}/personas/${personaId}`)
    if (!response.ok) {
      const error = await response.json()
      return { persona: null, error: error.detail || 'Persona not found' }
    }
    return { persona: await response.json() }
  } catch (error) {
    console.error('Get persona error:', error)
    return { persona: null, error: 'Network error' }
  }
}
