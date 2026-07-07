// Shared sort toggle chip strip used by PeopleTab and TopicsTab. Visual
// pattern matches the existing FilterBar / TopicFilters chips
// (px-3 py-1.5 rounded-lg text-xs, active = --bg-tertiary + font-medium)
// so the two tabs read as a consistent surface.

export default function SortToggle({ value, onChange, options, label = 'Sort' }) {
  return (
    <div className="flex items-center gap-2" data-testid="sort-toggle">
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">{label}</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            data-sort={opt.value}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              value === opt.value
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
