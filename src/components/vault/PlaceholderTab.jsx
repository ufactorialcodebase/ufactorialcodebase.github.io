// src/components/vault/PlaceholderTab.jsx
import { useLocation } from 'react-router-dom'
import PageHeader from './PageHeader'

const TAB_META = {
  '/vault/topics': { title: 'Your Topics', subtitle: 'Life threads and themes' },
  '/vault/todos': { title: 'Your Todos', subtitle: 'Tasks and action items' },
  '/vault/dates': { title: 'Your Dates', subtitle: 'Important dates and milestones' },
  '/vault/artifacts': { title: 'Your Artifacts', subtitle: 'Documents and structured content' },
  '/vault/lists': { title: 'Your Lists', subtitle: 'Collections and preferences' },
  '/vault/world': { title: 'Your World', subtitle: 'Interactive knowledge graph' },
}

export default function PlaceholderTab() {
  const { pathname } = useLocation()
  const meta = TAB_META[pathname] || { title: 'Coming Soon', subtitle: '' }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader title={meta.title} subtitle={meta.subtitle} />
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">Coming soon</p>
        <p className="text-[var(--text-tertiary)] text-xs mt-1">
          This tab is being built. Check back after the next update.
        </p>
      </div>
    </div>
  )
}
