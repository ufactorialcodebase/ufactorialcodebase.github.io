// src/lib/api/chat.history.test.js — getChatHistory api layer
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getChatHistory } from './chat'

describe('getChatHistory', () => {
  beforeEach(() => {
    sessionStorage.clear()
    sessionStorage.setItem('hrdai_access_code', 'TEST-CODE') // auth headers non-empty
    vi.restoreAllMocks()
  })

  it('requests the first page with the default limit', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ messages: [{ role: 'user', content: 'hi' }], next_cursor: 's:2', resumable: null }),
    }))
    const page = await getChatHistory()
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toContain('/chat/history?')
    expect(url).toContain('limit=8')
    expect(url).not.toContain('cursor=')
    expect(page.next_cursor).toBe('s:2')
  })

  it('passes the cursor for older pages', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ messages: [], next_cursor: null, resumable: null }),
    }))
    await getChatHistory({ before: 'sess-b:4' })
    expect(globalThis.fetch.mock.calls[0][0]).toContain('cursor=sess-b%3A4')
  })

  it('degrades to an empty page on HTTP failure and network error', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false }))
    expect(await getChatHistory()).toEqual({ messages: [], next_cursor: null, resumable: null })
    globalThis.fetch = vi.fn(async () => { throw new TypeError('down') })
    expect(await getChatHistory()).toEqual({ messages: [], next_cursor: null, resumable: null })
  })

  it('returns empty page when unauthenticated (no headers)', async () => {
    sessionStorage.clear()
    globalThis.fetch = vi.fn()
    expect(await getChatHistory()).toEqual({ messages: [], next_cursor: null, resumable: null })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
