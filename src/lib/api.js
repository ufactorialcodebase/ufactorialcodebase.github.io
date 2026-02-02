/**
 * API Client for HrdAI Demo
 * 
 * Handles:
 * - Access code validation
 * - Chat requests (streaming and non-streaming)
 * - Context retrieval
 */

// API base URL - change for production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Get stored access code from session storage
 */
export function getAccessCode() {
  return sessionStorage.getItem('hrdai_access_code');
}

/**
 * Store access code in session storage
 */
export function setAccessCode(code) {
  sessionStorage.setItem('hrdai_access_code', code);
}

/**
 * Clear access code from session storage
 */
export function clearAccessCode() {
  sessionStorage.removeItem('hrdai_access_code');
}

/**
 * Get stored session ID
 */
export function getSessionId() {
  return sessionStorage.getItem('hrdai_session_id');
}

/**
 * Store session ID
 */
export function setSessionId(sessionId) {
  sessionStorage.setItem('hrdai_session_id', sessionId);
}

/**
 * Clear session ID
 */
export function clearSessionId() {
  sessionStorage.removeItem('hrdai_session_id');
}

/**
 * Validate an access code
 * @param {string} code - Access code to validate
 * @returns {Promise<{valid: boolean, mode: string, error?: string}>}
 */
export async function validateAccessCode(code) {
  try {
    const response = await fetch(`${API_BASE}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { valid: false, error: error.detail || 'Invalid access code' };
    }
    
    const data = await response.json();
    return { valid: true, mode: data.mode, userId: data.user_id };
  } catch (error) {
    console.error('Access code validation error:', error);
    return { valid: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Use (activate) an access code
 * @param {string} code - Access code to activate
 * @returns {Promise<{success: boolean, userId?: string, mode?: string, error?: string}>}
 */
export async function useAccessCode(code) {
  try {
    const response = await fetch(`${API_BASE}/auth/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Failed to activate code' };
    }
    
    const data = await response.json();
    return { 
      success: true, 
      userId: data.user_id, 
      mode: data.mode,
      sessionsRemaining: data.sessions_remaining,
    };
  } catch (error) {
    console.error('Access code use error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Get initial greeting for chat session
 * ISS-026: No welcome message for demo modes
 * 
 * @returns {Promise<{greeting: string, sessionId: string, toolCalls: Array, retrievalTrace: Object, error?: string}>}
 */
export async function getGreeting() {
  const accessCode = getAccessCode();
  if (!accessCode) {
    return { error: 'No access code. Please enter your code.' };
  }
  
  try {
    const response = await fetch(`${API_BASE}/chat/greeting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Code': accessCode,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAccessCode();
        return { error: 'Access code expired or invalid.' };
      }
      if (response.status === 429) {
        const error = await response.json();
        return { error: error.detail || 'Rate limit exceeded. Please wait.' };
      }
      const error = await response.json();
      return { error: error.detail || 'Failed to get greeting' };
    }
    
    const data = await response.json();
    
    // Store session ID for continuity
    if (data.session_id) {
      setSessionId(data.session_id);
    }
    
    return {
      greeting: data.greeting,
      sessionId: data.session_id,
      toolCalls: data.tool_calls || [],
      retrievalTrace: data.retrieval_trace,
      responseTimeMs: data.response_time_ms,
    };
  } catch (error) {
    console.error('Greeting error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

/**
 * Send a chat message (non-streaming)
 * @param {string} message - User message
 * @param {string} [sessionId] - Optional session ID
 * @returns {Promise<{response: string, sessionId: string, toolCalls: Array, retrievalTrace: Object, error?: string}>}
 */
export async function sendMessage(message, sessionId = null) {
  const accessCode = getAccessCode();
  if (!accessCode) {
    return { error: 'No access code. Please enter your code.' };
  }
  
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Code': accessCode,
      },
      body: JSON.stringify({
        message,
        session_id: sessionId || getSessionId(),
      }),
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAccessCode();
        return { error: 'Access code expired or invalid. Please re-enter.' };
      }
      const error = await response.json();
      return { error: error.detail || 'Chat request failed' };
    }
    
    const data = await response.json();
    
    // Store session ID for continuity
    if (data.session_id) {
      setSessionId(data.session_id);
    }
    
    return {
      response: data.response,
      sessionId: data.session_id,
      toolCalls: data.tool_calls || [],
      retrievalTrace: data.retrieval_trace,
      responseTimeMs: data.response_time_ms,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

/**
 * Send a chat message with SSE streaming
 * @param {string} message - User message
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onRetrievalTrace - Called with retrieval trace data
 * @param {Function} callbacks.onToolCalls - Called with tool calls data
 * @param {Function} callbacks.onContent - Called with content delta
 * @param {Function} callbacks.onDone - Called when stream completes
 * @param {Function} callbacks.onError - Called on error
 * @returns {Function} Abort function to cancel the stream
 */
export function sendMessageStream(message, callbacks) {
  const accessCode = getAccessCode();
  if (!accessCode) {
    callbacks.onError?.('No access code. Please enter your code.');
    return () => {};
  }
  
  const controller = new AbortController();
  
  (async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Code': accessCode,
        },
        body: JSON.stringify({
          message,
          session_id: getSessionId(),
        }),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearAccessCode();
          callbacks.onError?.('Access code expired or invalid. Please re-enter.');
          return;
        }
        const error = await response.json();
        callbacks.onError?.(error.detail || 'Stream request failed');
        return;
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer
        
        for (const event of events) {
          if (!event.trim()) continue;
          
          const lines = event.split('\n');
          let eventType = 'message';
          let data = '';
          
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              data = line.slice(6);
            }
          }
          
          if (!data) continue;
          
          try {
            const parsed = JSON.parse(data);
            
            switch (eventType) {
              case 'retrieval_trace':
                callbacks.onRetrievalTrace?.(parsed);
                break;
              case 'tool_calls':
                callbacks.onToolCalls?.(parsed.tool_calls || []);
                break;
              case 'content':
                callbacks.onContent?.(parsed.delta || '');
                break;
              case 'done':
                if (parsed.session_id) {
                  setSessionId(parsed.session_id);
                }
                callbacks.onDone?.(parsed);
                break;
              case 'error':
                callbacks.onError?.(parsed.error || 'Stream error');
                break;
            }
          } catch (e) {
            console.warn('Failed to parse SSE event:', e);
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      console.error('Stream error:', error);
      callbacks.onError?.('Connection lost. Please try again.');
    }
  })();
  
  // Return abort function
  return () => controller.abort();
}

/**
 * Get context for current user
 * @param {string} [message] - Optional message to get JIT context for
 * @returns {Promise<Object>}
 */
export async function getContext(message = null) {
  const accessCode = getAccessCode();
  if (!accessCode) {
    return { error: 'No access code' };
  }
  
  try {
    const params = new URLSearchParams();
    if (message) {
      params.set('message', message);
    }
    
    const url = `${API_BASE}/context${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Access-Code': accessCode,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { error: error.detail || 'Context request failed' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Context error:', error);
    return { error: 'Network error' };
  }
}

/**
 * End a chat session and trigger persistence
 * @param {string} sessionId - Session ID to end
 * @param {boolean} [persist=true] - Whether to persist to PG
 * @returns {Promise<{success: boolean, episodesCreated?: number, error?: string}>}
 */
export async function endSession(sessionId, persist = true) {
  const accessCode = getAccessCode();
  if (!accessCode || !sessionId) {
    return { success: false, error: 'Missing access code or session ID' };
  }
  
  try {
    const response = await fetch(`${API_BASE}/chat/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Code': accessCode,
      },
      body: JSON.stringify({
        session_id: sessionId,
        persist,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Failed to end session' };
    }
    
    const data = await response.json();
    return {
      success: data.success,
      episodesCreated: data.episodes_created,
      topicsCreated: data.topics_created,
      topicsUpdated: data.topics_updated,
      error: data.error,
    };
  } catch (error) {
    console.error('End session error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * End session using sendBeacon (for beforeunload)
 * This is fire-and-forget and works even when page is closing
 * @param {string} sessionId - Session ID to end
 */
export function endSessionBeacon(sessionId) {
  const accessCode = getAccessCode();
  if (!accessCode || !sessionId) return;
  
  // sendBeacon doesn't support custom headers, so we use URL params
  // The backend will need to support this or we use a special beacon endpoint
  const url = `${API_BASE}/chat/end`;
  const data = JSON.stringify({
    session_id: sessionId,
    persist: true,
    access_code: accessCode,  // Include in body since we can't use headers
  });
  
  // Use sendBeacon with blob for proper content-type
  const blob = new Blob([data], { type: 'application/json' });
  navigator.sendBeacon(url, blob);
}

/**
 * Check API health
 * @returns {Promise<{status: string, error?: string}>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      return { status: 'error', error: 'API unavailable' };
    }
    return await response.json();
  } catch (error) {
    return { status: 'error', error: 'Cannot connect to API' };
  }
}
