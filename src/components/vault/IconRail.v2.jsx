// src/components/vault/IconRail.v2.jsx
//
// TODO(post-F6): first-visit tooltip callout pointing at the rail clusters
// (deferred — add after beta feedback indicates discoverability is an issue).
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, User, Globe, Brain, Settings } from 'lucide-react'
import RailClusterPopover from './RailClusterPopover'

// Cluster grouping refactored for onboarding clarity + parallel labels
// (Memory / Notebook are semantically paired: what I've learned about you
// vs. what I keep for you).
//
//   Memory (User icon)  → Self · Network · Threads
//   Notebook (Brain icon) → Dates · Todos · Lists · Artifacts
//
// Threads moved from the Brain cluster into Memory (they're narrative,
// not action items). Dates + Todos moved from the User cluster into
// Notebook (they're time-anchored things you produce and act on, not
// facets of identity).
const CLUSTERS = (base) => [
  {
    key: 'chat', label: 'Chat', icon: MessageCircle,
    items: [{ path: `${base}/chat`, label: 'Chat' }],
  },
  {
    key: 'memory', label: 'Memory', icon: User,
    items: [
      { path: `${base}/self`, label: 'Self' },
      { path: `${base}/people`, label: 'Network' },
      { path: `${base}/topics`, label: 'Threads' },
    ],
  },
  {
    key: 'notebook', label: 'Notebook', icon: Brain,
    items: [
      { path: `${base}/dates`, label: 'Dates' },
      { path: `${base}/todos`, label: 'Todos' },
      { path: `${base}/lists`, label: 'Lists' },
      { path: `${base}/artifacts`, label: 'Artifacts' },
    ],
  },
  {
    key: 'world', label: 'World', icon: Globe,
    items: [{ path: `${base}/world`, label: 'Graph' }],
  },
]

export default function IconRailV2({ basePath = '/vault' }) {
  const clusters = CLUSTERS(basePath)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [openKey, setOpenKey] = useState(null)

  const onClusterClick = (cluster) => {
    if (cluster.items.length === 1) {
      navigate(cluster.items[0].path)
      setOpenKey(null)
      return
    }
    setOpenKey(openKey === cluster.key ? null : cluster.key)
  }

  const isActiveCluster = (cluster) => cluster.items.some((it) => pathname.startsWith(it.path))

  return (
    <nav className="w-12 flex-shrink-0 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col items-center py-3 gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--accent-warm)] mb-2 select-none">
        Beta
      </span>

      {clusters.map((cluster) => {
        const Icon = cluster.icon
        const active = isActiveCluster(cluster)
        return (
          <div key={cluster.key} className="relative">
            <button
              aria-label={cluster.label}
              onClick={() => onClusterClick(cluster)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                active ? 'bg-[var(--bg-tertiary)] text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Icon size={18} />
            </button>
            <RailClusterPopover
              open={openKey === cluster.key && cluster.items.length > 1}
              items={cluster.items}
              onSelect={(path) => { setOpenKey(null); navigate(path) }}
              onClose={() => setOpenKey(null)}
            />
          </div>
        )
      })}

      <div className="flex-1" />

      <button
        aria-label="Settings"
        onClick={() => navigate('/vault/profile')}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          pathname === '/vault/profile' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        <Settings size={18} />
      </button>
    </nav>
  )
}
