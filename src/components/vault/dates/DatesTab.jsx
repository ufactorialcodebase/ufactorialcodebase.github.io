// src/components/vault/dates/DatesTab.jsx
import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import DateCard from './DateCard'
import CreateDateForm from './CreateDateForm'
import { getDates, createDate, deleteDate } from '../../../lib/api/vault-dates'
import { useVaultData, setCached } from '../../../lib/vault-cache'
import { daysUntilDate } from '../../../lib/format-utils'

export default function DatesTab() {
  const { data: dateData, loading, error, refetch } = useVaultData('dates', getDates, {
    transform: (result) => result.dates || []
  })
  const [dates, setDates] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => { if (dateData) setDates(dateData) }, [dateData])

  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const up = []
    const pa = []
    for (const d of dates) {
      const days = daysUntilDate(d.month_day)
      if (days >= 0) up.push({ ...d, _daysUntil: days })
      else pa.push(d)
    }
    up.sort((a, b) => a._daysUntil - b._daysUntil)
    return { upcoming: up, past: pa }
  }, [dates])

  const handleCreate = async (data) => {
    try {
      const result = await createDate(data)
      const updated = result.dates || []
      setDates(updated)
      setCached('dates', updated)
      setShowCreateForm(false)
    } catch (err) {
      alert('Failed to add date: ' + err.message)
    }
  }

  const handleDelete = async (date) => {
    try {
      const result = await deleteDate(date.name)
      const updated = result.dates || []
      setDates(updated)
      setCached('dates', updated)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
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

      {upcoming.length > 0 && (
        <div className="mb-6">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">Upcoming</div>
          {upcoming.map((d, i) => <DateCard key={d.name + i} date={d} onDelete={handleDelete} />)}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">Past</div>
          {past.map((d, i) => <DateCard key={d.name + i} date={d} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}
