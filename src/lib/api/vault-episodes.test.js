import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getEpisode', () => {
  beforeEach(() => { vi.resetModules() })

  it('returns episode on happy path', async () => {
    const fakeEpisode = {
      id: 'ep-001',
      summary_text: 'We discussed work and finances.',
      emotional_state: 'stressed',
      life_areas: ['career', 'finance'],
    }
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve(fakeEpisode),
    }))
    const { getEpisode } = await import('./vault-episodes')
    const result = await getEpisode('ep-001')
    expect(result).toEqual(fakeEpisode)
  })

  it('returns null when episodeId is falsy', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: vi.fn(),
    }))
    const { getEpisode } = await import('./vault-episodes')
    expect(await getEpisode(null)).toBeNull()
    expect(await getEpisode('')).toBeNull()
    expect(await getEpisode(undefined)).toBeNull()
  })

  it('returns null on 404', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 })),
    }))
    const { getEpisode } = await import('./vault-episodes')
    expect(await getEpisode('ep-999')).toBeNull()
  })

  it('returns null on network error', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(new Error('NetworkError')),
    }))
    const { getEpisode } = await import('./vault-episodes')
    expect(await getEpisode('ep-001')).toBeNull()
  })

  it('encodes episode id in url', async () => {
    let capturedUrl = null
    vi.doMock('../api-client.js', () => ({
      apiFetch: (url) => { capturedUrl = url; return Promise.resolve({ id: 'test' }) },
    }))
    const { getEpisode } = await import('./vault-episodes')
    await getEpisode('ep/with/slashes')
    expect(capturedUrl).toBe('/vault/episodes/ep%2Fwith%2Fslashes')
  })
})
