// src/lib/api/chat.stream.test.js — ISS-257 C4
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { routeStreamEvent, sendMessageStream } from './chat'
import { setSessionId, getSessionId } from './auth'

describe('routeStreamEvent (ISS-257 frame dispatch)', () => {
  beforeEach(() => sessionStorage.clear())

  it('routes heartbeat frames to onHeartbeat verbatim', () => {
    const onHeartbeat = vi.fn()
    const frame = { phase: 'working', elapsed_ms: 7000, ts: 1, tool: { id: 't1', name: 'update_artifact', label: "Updating 'Q3 plan'" } }
    routeStreamEvent('heartbeat', frame, { onHeartbeat })
    expect(onHeartbeat).toHaveBeenCalledWith(frame)
  })

  it('routes tool_start with the new label/slow_expected fields intact', () => {
    const onToolStart = vi.fn()
    const frame = { id: 't1', name: 'update_artifact', input: {}, label: "Updating 'Q3 plan'", slow_expected: true, ts: 2 }
    routeStreamEvent('tool_start', frame, { onToolStart })
    expect(onToolStart).toHaveBeenCalledWith(frame)
  })

  it('routes tool_complete with label to onToolComplete', () => {
    const onToolComplete = vi.fn()
    const frame = { id: 't1', name: 'update_artifact', success: true, duration_ms: 120000, label: "Updating 'Q3 plan'", ts: 3 }
    routeStreamEvent('tool_complete', frame, { onToolComplete })
    expect(onToolComplete).toHaveBeenCalledWith(frame)
  })

  it('done stores session_id and calls onDone', () => {
    const onDone = vi.fn()
    routeStreamEvent('done', { session_id: 'sess-42', response_time_ms: 10 }, { onDone })
    expect(getSessionId()).toBe('sess-42')
    expect(onDone).toHaveBeenCalled()
  })

  it('unknown frame types fall through without throwing', () => {
    expect(() => routeStreamEvent('future_frame', { x: 1 }, {})).not.toThrow()
  })

  it('missing optional callbacks never throw', () => {
    expect(() => routeStreamEvent('heartbeat', { phase: 'starting', tool: null }, {})).not.toThrow()
    expect(() => routeStreamEvent('content', { delta: 'hi' }, {})).not.toThrow()
  })
})

describe('sendMessageStream session reuse (ISS-257 Task 3)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  function mockStreamFetch(capture) {
    globalThis.fetch = vi.fn(async (url, opts) => {
      capture.push(JSON.parse(opts.body))
      return {
        ok: true,
        body: { getReader: () => ({ read: async () => ({ done: true, value: undefined }) }) },
      }
    })
  }

  it('sends the stored session_id on every message, including after an error', async () => {
    // Auth headers come from the access-code path in this harness
    sessionStorage.setItem('hrdai_access_code', 'TEST-CODE')
    setSessionId('sess-keep-me')

    const bodies = []
    mockStreamFetch(bodies)

    sendMessageStream('first', {})
    await vi.waitFor(() => expect(bodies.length).toBe(1))
    expect(bodies[0].session_id).toBe('sess-keep-me')

    // Simulate a failed attempt: a network-level error must NOT clear the
    // stored session (the api layer never clears; Chat.jsx no longer does
    // either) — the retry reuses the same id.
    globalThis.fetch = vi.fn(async () => { throw new TypeError('network down') })
    const onError = vi.fn()
    sendMessageStream('retry-me', { onError })
    await vi.waitFor(() => expect(onError).toHaveBeenCalled())
    expect(getSessionId()).toBe('sess-keep-me')

    mockStreamFetch(bodies)
    sendMessageStream('retry-me', {})
    await vi.waitFor(() => expect(bodies.length).toBe(2))
    expect(bodies[1].session_id).toBe('sess-keep-me')
  })

  it('sends null session_id only when none is stored (genuinely new conversation)', async () => {
    sessionStorage.setItem('hrdai_access_code', 'TEST-CODE')
    const bodies = []
    mockStreamFetch(bodies)
    sendMessageStream('hello', {})
    await vi.waitFor(() => expect(bodies.length).toBe(1))
    expect(bodies[0].session_id).toBeNull()
  })
})
