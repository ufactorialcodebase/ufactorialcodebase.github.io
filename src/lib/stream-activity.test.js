// src/lib/stream-activity.test.js — ISS-257 stall watchdog
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStallWatchdog, STALL_MS } from './stream-activity'

describe('createStallWatchdog', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('fires onStall after STALL_MS of silence', () => {
    const onStall = vi.fn()
    const w = createStallWatchdog(onStall)
    w.bump()
    vi.advanceTimersByTime(STALL_MS - 1)
    expect(onStall).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onStall).toHaveBeenCalledOnce()
  })

  it('every bump re-arms the timer (frames keep the stream alive)', () => {
    const onStall = vi.fn()
    const w = createStallWatchdog(onStall)
    w.bump()
    // 5 heartbeats at 5s cadence — never a 15s gap
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(5_000)
      w.bump()
    }
    expect(onStall).not.toHaveBeenCalled()
    // Silence after the last frame → stall fires
    vi.advanceTimersByTime(STALL_MS)
    expect(onStall).toHaveBeenCalledOnce()
  })

  it('a bump after a stall re-arms (recovered connection can stall again)', () => {
    const onStall = vi.fn()
    const w = createStallWatchdog(onStall)
    w.bump()
    vi.advanceTimersByTime(STALL_MS)
    expect(onStall).toHaveBeenCalledOnce()
    w.bump()
    vi.advanceTimersByTime(STALL_MS)
    expect(onStall).toHaveBeenCalledTimes(2)
  })

  it('stop() cancels without firing', () => {
    const onStall = vi.fn()
    const w = createStallWatchdog(onStall)
    w.bump()
    w.stop()
    vi.advanceTimersByTime(STALL_MS * 2)
    expect(onStall).not.toHaveBeenCalled()
  })

  it('custom threshold is honored', () => {
    const onStall = vi.fn()
    const w = createStallWatchdog(onStall, 1000)
    w.bump()
    vi.advanceTimersByTime(1000)
    expect(onStall).toHaveBeenCalledOnce()
  })
})
