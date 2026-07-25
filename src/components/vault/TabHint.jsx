// src/components/vault/TabHint.jsx
//
// First-visit inline banner shown once per tab (per browser). Contextual
// whisper, not a guided tour: full UI stays visible, no dim, no spotlight.
// Copy adapts to whether the tab already has data (`count` prop) — empty
// tabs get "here's what will appear", populated tabs lead with the count.
// Dismissed by the X, by Escape, or never re-shown once dismissed
// (localStorage hridai_tab_hint_<tab>). Fades in 400ms after mount so the
// tab's own content lands first.
import { useState, useEffect } from 'react'

export const TAB_HINT_KEY_PREFIX = 'hridai_tab_hint_'
const tabHintKey = (tab) => `${TAB_HINT_KEY_PREFIX}${tab}`

const COPY = {
  people: {
    icon: '👥',
    headline: "Everyone we've talked about lives here.",
    empty:
      'As you mention people, places, or organizations, they show up here. Click any card to see or edit what I\'ve learned.',
    populated: (n) => (
      <>
        <b>{n} already here</b> from our chats. Click any card to see or edit
        what I've learned.
      </>
    ),
  },
  todos: {
    icon: '✅',
    headline: "Anything you say you'll do — I track here.",
    empty:
      'Todos get created as we talk. You can also add them yourself, tag them, and check off when done.',
    populated: (n) => (
      <>
        <b>{n} tracking</b> from our chats. Anything else you want on the list
        — just say, or add it yourself.
      </>
    ),
  },
  topics: {
    icon: '💬',
    headline: 'The topics of your life — I keep them straight.',
    empty:
      'Anything that keeps coming up in our chats becomes a topic. Open one to see the timeline of times we\'ve discussed it.',
    populated: (n) => (
      <>
        <b>{n} topics</b> I'm following. Open any to see the full history.
      </>
    ),
  },
  dates: {
    icon: '📅',
    headline: "The dates that matter — I'll remind you before they land.",
    empty:
      'Birthdays, anniversaries, deadlines — mention them and I\'ll surface them at the right time.',
    populated: (n) => (
      <>
        <b>{n} on the calendar</b>. I'll surface the next one when it's near.
      </>
    ),
  },
  world: {
    icon: '🌐',
    headline: 'See how your world connects.',
    empty:
      'A visual map of everyone and everything you\'ve mentioned. Click any dot to see the relationships spread outward.',
    populated: (n) => (
      <>
        <b>{n} nodes</b>, all connected. Click any dot to see the
        relationships spread outward.
      </>
    ),
  },
  self: {
    icon: '👤',
    headline: "Everything I've learned about you.",
    empty:
      'Your goals, preferences, and the parts of your identity I\'m carrying. Nothing here is a black box.',
    populated: () => (
      <>
        Everything on this page is yours to control — edit, delete, or expand
        any section.
      </>
    ),
  },
}

export default function TabHint({ tab, count = 0, className = '' }) {
  const copy = COPY[tab]
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(tabHintKey(tab)) === 'true'
  )
  // Fade-in delay: let the tab's content render first, then whisper.
  const [visible, setVisible] = useState(false)

  const dismiss = () => {
    localStorage.setItem(tabHintKey(tab), 'true')
    setDismissed(true)
  }

  useEffect(() => {
    if (dismissed) return
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [dismissed])

  useEffect(() => {
    if (dismissed || !visible) return
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed, visible])

  if (!copy || dismissed) return null

  return (
    <div
      data-testid={`tab-hint-${tab}`}
      className={`flex items-start gap-3 px-4 py-3.5 mb-5 rounded-[14px] border transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(201,127,58,0.10) 0%, rgba(160,119,59,0.05) 100%)',
        borderColor: 'rgba(201,127,58,0.22)',
      }}
    >
      <div
        className="w-8 h-8 flex-shrink-0 rounded-[10px] flex items-center justify-center text-lg"
        style={{ background: 'rgba(201,127,58,0.16)' }}
      >
        {copy.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug mb-0.5">
          {copy.headline}
        </div>
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed [&_b]:font-semibold [&_b]:text-[var(--accent-warm,var(--accent-amber))]">
          {count > 0 ? copy.populated(count) : copy.empty}
        </div>
      </div>
      <button
        aria-label="Dismiss hint"
        onClick={dismiss}
        className="flex-shrink-0 px-1.5 py-1 rounded-md text-base leading-none text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-black/5"
      >
        ×
      </button>
    </div>
  )
}
