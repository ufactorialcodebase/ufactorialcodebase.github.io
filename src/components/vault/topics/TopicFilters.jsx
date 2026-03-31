// src/components/vault/topics/TopicFilters.jsx

const STATUS_FILTERS = [
  { value: null, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'resolved', label: 'Resolved' },
]

export default function TopicFilters({ statusFilter, onStatusFilterChange }) {
  return (
    <div className="flex gap-1 mb-5">
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
  )
}
