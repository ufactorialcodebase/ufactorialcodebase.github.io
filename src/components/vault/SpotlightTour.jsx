// src/components/vault/SpotlightTour.jsx
//
// Four sequential spotlights shown once, right after the welcome tour:
//   1. Chat composer   — sample conversation preview
//   2. World rail icon — mini graph preview
//   3. Memories cluster — Self / Network / Topics tiles (wide card)
//   4. Notebook cluster — Dates / Todos / Lists / Artifacts tiles (wide card)
//
// Anchors are real DOM elements tagged with data-tour-anchor. The same
// anchor names exist twice — IconRail.v2 cluster buttons (desktop) and
// BottomNav cluster buttons (mobile) — plus the chat composer form, which
// both layouts share. measureAnchor picks whichever candidate is actually
// visible, so the tour runs identically in both views: ring on the side
// rail on desktop, ring on the bottom nav on mobile (cards flip above
// bottom-anchored targets).
import { useState, useEffect, useRef, useCallback } from 'react'

export const SPOTLIGHT_KEY = 'hridai_spotlight_tour_complete'

const HEADING_FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" }
const RING = '0 0 0 3px rgba(201,127,58,0.85)'
const DIM = 'rgba(43,33,26,0.72)'

function Snapshot({ label, children }) {
  return (
    <div className="rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-2.5 mb-1 text-[11px] text-[var(--text-secondary)]">
      <span className="block text-[9px] font-semibold uppercase tracking-wider text-[var(--accent-warm,var(--accent-amber))] mb-1.5">
        {label}
      </span>
      {children}
    </div>
  )
}

function ClusterTile({ icon, name, body, examples }) {
  return (
    <div className="rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-xs" style={{ background: 'rgba(201,127,58,0.15)' }}>
          {icon}
        </div>
        <div className="text-[11px] font-semibold text-[var(--text-primary)]">{name}</div>
      </div>
      <div className="text-[10px] text-[var(--text-secondary)] leading-snug">{body}</div>
      {examples.map((ex) => (
        <div key={ex} className="mt-1 px-1.5 py-1 rounded-[5px] bg-[var(--bg-tertiary)] text-[9px] text-[var(--text-primary)] leading-tight">
          {ex}
        </div>
      ))}
    </div>
  )
}

