import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePinnedItems } from './usePinnedItems'

describe('usePinnedItems', () => {
  beforeEach(() => { localStorage.clear() })

  it('returns empty array initially', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    expect(result.current.pinned).toEqual([])
  })

  it('pin adds an id', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('topic-1') })
    expect(result.current.pinned).toContain('topic-1')
  })

  it('pin twice is idempotent', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('topic-1'); result.current.pin('topic-1') })
    expect(result.current.pinned).toEqual(['topic-1'])
  })

  it('unpin removes an id', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('topic-1') })
    act(() => { result.current.unpin('topic-1') })
    expect(result.current.pinned).toEqual([])
  })

  it('isPinned reports correctly', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('a') })
    expect(result.current.isPinned('a')).toBe(true)
    expect(result.current.isPinned('b')).toBe(false)
  })

  it('persists across hook re-renders via localStorage', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('persisted') })
    const { result: result2 } = renderHook(() => usePinnedItems('context'))
    expect(result2.current.pinned).toContain('persisted')
  })

  it('different namespaces do not collide', () => {
    const { result: a } = renderHook(() => usePinnedItems('nsA'))
    act(() => { a.current.pin('x') })
    const { result: b } = renderHook(() => usePinnedItems('nsB'))
    expect(b.current.pinned).toEqual([])
  })
})
