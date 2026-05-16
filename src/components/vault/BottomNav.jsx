// src/components/vault/BottomNav.jsx
// Mobile-only bottom navigation bar (hidden on md+ via parent)
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, Users, CheckSquare, Globe, MoreHorizontal } from 'lucide-react'
import MoreSheet from './MoreSheet'

const TABS = [
  { path: '/vault/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/vault/people', icon: Users, label: 'Entities' },
  { path: '/vault/todos', icon: CheckSquare, label: 'Todos' },
  { path: '/vault/world', icon: Globe, label: 'World' },
]

// Pages accessible via "More"
const MORE_PAGES = [
  { path: '/vault/self', icon: '👤', label: 'Self', sub: 'Identity & goals' },
  { path: '/vault/dates', icon: '📅', label: 'Dates', sub: 'Key dates' },
  { path: '/vault/lists', icon: '📋', label: 'Lists', sub: 'Collections' },
  { path: '/vault/topics', icon: '💡', label: 'Topics', sub: 'Conversations' },
  { path: '/vault/artifacts', icon: '📄', label: 'Artifacts', sub: 'Documents' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showMore, setShowMore] = useState(false)

  const isMorePageActive = MORE_PAGES.some((p) => pathname.startsWith(p.path))

  return (
    <>
      {showMore && (
        <MoreSheet
          pages={MORE_PAGES}
          onNavigate={(path) => { navigate(path); setShowMore(false) }}
          onClose={() => setShowMore(false)}
        />
      )}
      <nav className="flex items-center justify-around bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] px-1 pb-[env(safe-area-inset-bottom)] shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => { setShowMore(false); navigate(tab.path) }}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${
                isActive ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[8px] font-medium">{tab.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${
            showMore || isMorePageActive ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'
          }`}
        >
          <MoreHorizontal size={20} />
          <span className="text-[8px] font-medium">More</span>
        </button>
      </nav>
    </>
  )
}
