// src/components/vault/todos/TodoItem.jsx
import { useState, useRef } from 'react'
import { Trash2, CheckCircle, Circle, Sun, Check } from 'lucide-react'
import InlineEdit from '../InlineEdit'

const PRIORITY_STYLES = {
  high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
}

function formatDueDate(d) {
  if (!d) return null
  const date = new Date(d + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.floor((date - now) / 86400000)
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diff < 0) return { label: 'OVERDUE', overdue: true }
  if (diff === 0) return { label: 'Due today', overdue: false, today: true }
  if (diff === 1) return { label: 'Due tomorrow', overdue: false }
  return { label: `Due ${label}`, overdue: false }
}

export default function TodoItem({ todo, tags, onComplete, onUpdate, onDelete, onSetToday, onSetTags, onOpenTagModal, draggable: isDraggable }) {
  const [hovered, setHovered] = useState(false)
  const dateRef = useRef(null)
  const isCompleted = todo.status === 'completed'
  const priority = (todo.priority || 'medium').toLowerCase()
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium
  const due = formatDueDate(todo.due_date)
  const isInToday = todo.in_today

  // Only show "from chat" for AI-created todos; vault/user-created show nothing
  const sourceLabel = todo.source === 'ai_manager' ? 'from chat' : null

  const todoTags = todo.tags || []
  const firstTag = todoTags.length > 0
    ? tags.find((t) => t.name === todoTags[0]) || { name: todoTags[0], color: '#818cf8' }
    : null

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', todo.id)
    setTimeout(() => e.target.classList.add('opacity-30'), 0)
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-30')
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-0.5 transition-colors ${
        isCompleted ? 'opacity-45' : 'hover:bg-[var(--bg-tertiary)]/30'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      draggable={isDraggable && !isCompleted}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      data-todo-id={todo.id}
    >
      {/* Checkbox */}
      <button onClick={() => onComplete(todo)} className="shrink-0">
        {isCompleted ? (
          <CheckCircle size={18} className="text-[var(--status-resolved)]" />
        ) : (
          <Circle size={18} className="text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)]" />
        )}
      </button>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isCompleted ? 'line-through' : ''}`}>
        <div className="flex items-center gap-1.5">
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
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {/* Source label — moved under title */}
          {sourceLabel && (
            <span className="text-[var(--text-tertiary)] text-[9px] shrink-0">{sourceLabel}</span>
          )}

          {/* Tag selector — always shown for non-completed todos */}
          {!isCompleted ? (
            tags.length > 0 ? (
              <select
                value={todoTags[0] || ''}
                onChange={(e) => onSetTags(todo, e.target.value ? [e.target.value] : [])}
                className="text-[9px] font-medium rounded-lg px-1.5 py-0.5 cursor-pointer outline-none appearance-none"
                style={{
                  paddingRight: '14px',
                  backgroundColor: firstTag ? `${firstTag.color}20` : 'transparent',
                  color: firstTag ? firstTag.color : 'var(--text-tertiary)',
                  border: firstTag ? '1px solid transparent' : '1px dashed var(--border-active)',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%235a6478' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 4px center',
                }}
              >
                <option value="">{firstTag ? 'Remove tag' : '+ add tag'}</option>
                {tags.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            ) : (
              <button
                onClick={() => onOpenTagModal?.()}
                className="text-[9px] font-medium rounded-lg px-1.5 py-0.5 border border-dashed border-[var(--border-active)] text-[var(--text-tertiary)] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors"
              >
                + create tag
              </button>
            )
          ) : firstTag ? (
            <span
              className="px-1.5 py-0.5 rounded-lg text-[9px] font-medium"
              style={{ backgroundColor: `${firstTag.color}20`, color: firstTag.color }}
            >
              {firstTag.name}
            </span>
          ) : null}

          {/* Entity name */}
          {todo.linked_entity_name && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[rgba(96,165,250,0.12)] text-[#60a5fa]">
              {todo.linked_entity_name}
            </span>
          )}

          {/* Topic name */}
          {todo.linked_topic_name && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[rgba(20,184,166,0.1)] text-[#14b8a6]">
              {todo.linked_topic_name}
            </span>
          )}

          {/* Completed date */}
          {isCompleted && todo.completed_at && (
            <span className="text-[9px] text-[var(--text-tertiary)]">
              Completed {new Date(todo.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Right side: priority, due date, actions — fixed widths for alignment */}
      {!isCompleted && (
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* Priority — fixed width */}
          <select
            value={priority}
            onChange={(e) => onUpdate({ ...todo, priority: e.target.value })}
            className="w-[72px] px-2 py-0.5 rounded-full text-[10px] font-medium capitalize cursor-pointer outline-none appearance-none text-center"
            style={{
              backgroundColor: pStyle.bg,
              color: pStyle.text,
              paddingRight: '16px',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(pStyle.text)}' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 4px center',
            }}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Due date — fixed width, fully clickable */}
          <div className="relative w-[90px] shrink-0">
            <input
              ref={dateRef}
              type="date"
              value={todo.due_date || ''}
              onChange={(e) => onUpdate({ ...todo, due_date: e.target.value || null })}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer [color-scheme:dark]"
              tabIndex={-1}
            />
            <span
              onClick={() => dateRef.current?.showPicker?.()}
              className={`block text-[10px] cursor-pointer hover:underline text-center ${
                due?.overdue ? 'text-red-400 font-medium' : due?.today ? 'text-[var(--accent-amber)] font-medium' : 'text-[var(--text-tertiary)]'
              }`}
            >
              {due ? due.label : 'No due date'}
            </span>
          </div>

          {/* Hover actions — fixed width */}
          <div className={`flex gap-0.5 w-[110px] justify-end shrink-0 ${hovered ? 'visible' : 'invisible'}`}>
            <button
              onClick={() => onSetToday(todo, !isInToday)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                isInToday
                  ? 'bg-[rgba(52,211,153,0.08)] text-[var(--status-resolved)] italic'
                  : 'bg-[rgba(245,158,11,0.1)] text-[var(--accent-amber)] hover:bg-[rgba(245,158,11,0.2)]'
              }`}
            >
              {isInToday ? <><Check size={10} /> In today</> : <><Sun size={10} /> Add to today</>}
            </button>
            <button
              onClick={() => { if (confirm('Delete this todo?')) onDelete(todo) }}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-[rgba(248,113,113,0.1)] hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
