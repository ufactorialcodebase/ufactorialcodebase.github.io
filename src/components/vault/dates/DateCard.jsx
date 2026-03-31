// src/components/vault/dates/DateCard.jsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

const TYPE_COLORS = {
  birthday: '#ec4899',
  anniversary: '#8b5cf6',
  deadline: '#f87171',
  milestone: '#14b8a6',
  event: '#60a5fa',
  annual: '#f59e0b',
  one_time: '#8b95a8',
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  const now = new Date()
  let month, day
  if (parts.length === 3) {
    month = parseInt(parts[1]) - 1
    day = parseInt(parts[2])
  } else if (parts.length === 2) {
    month = parseInt(parts[0]) - 1
    day = parseInt(parts[1])
  } else return null

  let next = new Date(now.getFullYear(), month, day)
  if (next < now) next = new Date(now.getFullYear() + 1, month, day)
  const diff = Math.ceil((next - now) / 86400000)
  return diff
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (parts.length === 3) {
    return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`
  }
  if (parts.length === 2) {
    return `${months[parseInt(parts[0]) - 1]} ${parseInt(parts[1])}`
  }
  return dateStr
}

export default function DateCard({ date, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const color = TYPE_COLORS[date.date_type] || TYPE_COLORS.annual
  const days = daysUntil(date.date)

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl mb-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}22` }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[var(--text-primary)] text-sm font-medium">{date.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-tertiary)] text-xs">{formatDate(date.date)}</span>
          {date.person_name && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[rgba(99,102,241,0.1)] text-[var(--accent-indigo)]">
              {date.person_name}
            </span>
          )}
        </div>
      </div>
      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium shrink-0"
        style={{ backgroundColor: `${color}22`, color }}>
        {date.date_type}
      </span>
      {days !== null && days >= 0 && (
        <span className="text-[var(--text-secondary)] text-xs shrink-0 font-medium">
          {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `in ${days}d`}
        </span>
      )}
      {hovered && (
        <button
          onClick={() => { if (confirm(`Delete "${date.name}"?`)) onDelete(date) }}
          className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