const STEPS = [
  {
    anchor: 'composer',
    headline: 'This is your chat.',
    body: "Your primary way to talk to HridAI. Share updates, decisions, things you're mulling, people you've met — everything sticks.",
    preview: (
      <Snapshot label="Sample conversation">
        <div className="flex flex-col gap-1.5">
          <div className="self-end px-2 py-1 rounded-lg bg-black/10 text-[10px]">"My son Jake turned 5 today."</div>
          <div className="self-start px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[10px]">Happy birthday to Jake! I'll remember that — Aug 12, right?</div>
          <div className="self-end px-2 py-1 rounded-lg bg-black/10 text-[10px]">"Yeah. And remind me to pick up the cake tomorrow."</div>
          <div className="self-start px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[10px]">Done — added "pick up cake" to your todos.</div>
        </div>
      </Snapshot>
    ),
  },
  {
    anchor: 'world',
    headline: 'Your world, visualized.',
    body: 'As we chat, I build a graph of your people, places, and topics — and how they all connect. Click any dot to see the relationships spread outward.',
    preview: (
      <Snapshot label="What it'll look like">
        <svg className="block mx-auto" width="230" height="120" viewBox="0 0 230 120">
          <line x1="115" y1="60" x2="55" y2="30" stroke="rgba(138,122,100,0.5)" strokeWidth="1.2" />
          <line x1="115" y1="60" x2="55" y2="95" stroke="rgba(138,122,100,0.5)" strokeWidth="1.2" />
          <line x1="115" y1="60" x2="180" y2="35" stroke="rgba(138,122,100,0.5)" strokeWidth="1.2" />
          <line x1="115" y1="60" x2="185" y2="90" stroke="rgba(138,122,100,0.5)" strokeWidth="1.2" />
          <line x1="55" y1="30" x2="55" y2="95" stroke="rgba(138,122,100,0.35)" strokeWidth="1" />
          <line x1="180" y1="35" x2="185" y2="90" stroke="rgba(138,122,100,0.35)" strokeWidth="1" />
          <circle cx="115" cy="60" r="11" fill="#c97f3a" />
          <text x="115" y="63" textAnchor="middle" fontSize="10" fill="white">you</text>
          <circle cx="55" cy="30" r="7" fill="#4d6688" />
          <text x="55" y="18" textAnchor="middle" fontSize="9" fill="currentColor">Sarah</text>
          <circle cx="55" cy="95" r="7" fill="#4d6688" />
          <text x="55" y="112" textAnchor="middle" fontSize="9" fill="currentColor">Jake</text>
          <circle cx="180" cy="35" r="7" fill="#6e4d1e" />
          <text x="180" y="22" textAnchor="middle" fontSize="9" fill="currentColor">Acme</text>
          <circle cx="185" cy="90" r="7" fill="#4f6b4f" />
          <text x="185" y="107" textAnchor="middle" fontSize="9" fill="currentColor">SF</text>
        </svg>
      </Snapshot>
    ),
  },
  {
    anchor: 'memory',
    wide: true,
    headline: 'Everything I remember about your world.',
    body: "Who you are, who's in your life, and the topics that keep coming up. All auto-organized from our chats.",
    preview: (
      <Snapshot label="What lives here">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
          <ClusterTile
            icon="👤" name="Self"
            body="Everything I've learned about you."
            examples={[
              'Location · San Francisco, CA',
              'Occupation · Senior PM at Acme',
              'Timezone · Pacific (PT)',
              'Goals · Half marathon in October',
              'Health · Running weekly, sleep 7 hrs',
            ]}
          />
          <ClusterTile
            icon="👥" name="Network"
            body="The people, places, orgs in your life."
            examples={['Sarah · spouse', 'Acme · work']}
          />
          <ClusterTile
            icon="💭" name="Topics"
            body="What keeps coming up, followed over time."
            examples={['Baby prep · active', 'Phoenix move · active']}
          />
        </div>
      </Snapshot>
    ),
  },
  {
    anchor: 'notebook',
    wide: true,
    headline: 'The things I keep for you.',
    body: 'Dates on your calendar, todos to act on, lists to hold, and documents I\'ve made for you. All follow-through, no forgetting. You can directly create, edit, or delete them in the Notebook.',
    preview: (
      <Snapshot label="What lives here">
        <div className="grid grid-cols-2 gap-2 mt-1">
          <ClusterTile
            icon="📅" name="Dates"
            body="I'll surface them before they land."
            examples={["Jake's birthday · Aug 12", 'Q3 review · Sep 4']}
          />
          <ClusterTile
            icon="✅" name="Todos"
            body="Auto-created from what you say."
            examples={['☐ Pick up cake · today', '☐ Draft Q3 roadmap · Fri']}
          />
          <ClusterTile
            icon="📝" name="Lists"
            body="Anything you want to keep together."
            examples={['Groceries · 8 items', 'Books to read · 12']}
          />
          <ClusterTile
            icon="📄" name="Artifacts"
            body="Documents I've drafted for you."
            examples={['Move-week plan', 'Q3 talking points']}
          />
        </div>
      </Snapshot>
    ),
  },
]

// Rects are plain objects (not DOMRect) so tests can stub them easily.
// Anchor names exist in both the desktop rail and the mobile bottom nav;
// pick the candidate that is actually laid out (hidden ones are 0x0).
function measureAnchor(anchor) {
  const els = document.querySelectorAll(`[data-tour-anchor="${anchor}"]`)
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
  }
  return null
}

function cardPosition(step, rect, cardWidth) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const EST_H = 440 // rough card height for clamping; card also max-h clamps
  const effW = Math.min(cardWidth, vw - 32) // card's real width after maxWidth clamp
  if (step.anchor === 'composer') {
    // Above the composer, nudged right of the rail
    return {
      left: Math.max(16, Math.min(rect.left + 120, vw - effW - 16)),
      bottom: Math.min(vh - 16, vh - rect.top + 14),
    }
  }
  if (rect.top > vh * 0.6) {
    // Bottom-nav anchor (mobile): card above the button, centered on it
    return {
      left: Math.max(16, Math.min(rect.left + rect.width / 2 - effW / 2, vw - effW - 16)),
      bottom: Math.min(vh - 16, vh - rect.top + 14),
    }
  }
  // Side-rail anchor (desktop): card sits to the right of the rail
  return {
    left: Math.max(16, Math.min(rect.right + 18, vw - effW - 16)),
    top: Math.max(16, Math.min(rect.top - 60, vh - EST_H - 16)),
  }
}

