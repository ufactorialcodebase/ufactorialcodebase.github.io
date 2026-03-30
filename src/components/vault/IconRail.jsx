// src/components/vault/IconRail.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  MessageCircle, User, Users, Lightbulb,
  CheckSquare, Calendar, FileText, List, Globe,
} from 'lucide-react'

const TABS = [
  { path: '/vault/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/vault/self', icon: User, label: 'Your Self' },
  { path: '/vault/people', icon: Users, label: 'Your People' },
  { path: '/vault/topics', icon: Lightbulb, label: 'Your Topics' },
  { path: '/vault/todos', icon: CheckSquare, label: 'Your Todos' },
  { path: '/vault/dates', icon: Calendar, label: 'Your Dates' },
  { path: '/vault/artifacts', icon: FileText, label: 'Your Artifacts' },
  { path: '/vault/lists', icon: List, label: 'Your Lists' },
  { path: '/vault/world', icon: Globe, label: 'Your World' },
]

export default function IconRail() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <nav className="w-12 flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col items-center py-3 gap-1">
      {TABS.map((tab, i) => {
        const Icon = tab.icon
        const isActive = pathname === tab.path
        return (
          <div key={tab.path} className="relative">
            <button
              onClick={() => navigate(tab.path)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-[rgba(99,102,241,0.15)] text-[var(--accent-indigo)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Icon size={18} />
            </button>
            {hoveredIndex === i && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs whitespace-nowrap z-50 pointer-events-none">
                {tab.label}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
