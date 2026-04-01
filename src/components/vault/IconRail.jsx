// src/components/vault/IconRail.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  MessageCircle, User, Users, Lightbulb,
  CheckSquare, Calendar, FileText, List, Globe, Settings,
} from 'lucide-react'
import { getCached, setCached } from '../../lib/vault-cache'
import { getSelf } from '../../lib/api/vault-self'
import { getEntities } from '../../lib/api/vault-entities'
import { getTopics } from '../../lib/api/vault-topics'
import { getTodos } from '../../lib/api/vault-todos'
import { getDates } from '../../lib/api/vault-dates'
import { getArtifacts } from '../../lib/api/vault-artifacts'
import { getLists } from '../../lib/api/vault-lists'
import { getWorld } from '../../lib/api/vault-world'
import { normalizeEntity } from './people/entity-utils'

const TABS = [
  { path: '/vault/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/vault/self', icon: User, label: 'Your Self' },
  { path: '/vault/people', icon: Users, label: 'Your Entities' },
  { path: '/vault/dates', icon: Calendar, label: 'Your Dates' },
  { path: '/vault/todos', icon: CheckSquare, label: 'Your Todos' },
  { path: '/vault/lists', icon: List, label: 'Your Lists' },
  { path: '/vault/topics', icon: Lightbulb, label: 'Your Topics' },
  { path: '/vault/artifacts', icon: FileText, label: 'Your Artifacts' },
  { path: '/vault/world', icon: Globe, label: 'Your World' },
]

const PREFETCH = {
  '/vault/self': () => !getCached('self') && getSelf().then(d => setCached('self', d)).catch(() => {}),
  '/vault/people': () => !getCached('entities') && getEntities().then(r => setCached('entities', (r.entities || []).map(normalizeEntity))).catch(() => {}),
  '/vault/topics': () => !getCached('topics') && getTopics().then(r => setCached('topics', r.topics || [])).catch(() => {}),
  '/vault/todos': () => !getCached('todos') && getTodos({ include_completed: true }).then(r => setCached('todos', r.todos || [])).catch(() => {}),
  '/vault/dates': () => !getCached('dates') && getDates().then(r => setCached('dates', r.dates || [])).catch(() => {}),
  '/vault/artifacts': () => !getCached('artifacts') && getArtifacts().then(r => setCached('artifacts', r.artifacts || [])).catch(() => {}),
  '/vault/lists': () => !getCached('lists') && getLists().then(r => setCached('lists', r.lists || [])).catch(() => {}),
  '/vault/world': () => !getCached('world') && getWorld().then(d => setCached('world', d)).catch(() => {}),
}

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
              onMouseEnter={() => {
                setHoveredIndex(i)
                PREFETCH[tab.path]?.()
              }}
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

      {/* Spacer pushes profile to bottom */}
      <div className="flex-1" />

      {/* Profile / Settings */}
      <div className="relative">
        <button
          onClick={() => navigate('/profile')}
          onMouseEnter={() => setHoveredIndex('profile')}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            pathname === '/profile'
              ? 'bg-[rgba(99,102,241,0.15)] text-[var(--accent-indigo)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          <Settings size={18} />
        </button>
        {hoveredIndex === 'profile' && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs whitespace-nowrap z-50 pointer-events-none">
            Account & Billing
          </div>
        )}
      </div>
    </nav>
  )
}
