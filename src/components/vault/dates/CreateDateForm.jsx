// src/components/vault/dates/CreateDateForm.jsx
import { useState } from 'react'
import { X } from 'lucide-react'

const DATE_TYPES = ['birthday', 'anniversary', 'deadline', 'milestone', 'event', 'annual']

export default function CreateDateForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [dateType, setDateType] = useState('annual')
  const [personName, setPersonName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !month || !day) return
    const dateStr = year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : `${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    onSubmit({
      name: name.trim(),
      date: dateStr,
      date_type: dateType,
      person_name: personName.trim() || null,
    })
    setName(''); setMonth(''); setDay(''); setYear(''); setDateType('annual'); setPersonName('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Date title (e.g., Mom's birthday)"
          className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent-indigo)]" />
        <button type="button" onClick={onCancel} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><X size={16} /></button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select value={dateType} onChange={(e) => setDateType(e.target.value)}
          className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none">
          {DATE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input type="number" min="1" max="12" placeholder="MM" value={month} onChange={(e) => setMonth(e.target.value)}
          className="w-14 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none text-center" />
        <span className="text-[var(--text-tertiary)] text-xs">/</span>
        <input type="number" min="1" max="31" placeholder="DD" value={day} onChange={(e) => setDay(e.target.value)}
          className="w-14 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none text-center" />
        <span className="text-[var(--text-tertiary)] text-xs">/</span>
        <input type="number" min="1900" max="2100" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)}
          className="w-16 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none text-center" />
        <input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Person (optional)"
          className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none w-28" />
        <button type="submit" disabled={!name.trim() || !month || !day}
          className="ml-auto px-3 py-1 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity">
          Add
        </button>
      </div>
    </form>
  )
}
