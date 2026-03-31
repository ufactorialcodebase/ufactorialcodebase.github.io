// src/components/vault/lists/CreateListForm.jsx
import { useState } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
]

export default function CreateListForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), category })
      setName('')
      setCategory('general')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name"
          className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent-indigo)]"
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="ml-auto px-3 py-1 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Create
        </button>
      </div>
    </form>
  )
}