export default function SpotlightTour({ enabled }) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(SPOTLIGHT_KEY) === 'true'
  )
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const measuredOnceRef = useRef(false)

  const active = enabled && !dismissed

  const finish = useCallback(() => {
    localStorage.setItem(SPOTLIGHT_KEY, 'true')
    setDismissed(true)
  }, [])

  useEffect(() => {
    if (!active) return
    const measure = () => {
      measuredOnceRef.current = true
      setRect(measureAnchor(STEPS[step].anchor))
    }
    // First measurement waits for the welcome modal to unmount and layout to
    // settle. Step-to-step remeasures run synchronously — a delayed timer
    // here re-arms on every step change (cleanup clears it before it fires
    // for fast clickers), leaving the ring one step behind.
    let t
    if (measuredOnceRef.current) measure()
    else t = setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [active, step])

  useEffect(() => {
    if (!active || !rect) return
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, rect, finish])

  if (!active || !rect) return null

  const s = STEPS[step]
  const cardWidth = s.wide ? 540 : 380
  const pos = cardPosition(s, rect, cardWidth)
  const PAD = 5

  const holeTop = rect.top - PAD
  const holeLeft = rect.left - PAD
  const holeW = rect.width + PAD * 2
  const holeH = rect.height + PAD * 2

  return (
    <div data-testid="spotlight-tour">
      {/* Page dim: four rects around the hole. (A single 9999px box-shadow
          spread — the mockup's trick — silently fails to paint in Chromium,
          which drops very large shadow spreads; four plain rects are
          deterministic.) They also double as the click shield. */}
      <div data-testid="spotlight-dim" className="fixed z-[59]" style={{ top: 0, left: 0, right: 0, height: Math.max(0, holeTop), background: DIM }} />
      <div className="fixed z-[59]" style={{ top: holeTop + holeH, left: 0, right: 0, bottom: 0, background: DIM }} />
      <div className="fixed z-[59]" style={{ top: holeTop, left: 0, width: Math.max(0, holeLeft), height: holeH, background: DIM }} />
      <div className="fixed z-[59]" style={{ top: holeTop, left: holeLeft + holeW, right: 0, height: holeH, background: DIM }} />

      {/* The spotlight ring around the anchor */}
      <div
        data-testid="spotlight-hole"
        className="fixed z-[60] rounded-[10px] pointer-events-none transition-all duration-300"
        style={{
          top: holeTop,
          left: holeLeft,
          width: holeW,
          height: holeH,
          boxShadow: RING,
        }}
      />

      {/* Tooltip card */}
      <div
        className="fixed z-[61] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden transition-all duration-300"
        style={{ width: cardWidth, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', ...pos }}
      >
        <div className="flex items-center justify-between px-[18px] pt-3.5 pb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--accent-warm,var(--accent-amber))]">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={finish}
            className="text-[11px] text-[var(--text-tertiary)] underline hover:text-[var(--text-primary)]"
          >
            Skip tour
          </button>
        </div>
        <div className="px-[18px] pb-3.5 pt-1">
          <h3 className="text-[17px] font-bold text-[var(--text-primary)] leading-snug mb-1.5" style={HEADING_FONT}>
            {s.headline}
          </h3>
          <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed mb-3">{s.body}</p>
          {s.preview}
        </div>
        <div className="flex items-center justify-between px-[18px] py-3 border-t border-[var(--border-subtle)] bg-black/[0.04]">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i === step ? 'var(--accent-warm, var(--accent-amber))' : 'var(--border-active)' }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((v) => Math.max(v - 1, 0))}
              disabled={step === 0}
              className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] border border-[var(--border-active)] disabled:opacity-40 disabled:cursor-not-allowed hover:text-[var(--text-primary)] transition-colors"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((v) => Math.min(v + 1, STEPS.length - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-indigo)] text-white hover:opacity-90 transition-opacity"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={finish}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-indigo)] text-white hover:opacity-90 transition-opacity"
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
