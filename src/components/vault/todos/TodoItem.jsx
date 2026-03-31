// src/components/vault/todos/TodoItem.jsx
import { useState } from 'react'
import { Trash2, CheckCircle, Circle } from 'lucide-react'
import InlineEdit from '../InlineEdit'

const PRIORITY_STYLES = {
  high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
}

const PRIORITY_CYCLE = ['low', 'medium', 'high']

export default function TodoItem({ todo, onComplete, onUpdate, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const isCompleted = todo.status === 'completed'
  const priority = (todo.priority || 'medium').toLowerCase()
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium

  const handlePriorityCycle = () => {
    const idx = PRIORITY_CYCLE.indexOf(priority)
    const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]
    onUpdate({ ...todo, priority: next })
  }

  const formatDueDate = (d) => {
    if (!d) return null
    const date = new Date(d + 'T00:00:00')
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const diff = Math.floor((date - now) / 86400000)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (diff < 0) return { label, overdue: true }
    if (diff === 0) return { label: 'Today', overdue: false }
    if (diff === 1) return { label: 'Tomorrow', overdue: false }
    return { label, overdue: false }
  }

  const due = formatDueDate(todo.due_date)

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
        isCompleted ? 'opacity-50' : 'hover:bg-[var(--bg-tertiary)]/30'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button onClick={() => onComplete(todo)} className="shrink-0">
        {isCompleted ? (
          <CheckCircle size={18} className="text-[var(--status-resolved)]" />
        ) : (
          <Circle size={18} className="text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)]" />
        )}
      </button>
      <div className={`flex-1 min-w-0 ${isCompleted ? 'line-through' : ''}`}>
        {isCompleted ? (
          <span className="text-[var(--text-secondary)] text-sm">{todo.title}</span>
        ) : (
          <InlineEdit
            value={todo.title}
            onSave={(val) => onUpdate({ ...todo, title: val })}
            className="text-sm"
          />
        )}
      </div>
      {!isCompleted && (
        <button
          onClick={handlePriorityCycle}
          className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0"
          style={{ backgroundColor: pStyle.bg, color: pStyle.text }}
          title="Click to change priority"
        >
          {priority}
        </button>
      )}
      {due && (
        <span className={`text-[10px] shrink-0 ${due.overdue ? 'text-red-400 font-medium' : 'text-[var(--text-tertiary)]'}`}>
          {due.label}
        </span>
      )}
      {hovered && !isCompleted && (
        <button
          onClick={() => { if (confirm('Delete this todo?')) onDelete(todo) }}
          className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
