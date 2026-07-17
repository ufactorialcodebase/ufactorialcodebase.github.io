// src/components/vault/dates/DatesTab.jsx
import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import DateCard from './DateCard'
import CreateDateForm from './CreateDateForm'
import DateDetailSheet from './DateDetailSheet'
import { toast } from 'sonner'
import { getDates, createDate, deleteDate } from '../../../lib/api/vault-dates'
import { useVaultData, setCached } from '../../../lib/vault-cache'
import { daysUntilDate } from '../../../lib/format-utils'
import { useNow } from '../../../hooks/useNow'

const FILTER_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'birthday', label: '🎂 Birthdays' },
  { key: 'anniversary', label: '📌 Anniversaries' },
  { key: 'deadline', label: '⏰ Deadlines' },
  { key: 'event', label: '📅 Events' },
  { key: 'milestone', label: '🎯 Milestones' },
]

export default function DatesTab() {
  const { data: dateData, loading, error, refetch } = useVaultData('dates', getDates, {
    transform: (result) => result.dates || []
  })
  const [dates, setDates] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [detailDate, setDetailDate] = useState(null)
  // ISS-248: story-time now in persona demo, real Date.now() otherwise.
  const now = useNow()

  useEffect(() => { if (dateData) setDates(dateData) }, [dateData])

  const { upcoming, past } = useMemo(() => {
    let filtered = dates
    if (filter !== 'all') filtered = dates.filter((d) => d.date_type === filter)

    const up = []
    const pa = []
    for (const d of filtered) {
      const days = daysUntilDate(d.month_day, now)
      // For annual dates, days is always >= 0 (next occurrence)
      // For one-time past dates, days wraps to next year — check if year is in the past
      const isOnetime = d.recurs === 'once'
      const isPast = isOnetime && d.year && new Date(`${d.year}-${d.month_day}`) < now

      if (isPast) {
        pa.push({ ...d, _isPast: true })
      } else {
        up.push({ ...d, _daysUntil: days ?? 999, _isPast: false })
      }
    }
    up.sort((a, b) => a._daysUntil - b._daysUntil)
    return { upcoming: up, past: pa }
  }, [dates, filter, now])

  const handleCreate = async (data) => {
    try {
      const result = await createDate(data)
      const updated = result.dates || []
      setDates(updated)
      setCached('dates', updated)
      setShowCreateForm(false)
    } catch (err) {
      toast.error('Failed to add date: ' + err.message)
    }
  }

  const handleDelete = async (date) => {
    try {
      const result = await deleteDate(date.name)
      const updated = result.dates || []
      setDates(updated)
      setCached('dates', updated)
    } catch (err) {
      toast.error('Failed to delete: ' + err.message)
    }
  }

  // Update = delete old + create new (no PUT endpoint yet)
  const handleUpdate = async (oldDate, newData) => {
    try {
      // Delete the old date by name
      const deleteResult = await deleteDate(oldDate.name)
      // Create with new data
      const createResult = await createDate(newData)
      const updated = createResult.dates || []
      setDates(updated)
      setCached('dates', updated)
    } catch (err) {
      toast.error('Failed to update: ' + err.message)
      refetch()
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Dates" subtitle="Birthdays, milestones, and important dates" />
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-[var(--bg-secondary)] rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Dates" subtitle="Birthdays, milestones, and important dates" />
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => refetch()}
            className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline">Retry</button>
        </div>
      </div>
    )
  }

  if (dates.length === 0 && !showCreateForm) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Dates" subtitle="Birthdays, milestones, and important dates" />
        <EmptyState icon="📅"
          message="No important dates tracked yet. Mention birthdays, deadlines, or milestones in conversation — or add them here." />
        <div className="flex justify-center mt-2">
          <button onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-sm font-medium hover:opacity-90">
            + Add Date
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Your Dates" subtitle="Birthdays, milestones, and important dates" />
        <button onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium hover:opacity-90 flex items-center gap-1">
          <Plus size={14} /> Add
        </button>
      </div>

      {showCreateForm && <CreateDateForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {FILTER_TYPES.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.12)] text-[var(--accent-indigo)]'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-2">Upcoming ({upcoming.length})</div>
          {upcoming.map((d, i) => (
            <DateCard key={d.name + i} date={d} isPast={false} onUpdate={handleUpdate} onDelete={handleDelete} onOpenDetail={setDetailDate} />
          ))}
        </div>
      )}

      {upcoming.length === 0 && filter !== 'all' && (
        <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">No upcoming dates match this filter</div>
      )}

      {past.length > 0 && (
        <div>
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-2">Past ({past.length})</div>
          {past.map((d, i) => (
            <DateCard key={d.name + i} date={d} isPast={true} onUpdate={handleUpdate} onDelete={handleDelete} onOpenDetail={setDetailDate} />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      {detailDate && (
        <DateDetailSheet
          date={detailDate}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setDetailDate(null)}
        />
      )}
    </div>
  )
}
