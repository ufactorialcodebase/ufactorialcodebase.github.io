import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getRecentContext', () => {
  beforeEach(() => { vi.resetModules() })

  it('returns shape { topics, entities, moments } from adapter outputs', async () => {
    vi.doMock('./vault-topics.js', () => ({
      getTopics: () => Promise.resolve({ topics: [
        { id: 't1', name: 'foo', current_status: 'active', last_mentioned: '2026-06-01T00:00:00Z' },
        { id: 't2', name: 'bar', current_status: 'active', last_mentioned: '2026-05-25T00:00:00Z' },
      ] })
    }))
    vi.doMock('./vault-entities.js', () => ({
      getEntities: () => Promise.resolve({ entities: [
        { id: 'e1', canonical_name: 'Mike', last_interaction_at: '2026-06-10T00:00:00Z' },
      ] })
    }))

    const { getRecentContext } = await import('./vault-recent')
    const out = await getRecentContext()

    expect(out).toHaveProperty('topics')
    expect(out).toHaveProperty('entities')
    expect(out).toHaveProperty('moments')
    expect(Array.isArray(out.topics)).toBe(true)
    expect(Array.isArray(out.entities)).toBe(true)
    expect(Array.isArray(out.moments)).toBe(true)
    expect(out.topics.length).toBeLessThanOrEqual(3)
    expect(out.entities.length).toBeLessThanOrEqual(5)
  })
})
