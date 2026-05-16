// src/components/vault/dates/DateCard.jsx
// Redesigned: date badge, 3-row layout, priority-colored badge, tap-to-edit on mobile
import { useState } from 'react'
import { daysUntilDate as daysUntil } from '../../../lib/format-utils'

const TYPE_ICONS = {
  birthday: '🎂',
  anniversary: '📌',
  deadline: '⏰',
  milestone: '🎯',
  event: '📅',
  annual: '🔄',
}

const TYPE_COLORS = {
  birthday: { bg: 'rgba(236,72,153,0.12)', text: '#ec4899' },
  anniversary: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa' },
  deadline: { bg: 'rgba(248,113,113,0.12)', text: '#f87171' },
  milestone: { bg: 'rgba(52,211,153,0.12)', text: '#34d399' },
  event: { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa' },
  annual: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
}

const PRIORITY_BADGE_COLORS = {
  high: { border: 'rgba(248,113,113,0.3)', month: '#f87171', day: '#f87171' },
  medium: { border: 'rgba(245,158,11,0.3)', month: '#f59e0b', day: '#f59e0b' },
  low: { border: 'var(--border-subtle)', month: 'var(--text-tertiary)', day: 'var(--text-primary)' },
}

const PRIORITY_STYLES = {
  high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function parseMonthDay(monthDay) {
  if (!monthDay) return { month: '', day: '' }
  const parts = monthDay.split('-')
  if (parts.length !== 2) return { month: '', day: '' }
  return { month: MONTHS[parseInt(parts[0]) - 1] || '', day: parseInt(parts[1]) || '' }
}

export default function DateCard({ date, isPast, onDelete, onOpenDetail }) {
  const [hovered, setHovered] = useState(false)
  const { month, day } = parseMonthDay(date.month_day)
  const importance = (date.importance || 'medium').toLowerCase()
  const pColors = PRIORITY_BADGE_COLORS[importance] || PRIORITY_BADGE_COLORS.medium
  const pStyle = PRIORITY_STYLES[importance] || PRIORITY_STYLES.medium
  const typeKey = date.date_type || 'annual'
  const typeColor = TYPE_COLORS[typeKey] || TYPE_COLORS.annual
  const typeIcon = TYPE_ICONS[typeKey] || '📅'
  const isAnnual = date.recurs === 'annual'

  // Countdown logic
  const rawDays = daysUntil(date.month_day)
  let countdown = ''
  let countdownCls = 'text-[var(--text-tertiary)]'
  if (isPast && !isAnnual) {
    countdown = 'Passed'
    countdownCls = 'text-[var(--text-tertiary)] italic'
  } else if (isPast && isAnnual) {
    countdown = rawDays !== null ? `Next in ${rawDays}d` : ''
    countdownCls = 'text-[var(--text-tertiary)] italic'
  } else if (rawDays === 0) {
    countdown = 'Today'
    countdownCls = 'text-red-400 font-semibold'
  } else if (rawDays === 1) {
    countdown = 'Tomorrow'
    countdownCls = 'text-[var(--accent-amber)] font-semibold'
  } else if (rawDays !== null && rawDays <= 7) {
    countdown = `In ${rawDays} days`
    countdownCls = 'text-[var(--accent-amber)] font-medium'
  } else if (rawDays !== null) {
    countdown = `In ${rawDays} days`
  }

  const handleClick = (e) => {
    if (e.target.closest('button')) return
    onOpenDetail?.(date)
  }

  return (
    <div
      className={`py-3 border-b border-[var(--border-subtle)] cursor-pointer ${isPast ? 'opacity-55' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Row 1: date badge + title + countdown */}
      <div className="flex items-start gap-3">
        <div
          className="w-[42px] h-[46px] rounded-[10px] flex flex-col items-center justify-center shrink-0"
          style={{
            background: 'var(--bg-tertiary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: isPast ? 'var(--border-subtle)' : pColors.border,
          }}
        >
          <span className="text-[7px] font-bold tracking-wide leading-none" style={{ color: isPast ? 'var(--text-tertiary)' : pColors.month }}>{month}</span>
          <span className="text-[16px] font-bold leading-tight" style={{ color: isPast ? 'var(--text-tertiary)' : pColors.day }}>{day}</span>
          {date.year && <span className="text-[7px] font-medium leading-none mt-px" style={{ color: 'var(--text-tertiary)' }}>{date.year}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-[var(--text-primary)]">{date.name}</span>
        </div>
        <span className={`text-[11px] shrink-0 ${countdownCls}`}>{countdown}</span>
      </div>

      {/* Row 2: priority + type + recurrence */}
      <div className="flex items-center gap-1.5 mt-1.5 ml-[54px]">
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium capitalize"
          style={{ backgroundColor: pStyle.bg, color: pStyle.text }}>
          {importance}
        </span>
        <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-medium capitalize"
          style={{ backgroundColor: typeColor.bg, color: typeColor.text }}>
          {typeIcon} {typeKey}
        </span>
        <span className="text-[9px] text-[var(--text-tertiary)]">{isAnnual ? 'Annual' : 'One-time'}</span>
      </div>

      {/* Row 3: person + notes (only if present) */}
      {(date.person_name || date.notes) && (
        <div className="flex items-center gap-1.5 mt-1 ml-[54px]">
          {date.person_name && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[rgba(96,165,250,0.12)] text-[#60a5fa]">
              {date.person_name}
            </span>
          )}
          {date.notes && (
            <span className="text-[9px] text-[var(--text-tertiary)] italic truncate max-w-[200px]">{date.notes}</span>
          )}
        </div>
      )}

      {/* Desktop delete on hover */}
      {hovered && (
        <div className="hidden md:flex justify-end -mt-4 mr-1">
          <button
            onClick={() => { if (confirm(`Delete "${date.name}"?`)) onDelete(date) }}
            className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
