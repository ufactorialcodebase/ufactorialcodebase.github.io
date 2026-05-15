// src/components/vault/todos/CreateTodoForm.jsx
import { useState } from 'react'
import { X, Sun } from 'lucide-react'

export default function CreateTodoForm({ tags, onSubmit, onCancel, onOpenTagModal }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [tag, setTag] = useState('')
  const [addToToday, setAddToToday] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      priority,
      due_date: dueDate || null,
      tags: tag ? [tag] : null,
      in_today: addToToday,
    })
    setTitle('')
    setPriority('medium')
    setDueDate('')
    setTag('')
    setAddToToday(false)
  }

  const inputCls = 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none focus:border-[var(--accent-indigo)]'

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent-indigo)]"
        />
        <button type="button" onClick={onCancel} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <X size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`${inputCls} [color-scheme:dark]`}
        />
        {tags.length > 0 ? (
          <select value={tag} onChange={(e) => setTag(e.target.value)} className={inputCls}>
            <option value="">No tag</option>
            {tags.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        ) : (
          <button
            type="button"
            onClick={() => onOpenTagModal?.()}
            className={`${inputCls} border-dashed hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors cursor-pointer`}
          >
            + create tag
          </button>
        )}
        <button
          type="button"
          onClick={() => setAddToToday(!addToToday)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            addToToday
              ? 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)] text-[var(--accent-amber)]'
              : 'border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[rgba(245,158,11,0.3)] hover:text-[var(--accent-amber)]'
          }`}
        >
          <Sun size={12} /> Add to today
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="ml-auto px-3 py-1 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </div>
    </form>
  )
}
