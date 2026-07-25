// src/components/vault/OnboardingTour.jsx
//
// Two-pane welcome tour shown once per browser, immediately after the beta
// notice is acknowledged. Pane 1 = value proposition (4 cards); pane 2 = map
// of the vault's four sections. Completing OR skipping sets the localStorage
// flag; `onComplete` lets VaultLayout chain the spotlight tour afterwards.
//
// Layering: z-40, deliberately below BetaWelcome's z-50 — for a brand-new
// user both are mounted, and the beta notice must be dealt with first. When
// it unmounts, the tour is revealed underneath.
import { useState, useEffect, useCallback } from 'react'

export const ONBOARDING_KEY = 'hridai_onboarding_complete'

const HEADING_FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" }

const PANE1_CARDS = [
  {
    emoji: '🧠',
    label: 'Memory that grows',
    color: 'var(--entity-person)',
    text: 'Every conversation sharpens what I know about your people, your goals, and your world.',
  },
  {
    emoji: '🌐',
    label: 'Your world, connected',
    color: 'var(--accent-teal)',
    text: 'People, topics, and how they relate — visible at a glance, never lost between chats.',
  },
  {
    emoji: '✓',
    label: 'From talk to action',
    color: 'var(--accent-amber)',
    text: 'Todos, plans, follow-ups get auto-created as we talk. No forms, no forgetting.',
  },
  {
    emoji: '🔒',
    label: 'Yours alone',
    color: 'var(--accent-rose)',
    text: 'Private by default. Everything stays with you — never shared, never sold, never used to train.',
  },
]

const PANE2_TILES = [
  { emoji: '💬', name: 'Chat', text: 'Your primary way to talk to HridAI — anything on your mind.' },
  { emoji: '🌐', name: 'World', text: 'A visual map of everyone and everything in your life, connected.' },
  { emoji: '🧠', name: 'Memories', text: "Self · Network · Topics — what I've learned about your world." },
  { emoji: '📖', name: 'Notebook', text: 'Dates · Todos · Lists · Artifacts — what I keep for you.' },
]

export default function OnboardingTour({ onComplete }) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true'
  )
  const [pane, setPane] = useState(0)

  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setDismissed(true)
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    if (dismissed) return
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') setPane((p) => Math.min(p + 1, 1))
      if (e.key === 'ArrowLeft') setPane((p) => Math.max(p - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dismissed, finish])

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        data-testid="onboarding-tour"
        className="relative w-full max-w-[800px] my-auto rounded-[20px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden"
      >
        <button
          onClick={finish}
          className="absolute top-5 right-6 text-[11px] text-[var(--text-tertiary)] underline hover:text-[var(--text-secondary)] z-10"
        >
          Skip tour
        </button>

        {pane === 0 ? (
          <div className="px-8 pt-7 pb-1">
            <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--accent-warm,var(--accent-amber))] mb-2">
              Welcome
            </div>
            <h1 className="text-[22px] font-bold text-[var(--text-primary)] leading-snug mb-2.5" style={HEADING_FONT}>
              Welcome to your HridAI
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5 max-w-[640px]">
              The first AI that actually remembers you. Not a chatbot — a personal life
              manager, built to grow with you, keep track of what matters, and quietly
              help you keep it all together.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
              {PANE1_CARDS.map((c) => (
                <div key={c.label} className="rounded-[10px] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: c.color }}>
                    {c.emoji} {c.label}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] leading-normal">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="px-8 pt-7 pb-1">
              <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--accent-warm,var(--accent-amber))] mb-2">
                Welcome
              </div>
              <h1 className="text-[22px] font-bold text-[var(--text-primary)] leading-snug mb-2.5" style={HEADING_FONT}>
                Everything gets organized here
              </h1>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5 max-w-[640px]">
                Your vault has four sections. Chat is where we talk. World is your life
                visualized. Memories are what I've learned about you. Notebook is what
                I keep for you.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-8 pb-4">
              {PANE2_TILES.map((t) => (
                <div key={t.name} className="rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] px-4 py-[18px] text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl leading-none">{t.emoji}</span>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{t.name}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] leading-snug">{t.text}</div>
                </div>
              ))}
            </div>
            <div
              className="mx-8 mb-6 mt-2 px-5 py-[18px] rounded-[14px] border"
              style={{
                background: 'linear-gradient(135deg, rgba(201,127,58,0.10) 0%, rgba(160,119,59,0.05) 100%)',
                borderColor: 'rgba(201,127,58,0.20)',
              }}
            >
              <div className="text-sm font-semibold text-[var(--text-primary)] leading-normal mb-1">
                Your HridAI grows into your life — quietly, privately, on your side of the table.
              </div>
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Support for the mental load, structure for what you want to remember, and
                a proactive nudge when it matters.
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between px-8 py-4 mt-4 border-t border-[var(--border-subtle)] bg-black/[0.04]">
          <div className="flex items-center gap-2">
            {[0, 1].map((i) => (
              <button
                key={i}
                aria-label={`Go to pane ${i + 1}`}
                onClick={() => setPane(i)}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  background: pane === i
                    ? 'var(--accent-warm, var(--accent-amber))'
                    : 'var(--border-active)',
                }}
              />
            ))}
            <span className="text-[11px] text-[var(--text-tertiary)] ml-2">{pane + 1} of 2</span>
          </div>
          <div className="flex gap-2.5">
            {pane === 1 && (
              <button
                onClick={() => setPane(0)}
                className="px-[18px] py-2.5 rounded-[10px] text-[13px] text-[var(--text-secondary)] border border-[var(--border-active)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
            )}
            {pane === 0 ? (
              <button
                onClick={() => setPane(1)}
                className="px-[18px] py-2.5 rounded-[10px] text-[13px] font-semibold bg-[var(--accent-indigo)] text-white shadow-md hover:opacity-90 transition-opacity"
              >
                See what's inside →
              </button>
            ) : (
              <button
                onClick={finish}
                className="px-[18px] py-2.5 rounded-[10px] text-[13px] font-semibold bg-[var(--accent-indigo)] text-white shadow-md hover:opacity-90 transition-opacity"
              >
                Let's start →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
