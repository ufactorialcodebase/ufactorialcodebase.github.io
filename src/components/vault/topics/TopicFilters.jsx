// src/components/vault/topics/TopicFilters.jsx

const STATUS_FILTERS = [
  { value: null, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'resolved', label: 'Resolved' },
]

const CATEGORY_FILTERS = [
  { value: null, label: 'All' },
  { value: 'family', label: 'Family' },
  { value: 'career', label: 'Career' },
  { value: 'health', label: 'Health' },
  { value: 'finance', label: 'Finance' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
]

export default function TopicFilters({ statusFilter, onStatusFilterChange, categoryFilter, onCategoryFilterChange }) {
  return (
    <div className="mb-5 space-y-2">
      <div className="flex gap-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => onStatusFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              statusFilter === f.value
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => onCategoryFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              categoryFilter === f.value
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
