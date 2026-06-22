import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeatureFlag, setFeatureFlag } from './useFeatureFlag'

describe('useFeatureFlag', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns false when flag is unset', () => {
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)
  })

  it('returns true when flag is set in localStorage', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(true)
  })

  it('returns false when flag is explicitly false in localStorage', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: false }))
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)
  })

  it('returns false when localStorage has malformed JSON', () => {
    localStorage.setItem('hridai_features', 'not-json{')
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)
  })

  it('returns false for unknown flag names', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    const { result } = renderHook(() => useFeatureFlag('something_else'))
    expect(result.current).toBe(false)
  })

  it('setFeatureFlag updates localStorage and triggers re-render', () => {
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)

    act(() => { setFeatureFlag('vault_redesign', true) })
    expect(result.current).toBe(true)

    act(() => { setFeatureFlag('vault_redesign', false) })
    expect(result.current).toBe(false)
  })
})
