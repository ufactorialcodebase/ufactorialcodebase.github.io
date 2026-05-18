// src/components/vault/BottomNav.jsx
// Mobile-only bottom navigation bar (hidden on md+ via parent)
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, Users, CheckSquare, Globe, MoreHorizontal } from 'lucide-react'
import MoreSheet from './MoreSheet'

function buildTabs(base) {
  return [
    { path: `${base}/chat`, icon: MessageCircle, label: 'Chat' },
    { path: `${base}/people`, icon: Users, label: 'Entities' },
    { path: `${base}/todos`, icon: CheckSquare, label: 'Todos' },
    { path: `${base}/world`, icon: Globe, label: 'World' },
  ]
}

function buildMorePages(base) {
  return [
    { path: `${base}/self`, icon: '👤', label: 'Self', sub: 'Identity & goals' },
    { path: `${base}/dates`, icon: '📅', label: 'Dates', sub: 'Key dates' },
    { path: `${base}/lists`, icon: '📋', label: 'Lists', sub: 'Collections' },
    { path: `${base}/topics`, icon: '💡', label: 'Topics', sub: 'Conversations' },
    { path: `${base}/artifacts`, icon: '📄', label: 'Artifacts', sub: 'Documents' },
  ]
}

export default function BottomNav({ basePath = '/vault' }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showMore, setShowMore] = useState(false)

  const TABS = buildTabs(basePath)
  const MORE_PAGES = buildMorePages(basePath)
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
