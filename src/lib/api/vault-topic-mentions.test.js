import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getTopicMentions', () => {
  beforeEach(() => { vi.resetModules() })

  it('returns { mentions, total } on happy path', async () => {
    const fakeMentions = [
      { id: 'm1', context_snippet: 'We talked about it', conversation_at: '2026-06-20T10:00:00Z' },
      { id: 'm2', context_snippet: 'Came up again', conversation_at: '2026-06-19T09:00:00Z' },
    ]
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({ mentions: fakeMentions, total: 2 }),
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    const result = await getTopicMentions('topic-123')
    expect(result).toEqual({ mentions: fakeMentions, total: 2 })
  })

  it('returns null when topicId is falsy', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: vi.fn(),
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    expect(await getTopicMentions(null)).toBeNull()
    expect(await getTopicMentions('')).toBeNull()
    expect(await getTopicMentions(undefined)).toBeNull()
  })

  it('returns null on 404 (endpoint not yet shipped)', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 })),
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    expect(await getTopicMentions('topic-123')).toBeNull()
  })

  it('returns null on network error', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(new Error('NetworkError')),
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    expect(await getTopicMentions('topic-123')).toBeNull()
  })

  it('returns null when payload has no mentions key', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({}),
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    expect(await getTopicMentions('topic-123')).toBeNull()
  })

  it('derives total from mentions.length when total is missing', async () => {
    const fakeMentions = [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }]
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({ mentions: fakeMentions }),
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    const result = await getTopicMentions('topic-123')
    expect(result).toEqual({ mentions: fakeMentions, total: 3 })
  })

  it('passes limit and offset as query params', async () => {
    let capturedUrl = null
    vi.doMock('../api-client.js', () => ({
      apiFetch: (url) => { capturedUrl = url; return Promise.resolve({ mentions: [], total: 0 }) },
    }))
    const { getTopicMentions } = await import('./vault-topic-mentions')
    await getTopicMentions('topic-abc', { limit: 10, offset: 15 })
    expect(capturedUrl).toContain('limit=10')
    expect(capturedUrl).toContain('offset=15')
    expect(capturedUrl).toContain('/vault/topics/topic-abc/mentions')
  })
})
