// src/components/vault/WelcomeStrip.jsx
/**
 * Warm welcome strip at the top of /vault/chat for opted-in users.
 *
 * Render rules:
 *   - counts is null (still loading OR fetch failed) → render nothing
 *   - counts.threads === 0 (genuinely brand-new user) → render nothing
 *       (the chat's own proactive greeting carries the welcome; a second
 *       "Hi/Welcome" strip would be redundant — and showing it during
 *       a silent fetch failure would mislead a returning user into
 *       seeing a brand-new welcome over their real data)
 *   - counts present + threads > 0 → totals variant ("I'm holding N…")
 *   - counts present + daysSince + deltas → diff variant (wired in F7)
 */
export default function WelcomeStrip({ name, counts, daysSince = null, deltas = null }) {
  if (!counts || counts.threads === 0) return null

  const displayName = name || 'there'
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
