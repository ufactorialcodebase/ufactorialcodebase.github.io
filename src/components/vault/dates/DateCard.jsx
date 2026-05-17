// src/components/vault/dates/DateCard.jsx
// Desktop: inline editable fields. Mobile: tap opens detail sheet.
import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { daysUntilDate as daysUntil } from '../../../lib/format-utils'

const TYPE_ICONS = {
  birthday: '🎂', anniversary: '📌', deadline: '⏰',
  milestone: '🎯', event: '📅', annual: '🔄',
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
  high: { border: 'rgba(248,113,113,0.3)', color: '#f87171' },
  medium: { border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  low: { border: 'var(--border-subtle)', color: 'var(--text-tertiary)' },
}

const PRIORITY_STYLES = {
  high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
}

const DATE_TYPES = ['birthday', 'anniversary', 'deadline', 'milestone', 'event', 'annual']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function parseMonthDay(monthDay) {
  if (!monthDay) return { month: '', day: '' }
  const parts = monthDay.split('-')
  if (parts.length !== 2) return { month: '', day: '' }
  return { month: MONTHS[parseInt(parts[0]) - 1] || '', day: parseInt(parts[1]) || '' }
}

export default function DateCard({ date, isPast, onUpdate, onDelete, onOpenDetail }) {
  const [hovered, setHovered] = useState(false)
  const { month, day } = parseMonthDay(date.month_day)
  const importance = (date.importance || 'medium').toLowerCase()
  const pBadge = PRIORITY_BADGE_COLORS[importance] || PRIORITY_BADGE_COLORS.medium
  const pStyle = PRIORITY_STYLES[importance] || PRIORITY_STYLES.medium
  const typeKey = date.date_type || 'annual'
  const typeColor = TYPE_COLORS[typeKey] || TYPE_COLORS.annual
  const typeIcon = TYPE_ICONS[typeKey] || '📅'
  const isAnnual = date.recurs === 'annual'

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

  // Mobile: tap opens detail sheet (desktop uses inline editing)
  const handleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('select')) return
    // Only open detail sheet on mobile — check via matchMedia
    if (window.matchMedia('(min-width: 768px)').matches) return
    onOpenDetail?.(date)
  }

  // Desktop: inline field change → update
  const handleFieldChange = (field, value) => {
    onUpdate?.(date, { ...date, [field]: value })
  }

  const handleTypeChange = (newType) => handleFieldChange('date_type', newType)
  const handleImportanceChange = (newImp) => handleFieldChange('importance', newImp)
  const handleRecursChange = (newRecurs) => handleFieldChange('recurs', newRecurs)

  const selectCls = 'text-[9px] font-medium rounded-lg px-1.5 py-0.5 cursor-pointer outline-none appearance-none'
  const chevronBg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%235a6478' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")"

  return (
    <div
      className={`py-3 border-b border-[var(--border-subtle)] ${isPast ? 'opacity-55' : ''} md:cursor-default cursor-pointer`}
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
            border: `1px solid ${isPast ? 'var(--border-subtle)' : pBadge.border}`,
          }}
        >
          <span className="text-[7px] font-bold tracking-wide leading-none" style={{ color: isPast ? 'var(--text-tertiary)' : pBadge.color }}>{month}</span>
          <span className="text-[16px] font-bold leading-tight" style={{ color: isPast ? 'var(--text-tertiary)' : pBadge.color }}>{day}</span>
          {date.year && <span className="text-[7px] font-medium leading-none mt-px text-[var(--text-tertiary)]">{date.year}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-[var(--text-primary)]">{date.name}</span>
        </div>
        <span className={`text-[11px] shrink-0 ${countdownCls}`}>{countdown}</span>
        {/* Desktop delete */}
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${date.name}"?`)) onDelete(date) }}
            className="hidden md:block text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Row 2: priority + type + recurrence */}
      <div className="flex items-center gap-1.5 mt-1.5 ml-[54px]">
        {/* Mobile: static badges. Desktop: dropdowns */}
        <span className="md:hidden px-1.5 py-0.5 rounded-full text-[9px] font-medium capitalize"
          style={{ backgroundColor: pStyle.bg, color: pStyle.text }}>
          {importance}
        </span>
        <select
          value={importance}
          onChange={(e) => { e.stopPropagation(); handleImportanceChange(e.target.value) }}
          className={`hidden md:inline-block ${selectCls}`}
          style={{ backgroundColor: pStyle.bg, color: pStyle.text, paddingRight: '14px', backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 3px center' }}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <span className="md:hidden px-1.5 py-0.5 rounded-lg text-[9px] font-medium capitalize"
          style={{ backgroundColor: typeColor.bg, color: typeColor.text }}>
          {typeIcon} {typeKey}
        </span>
        <select
          value={typeKey}
          onChange={(e) => { e.stopPropagation(); handleTypeChange(e.target.value) }}
          className={`hidden md:inline-block ${selectCls}`}
          style={{ backgroundColor: typeColor.bg, color: typeColor.text, paddingRight: '14px', backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 3px center' }}
        >
          {DATE_TYPES.map((t) => <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        <span className="md:hidden text-[9px] text-[var(--text-tertiary)]">{isAnnual ? 'Annual' : 'One-time'}</span>
        <select
          value={date.recurs || 'annual'}
          onChange={(e) => { e.stopPropagation(); handleRecursChange(e.target.value) }}
          className={`hidden md:inline-block ${selectCls} text-[var(--text-tertiary)]`}
          style={{ paddingRight: '14px', backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 3px center' }}
        >
          <option value="annual">Annual</option>
          <option value="once">One-time</option>
        </select>
      </div>

      {/* Row 3: person + notes (if present) */}
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
    </div>
  )
}
