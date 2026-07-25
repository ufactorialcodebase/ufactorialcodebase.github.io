// src/lib/stream-activity.js
//
// ISS-257: stall detection for SSE chat streams. The backend guarantees a
// frame at least every ~5s (heartbeat cadence), so >15s of silence means
// the connection is genuinely stuck — not a slow tool. The chat surface
// bumps this on EVERY frame and shows a "connection lost — your message is
// still being processed" state when it fires (the turn keeps running
// server-side; ISS-257's backend drains it to completion).

export const STALL_MS = 15_000

/**
 * Create a stall watchdog. `onStall` fires once per silence gap; any
 * subsequent bump() re-arms it. stop() cancels without firing.
 */
export function createStallWatchdog(onStall, stallMs = STALL_MS) {
  let timer = null

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    /** A frame arrived — the stream is alive. Re-arm the watchdog. */
    bump() {
      clear()
      timer = setTimeout(() => {
        timer = null
        onStall()
      }, stallMs)
    },
    /** Stream ended (done/error/stop) — stand down without firing. */
    stop: clear,
  }
}
