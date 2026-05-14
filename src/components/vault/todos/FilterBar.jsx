// src/components/vault/todos/FilterBar.jsx
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

function Dropdown({ label, children, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-colors ${
          active
            ? 'border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.12)] text-[var(--accent-indigo)]'
            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]'
        }`}
      >
        {label}
        <ChevronDown size={10} className={`opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[180px] bg-[var(--bg-secondary)] border border-[var(--border-active)] rounded-xl p-1.5 z-50 shadow-xl">
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ dot, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] text-left"
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      {label}
    </button>
  )
}

export default function FilterBar({ filter, onFilterChange, tags, entities, onNewTag }) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <button
        onClick={() => onFilterChange({ type: 'all' })}
        className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-colors ${
          filter.type === 'all'
            ? 'border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.12)] text-[var(--accent-indigo)]'
            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]'
        }`}
      >
        All
      </button>

      <Dropdown label="By Priority" active={filter.type === 'priority'}>
        {({ close }) => (
          <>
            <DropdownItem dot="#f87171" label="High" onClick={() => { onFilterChange({ type: 'priority', value: 'high' }); close() }} />
            <DropdownItem dot="#f59e0b" label="Medium" onClick={() => { onFilterChange({ type: 'priority', value: 'medium' }); close() }} />
            <DropdownItem dot="#8b95a8" label="Low" onClick={() => { onFilterChange({ type: 'priority', value: 'low' }); close() }} />
          </>
        )}
      </Dropdown>

      <Dropdown label="By Entity" active={filter.type === 'entity'}>
        {({ close }) => (
          <>
            {entities.length === 0 && (
              <div className="px-2.5 py-1.5 text-xs text-[var(--text-tertiary)] italic">No linked entities</div>
            )}
            {entities.map((e) => (
              <DropdownItem key={e} dot="#60a5fa" label={e} onClick={() => { onFilterChange({ type: 'entity', value: e }); close() }} />
            ))}
          </>
        )}
      </Dropdown>

      <Dropdown label="By Tag" active={filter.type === 'tag'}>
        {({ close }) => (
          <>
            {tags.length === 0 && (
              <div className="px-2.5 py-1.5 text-xs text-[var(--text-tertiary)] italic">No tags yet</div>
            )}
            {tags.map((t) => (
              <DropdownItem key={t.name} dot={t.color} label={t.name} onClick={() => { onFilterChange({ type: 'tag', value: t.name }); close() }} />
            ))}
          </>
        )}
      </Dropdown>

      <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

      <button
        onClick={onNewTag}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[var(--border-active)] text-[var(--text-tertiary)] text-[11px] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors"
      >
        <Plus size={10} /> New Tag
      </button>
    </div>
  )
}
