// src/components/vault/people/FilterBar.jsx
import { Search } from 'lucide-react'

const TYPE_FILTERS = [
  { value: null, label: 'All' },
  { value: 'person', label: 'People' },
  { value: 'organization', label: 'Orgs' },
  { value: 'location', label: 'Places' },
]

export default function FilterBar({ search, onSearchChange, typeFilter, onTypeFilterChange }) {
  return (
    <div className="flex gap-3 items-center mb-5 flex-wrap">
      <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg">
        <Search size={14} className="text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search people, places..."
          className="bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none flex-1"
        />
      </div>
      <div className="flex gap-1">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => onTypeFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              typeFilter === f.value
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
