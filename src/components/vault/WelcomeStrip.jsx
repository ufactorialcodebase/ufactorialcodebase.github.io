// src/components/vault/WelcomeStrip.jsx
/**
 * Warm welcome strip at the top of /vault/chat for opted-in users.
 *
 * Three variants:
 *   - brand-new: no counts, gentle prompt
 *   - totals (pre-F7): "I'm holding N threads…"
 *   - diff   (post-F7): "It's been N days… X new people, Y new threads."
 *
 * The diff variant is wired in F7 (Task 28). For now this file ships the
 * brand-new + totals variants.
 */
export default function WelcomeStrip({ name, counts, daysSince = null, deltas = null }) {
  const displayName = name || 'there'
  const isBrandNew = !counts || (counts.people === 0 && counts.threads === 0)

  if (isBrandNew) {
    return (
      <section aria-label="Welcome" className="px-8 pt-6 pb-5 border-b border-[var(--border-subtle)]">
        <h2 className="font-serif text-2xl text-[var(--text-primary)] leading-tight">
          Hi {displayName}. <em className="text-[var(--text-secondary)]">Let's start with whatever's on your mind.</em>
        </h2>
      </section>
    )
  }

  const { people, threads, decisions, openQuestions } = counts
  const hasDiff = daysSince != null && deltas

  return (
    <section aria-label="Welcome" className="px-8 pt-6 pb-5 border-b border-[var(--border-subtle)]">
      <h2 className="font-serif text-2xl text-[var(--text-primary)] leading-tight">
        Hi {displayName}. <em className="text-[var(--text-secondary)]">Welcome back.</em>
      </h2>
      {hasDiff ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-6 max-w-2xl">
          It's been <Num>{daysSince} days</Num> since we last talked. While you were away I learned about <Num>{deltas.newPeople ?? 0} new people</Num> and opened <Num>{deltas.newThreads ?? 0} new threads</Num>. <Num>{decisions}</Num> decisions, <Num>{openQuestions}</Num> open questions across everything I'm holding.
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-6 max-w-2xl">
          I'm holding <Num>{threads} threads</Num> for you right now — <Num>{decisions}</Num> with a decision you've captured, <Num>{openQuestions}</Num> with something still open. <Num>{people} people</Num> across them.
        </p>
      )}
    </section>
  )
}

function Num({ children }) {
  return <span className="font-serif text-[var(--text-primary)]">{children}</span>
}
