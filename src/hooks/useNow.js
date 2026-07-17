// ISS-248 — the single "what does 'now' mean here?" hook.
//
// - Real users: not wrapped in DemoProvider → useDemo() returns null →
//   returns a fresh `new Date()`.
// - Persona demo users: DemoProvider carries the persona's frozen
//   story-time anchor via `demoNow` (an ISO date string coming from
//   /api/vault/demo/{personaId}) → returns that as a Date.
//
// Components that render relative labels (timeAgo, daysUntilDate,
// formatDateRibbon, "upcoming in N days", etc.) call this hook and
// pass the result into the format-utils function's `now` param so
// the vault and the chat agree on which side of "today" any given
// date lands on.
//
// Kept intentionally tiny — no memoisation, no interval ticking.
// Each render gets a fresh Date; the persona anchor never changes
// within a single demo session so React re-renders are cheap.

import { useDemo } from '../components/vault/DemoContext'

export function useNow() {
  const demo = useDemo()
  if (demo && demo.demoNow) {
    const d = new Date(demo.demoNow)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
}
