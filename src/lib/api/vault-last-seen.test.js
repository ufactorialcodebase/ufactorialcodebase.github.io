import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

describe('getLastSeen', () => {
  beforeEach(() => { vi.resetModules() })
  afterEach(() => { vi.restoreAllMocks() })

  it('returns ISO timestamp when endpoint responds', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({ last_seen_at: '2026-06-10T12:00:00Z' }),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBe('2026-06-10T12:00:00Z')
  })

  it('returns null when endpoint throws (e.g., 404)', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 })),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBeNull()
  })

  it('returns null on any other error', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(new Error('net')),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBeNull()
  })

  it('returns null when payload has no last_seen_at key', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({}),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBeNull()
  })
})
