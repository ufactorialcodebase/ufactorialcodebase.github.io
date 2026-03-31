// src/components/vault/todos/CreateTodoForm.jsx
import { useState } from 'react'
import { X } from 'lucide-react'

export default function CreateTodoForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      priority,
      due_date: dueDate || null,
    })
    setTitle('')
    setPriority('medium')
    setDueDate('')
  }

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
      <div className="flex items-center gap-3">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs outline-none"
        />
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
