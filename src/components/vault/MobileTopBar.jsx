// src/components/vault/MobileTopBar.jsx
// Mobile-only top bar with page title + gear icon (hidden on md+ via parent)
import { useNavigate, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'

const PAGE_TITLES = {
  '/vault/chat': null, // Chat has custom header
  '/vault/self': 'Your Self',
  '/vault/people': 'Your Entities',
  '/vault/dates': 'Your Dates',
  '/vault/todos': null, // Todos has its own header
  '/vault/lists': 'Your Lists',
  '/vault/topics': 'Your Topics',
  '/vault/artifacts': 'Your Artifacts',
  '/vault/world': 'Your World',
}

export default function MobileTopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isChat = pathname === '/vault/chat'
  const title = PAGE_TITLES[pathname]

  // Chat and Todos have their own headers — don't render a duplicate
  if (!isChat && title === null) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shrink-0">
      {isChat ? (
        <>
          <span className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">HridAI</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider bg-[rgba(245,158,11,0.15)] text-[var(--accent-amber)]">BETA</span>
        </>
      ) : (
        <span className="text-base font-semibold text-[var(--text-primary)]">{title}</span>
      )}
      <div className="flex-1" />
      <button
        onClick={() => navigate('/profile')}
        className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}
