// src/components/vault/todos/TodoDetailSheet.jsx
// Mobile-only slide-up sheet for editing a todo
import { useState, useEffect } from 'react'

export default function TodoDetailSheet({ todo, tags, onUpdate, onSetTags, onSetToday, onDelete, onClose }) {
  const [title, setTitle] = useState(todo.title)
  const [priority, setPriority] = useState(todo.priority || 'medium')
  const [dueDate, setDueDate] = useState(todo.due_date || '')
  const [tag, setTag] = useState((todo.tags || [])[0] || '')
  const [inToday, setInToday] = useState(todo.in_today || false)

  useEffect(() => {
    setTitle(todo.title)
    setPriority(todo.priority || 'medium')
    setDueDate(todo.due_date || '')
    setTag((todo.tags || [])[0] || '')
    setInToday(todo.in_today || false)
  }, [todo])

  const handleSave = () => {
    if (title.trim() !== todo.title) onUpdate({ ...todo, title: title.trim() })
    if (priority !== todo.priority) onUpdate({ ...todo, priority })
    if ((dueDate || null) !== todo.due_date) onUpdate({ ...todo, due_date: dueDate || null })
    const currentTag = (todo.tags || [])[0] || ''
    if (tag !== currentTag) onSetTags(todo, tag ? [tag] : [])
    if (inToday !== (todo.in_today || false)) onSetToday(todo, inToday)
    onClose()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-indigo)]'
  const selectCls = `${inputCls} appearance-none`

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={(e) => { if (e.target === e.currentTarget) handleSave() }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-[var(--bg-secondary)] rounded-t-2xl px-5 pb-6 pt-0 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="w-9 h-1 rounded-full bg-[var(--border-active)] mx-auto mt-3 mb-5" />

        {/* Title */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Priority + Due Date side by side */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </div>
        </div>

        {/* Tag */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Tag</label>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className={selectCls}>
            <option value="">No tag</option>
            {tags.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {/* For Today toggle */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">For Today</label>
          <button
            onClick={() => setInToday(!inToday)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm ${
              inToday ? 'text-[var(--accent-amber)]' : 'text-[var(--text-tertiary)]'
            }`}
          >
            <span>Add to today's focus list</span>
            <div className={`w-10 h-[22px] rounded-full relative transition-colors ${inToday ? 'bg-[var(--accent-amber)]' : 'bg-[var(--bg-tertiary)]'}`}>
              <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all ${inToday ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {/* Source (read-only) */}
        <div className="mb-5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 block">Source</label>
          <div className="text-xs text-[var(--text-tertiary)] px-1">
            {todo.source === 'ai_manager' ? 'Created from chat' : 'Created from UI'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[var(--accent-indigo)] text-white text-sm font-medium"
          >
            Save
          </button>
          <button
            onClick={() => { if (confirm('Delete this todo?')) { onDelete(todo); onClose() } }}
            className="py-2.5 px-5 rounded-xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.05)] text-red-400 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
