// src/components/vault/BottomNav.jsx
// Mobile-only bottom navigation bar (hidden on md+ via parent).
// Mirrors the desktop IconRail.v2 clusters: Chat and World navigate
// directly; Memories and Notebook open a small sheet listing their group.
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, Brain, BookOpen, Globe } from 'lucide-react'
import MoreSheet from './MoreSheet'

const CLUSTERS = (base) => [
  { key: 'chat', label: 'Chat', icon: MessageCircle, path: `${base}/chat` },
  {
    key: 'memory', label: 'Memories', icon: Brain,
    pages: [
      { path: `${base}/self`, icon: '👤', label: 'Self', sub: 'Identity & goals' },
      { path: `${base}/people`, icon: '👥', label: 'Network', sub: 'People, places, orgs' },
      { path: `${base}/topics`, icon: '💡', label: 'Topics', sub: 'What keeps coming up' },
    ],
  },
  {
    key: 'notebook', label: 'Notebook', icon: BookOpen,
    pages: [
      { path: `${base}/dates`, icon: '📅', label: 'Dates', sub: 'Key dates' },
      { path: `${base}/todos`, icon: '✅', label: 'Todos', sub: 'Tasks & action items' },
      { path: `${base}/lists`, icon: '📋', label: 'Lists', sub: 'Collections' },
      { path: `${base}/artifacts`, icon: '📄', label: 'Artifacts', sub: 'Documents' },
    ],
  },
  { key: 'world', label: 'World', icon: Globe, path: `${base}/world` },
]

export default function BottomNav({ basePath = '/vault' }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [openKey, setOpenKey] = useState(null)

  const clusters = CLUSTERS(basePath)
  const openCluster = clusters.find((c) => c.key === openKey && c.pages)

  const isActive = (cluster) =>
    cluster.path
      ? pathname.startsWith(cluster.path)
      : cluster.pages.some((p) => pathname.startsWith(p.path))

  const onClusterClick = (cluster) => {
    if (cluster.path) {
      setOpenKey(null)
      navigate(cluster.path)
      return
    }
    setOpenKey(openKey === cluster.key ? null : cluster.key)
  }

  return (
    <>
      {openCluster && (
        <MoreSheet
          pages={openCluster.pages}
          cols={openCluster.pages.length === 4 ? 2 : 3}
          onNavigate={(path) => { navigate(path); setOpenKey(null) }}
          onClose={() => setOpenKey(null)}
        />
      )}
      <nav aria-label="Bottom navigation" className="flex items-center justify-around bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] px-1 pb-[env(safe-area-inset-bottom)] shrink-0">
        {clusters.map((cluster) => {
          const Icon = cluster.icon
          const active = isActive(cluster) || openKey === cluster.key
          return (
            <button
              key={cluster.key}
              data-tour-anchor={cluster.key}
              onClick={() => onClusterClick(cluster)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${
                active ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[8px] font-medium">{cluster.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
