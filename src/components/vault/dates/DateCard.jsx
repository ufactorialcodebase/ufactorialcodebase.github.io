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

const IMPORTANCE_STYLES = {
  high: { bg: 'rgba(244,63,94,0.12)', text: '#fb7185' },
  medium: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.12)', text: '#8b95a8' },
}

function daysUntil(monthDay) {
  if (!monthDay) return null
  const parts = monthDay.split('-')
  if (parts.length !== 2) return null
  const month = parseInt(parts[0]) - 1
  const day = parseInt(parts[1])
  if (isNaN(month) || isNaN(day)) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), month, day)
  if (next < now) next = new Date(now.getFullYear() + 1, month, day)
  const diff = Math.ceil((next - now) / 86400000)
  return diff
}

function formatDate(monthDay, year) {
  if (!monthDay) return ''
  const parts = monthDay.split('-')
  if (parts.length !== 2) return monthDay
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formatted = `${months[parseInt(parts[0]) - 1]} ${parseInt(parts[1])}`
  return year ? `${formatted}, ${year}` : formatted
}

export default function DateCard({ date, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const color = TYPE_COLORS[date.date_type] || TYPE_COLORS.annual
  const days = daysUntil(date.month_day)
  const importance = (date.importance || 'medium').toLowerCase()
  const impStyle = IMPORTANCE_STYLES[importance] || IMPORTANCE_STYLES.medium

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
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-primary)] text-base font-semibold">
            {formatDate(date.month_day, date.year)}: {date.name}
          </span>
          {date.importance && date.importance !== 'medium' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase shrink-0"
              style={{ backgroundColor: impStyle.bg, color: impStyle.text }}>
              {importance}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {date.recurs && (
            <span className={`text-[11px] ${date.recurs === 'annual' ? 'text-amber-400' : 'text-[var(--text-tertiary)]'}`}>
              {date.recurs === 'annual' ? 'Recurring' : 'One-time'}
            </span>
          )}
          {date.person_name && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[rgba(99,102,241,0.1)] text-[var(--accent-indigo)]">
              {date.person_name}
            </span>
          )}
        </div>
        {date.notes && (
          <p className="text-[var(--text-tertiary)] text-xs mt-1 truncate">{date.notes}</p>
        )}
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
