// src/components/vault/dates/DateDetailSheet.jsx
import { useState } from 'react'
import SheetWrapper from '../shared/SheetWrapper'

const DATE_TYPES = ['birthday', 'anniversary', 'deadline', 'milestone', 'event', 'annual']

export default function DateDetailSheet({ date, onSave, onDelete, onClose }) {
  const parts = (date.month_day || '').split('-')
  const [name, setName] = useState(date.name || '')
  const [month, setMonth] = useState(parts[0] || '')
  const [day, setDay] = useState(parts[1] || '')
  const [year, setYear] = useState(date.year || '')
  const [dateType, setDateType] = useState(date.date_type || 'annual')
  const [recurs, setRecurs] = useState(date.recurs || 'annual')
  const [importance, setImportance] = useState(date.importance || 'medium')
  const [notes, setNotes] = useState(date.notes || '')

  const isDirty = name.trim() !== (date.name || '')
    || month !== (parts[0] || '')
    || day !== (parts[1] || '')
    || (year ? parseInt(year) : null) !== (date.year || null)
    || dateType !== (date.date_type || 'annual')
    || recurs !== (date.recurs || 'annual')
    || importance !== (date.importance || 'medium')
    || (notes.trim() || null) !== (date.notes || null)

  const handleSave = () => {
    if (!name.trim() || !month || !day) return
    const monthDay = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    onSave(date, {
      name: name.trim(),
      month_day: monthDay,
      year: year ? parseInt(year) : null,
      date_type: dateType,
      recurs,
      importance,
      notes: notes.trim() || null,
      person_name: date.person_name || null,
    })
    onClose()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-indigo)]'
  const selectCls = `${inputCls} appearance-none`

  return (
    <SheetWrapper isDirty={isDirty} onSave={handleSave} onClose={onClose}>
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Title</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>

      <div className="flex gap-2 mb-4 items-end">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Month</label>
          <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="MM" className={`${inputCls} text-center`} />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Day</label>
          <input type="number" min="1" max="31" value={day} onChange={(e) => setDay(e.target.value)} placeholder="DD" className={`${inputCls} text-center`} />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Year</label>
          <input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} placeholder="—" className={`${inputCls} text-center`} />
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Type</label>
          <select value={dateType} onChange={(e) => setDateType(e.target.value)} className={selectCls}>
            {DATE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Priority</label>
          <select value={importance} onChange={(e) => setImportance(e.target.value)} className={selectCls}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Recurrence</label>
        <select value={recurs} onChange={(e) => setRecurs(e.target.value)} className={selectCls}>
          <option value="annual">Annual (recurring)</option>
          <option value="once">One-time</option>
        </select>
      </div>

      <div className="mb-5">
        <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={2}
          className={`${inputCls} resize-none`} />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={!name.trim() || !month || !day}
          className="flex-1 py-2.5 rounded-xl bg-[var(--accent-indigo)] text-white text-sm font-medium disabled:opacity-40">
          Save
        </button>
        <button onClick={() => { if (confirm(`Delete "${date.name}"?`)) { onDelete(date); onClose() } }}
          className="py-2.5 px-5 rounded-xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.05)] text-red-400 text-sm font-medium">
          Delete
        </button>
      </div>
    </SheetWrapper>
  )
}
