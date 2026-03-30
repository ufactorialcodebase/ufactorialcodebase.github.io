// src/lib/api/chat.js
import { BASE_URL, getAuthHeaders } from '../api-client.js'
import { getSessionId, setSessionId } from './auth.js'

export async function getGreeting() {
  const authHeaders = await getAuthHeaders()
  if (Object.keys(authHeaders).length === 0) {
    return { error: 'Not authenticated. Please sign in or enter an access code.' }
  }

  try {
    const response = await fetch(`${BASE_URL}/chat/greeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed. Please sign in again or re-enter your access code.' }
      }
      if (response.status === 429) {
        const error = await response.json()
        return { error: error.detail || 'Rate limit exceeded. Please wait.' }
      }
      const error = await response.json()
      return { error: error.detail || 'Failed to get greeting' }
    }

    const data = await response.json()
    if (data.session_id) setSessionId(data.session_id)

    return {
      greeting: data.greeting,
      messages: data.messages || [data.greeting],
      sessionId: data.session_id,
      toolCalls: data.tool_calls || [],
      retrievalTrace: data.retrieval_trace,
      responseTimeMs: data.response_time_ms,
    }
  } catch (error) {
    console.error('Greeting error:', error)
    return { error: 'Network error. Please try again.' }
  }
}

export function sendMessageStream(message, callbacks) {
  const controller = new AbortController();

  (async () => {
    const authHeaders = await getAuthHeaders()
    if (Object.keys(authHeaders).length === 0) {
      callbacks.onError?.('Not authenticated. Please sign in or enter an access code.')
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ message, session_id: getSessionId() }),
        signal: controller.signal,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          callbacks.onError?.('Authentication failed. Please sign in again or re-enter your access code.')
          return
        }
        const error = await response.json()
        callbacks.onError?.(error.detail || 'Stream request failed')
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          if (!event.trim()) continue
          const lines = event.split('\n')
          let eventType = 'message'
          let data = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7)
            else if (line.startsWith('data: ')) data = line.slice(6)
          }
          if (!data) continue
          try {
            const parsed = JSON.parse(data)
            switch (eventType) {
              case 'retrieval_trace': callbacks.onRetrievalTrace?.(parsed); break
              case 'tool_calls': callbacks.onToolCalls?.(parsed.tool_calls || []); break
              case 'tool_start': callbacks.onToolStart?.(parsed); break
              case 'tool_complete': callbacks.onToolComplete?.(parsed); break
              case 'content': callbacks.onContent?.(parsed.delta || ''); break
              case 'done':
                if (parsed.session_id) setSessionId(parsed.session_id)
                callbacks.onDone?.(parsed)
                break
              case 'error': callbacks.onError?.(parsed.error || 'Stream error'); break
            }
          } catch (e) { console.warn('Failed to parse SSE event:', e) }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') return
      console.error('Stream error:', error)
      callbacks.onError?.('Connection lost. Please try again.')
    }
  })()

  return () => controller.abort()
}

export async function sendMessage(message, sessionId = null) {
  const authHeaders = await getAuthHeaders()
  if (Object.keys(authHeaders).length === 0) {
    return { error: 'Not authenticated. Please sign in or enter an access code.' }
  }

  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ message, session_id: sessionId || getSessionId() }),
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication failed. Please sign in again or re-enter your access code.' }
      }
      const error = await response.json()
      return { error: error.detail || 'Chat request failed' }
    }
    const data = await response.json()
    if (data.session_id) setSessionId(data.session_id)
    return {
      response: data.response,
      sessionId: data.session_id,
      toolCalls: data.tool_calls || [],
      retrievalTrace: data.retrieval_trace,
      responseTimeMs: data.response_time_ms,
    }
  } catch (error) {
    console.error('Chat error:', error)
    return { error: 'Network error. Please try again.' }
  }
}

export async function getContext(message = null) {
  const authHeaders = await getAuthHeaders()
  if (Object.keys(authHeaders).length === 0) {
    return { error: 'Not authenticated. Please sign in or enter an access code.' }
  }
  try {
    const params = new URLSearchParams()
    if (message) params.set('message', message)
    const url = `${BASE_URL}/context${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, { headers: { ...authHeaders } })
    if (!response.ok) {
      const error = await response.json()
      return { error: error.detail || 'Context request failed' }
    }
    return await response.json()
  } catch (error) {
    console.error('Context error:', error)
    return { error: 'Network error' }
  }
}

export async function endSession(sessionId, persist = true) {
  const authHeaders = await getAuthHeaders()
  if (Object.keys(authHeaders).length === 0 || !sessionId) {
    return { success: false, error: 'Missing authentication or session ID' }
  }
  try {
    const response = await fetch(`${BASE_URL}/chat/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ session_id: sessionId, persist }),
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.detail || 'Failed to end session' }
    }
    const data = await response.json()
    return {
      success: data.success,
      episodesCreated: data.episodes_created,
      topicsCreated: data.topics_created,
      topicsUpdated: data.topics_updated,
      error: data.error,
    }
  } catch (error) {
    console.error('End session error:', error)
    return { success: false, error: 'Network error' }
  }
}

export function endSessionBeacon(sessionId) {
  const accessCode = sessionStorage.getItem('hrdai_access_code')
  if (!accessCode || !sessionId) return
  const url = `${BASE_URL}/chat/end`
  const data = JSON.stringify({ session_id: sessionId, persist: true, access_code: accessCode })
  const blob = new Blob([data], { type: 'application/json' })
  navigator.sendBeacon(url, blob)
}

export async function checkHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`)
    if (!response.ok) return { status: 'error', error: 'API unavailable' }
    return await response.json()
  } catch (error) {
    return { status: 'error', error: 'Cannot connect to API' }
  }
}
