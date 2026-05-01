// src/components/vault/BetaWelcome.jsx
import { useState } from 'react'

const STORAGE_KEY = 'hridai_beta_acknowledged'

export default function BetaWelcome() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-active)] p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-400/10">
            Beta
          </span>
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
          HridAI is in beta
        </h2>

        <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          <p>
            We're actively building this and we want your feedback. Features may change, and you might encounter rough edges.
          </p>
          <p>
            Your privacy and security commitments still apply in full — beta doesn't mean your data is treated differently.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-6 w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
