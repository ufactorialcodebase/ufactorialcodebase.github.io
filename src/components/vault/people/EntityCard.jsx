// src/components/vault/people/EntityCard.jsx

const TYPE_COLORS = {
  person: 'var(--entity-person)',
  organization: 'var(--entity-org)',
  location: 'var(--entity-place)',
}

function getTypeColor(type) {
  return TYPE_COLORS[type] || 'var(--entity-other)'
}

function getTypeLabel(type) {
  if (type === 'organization') return 'Org'
  if (type === 'location') return 'Place'
  if (type === 'person') return 'Person'
  return type || 'Other'
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export default function EntityCard({ entity, onClick }) {
  const color = getTypeColor(entity.type)
  const initial = (entity.name || '?').charAt(0).toUpperCase()
  const relationship = entity.relationship_to_self || entity.relationship
  const attributes = entity.attributes || {}
  const pills = Object.entries(attributes)
    .filter(([k]) => !['id', 'entity_id', 'type', 'user_id', 'name'].includes(k))
    .slice(0, 3)
    .map(([k, v]) => `${v}`)
  const lastMentioned = timeAgo(entity.last_mentioned || entity.updated_at)

  return (
    <div
      onClick={() => onClick(entity)}
      className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:border-[var(--border-active)] transition-colors"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[var(--text-primary)] font-medium text-sm truncate">{entity.name}</div>
          {relationship && (
            <div className="text-[var(--text-tertiary)] text-xs truncate">{relationship}</div>
          )}
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium shrink-0"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {getTypeLabel(entity.type)}
        </span>
      </div>
      {pills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {pills.map((pill, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {pill}
            </span>
          ))}
        </div>
      )}
      {lastMentioned && (
        <div className="text-[var(--text-tertiary)] text-[10px]">Last mentioned {lastMentioned}</div>
      )}
    </div>
  )
}
