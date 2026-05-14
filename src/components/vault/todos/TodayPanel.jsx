// src/components/vault/todos/TodayPanel.jsx
import { useState, useRef } from 'react'
import { Sun, GripVertical, X, Check, Circle, Maximize2, Minimize2 } from 'lucide-react'

const PRIORITY_STYLES = {
  high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
}

function formatDue(d) {
  if (!d) return null
  const date = new Date(d + 'T00:00:00')
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const diff = Math.floor((date - now) / 86400000)
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diff < 0) return { label: 'OVERDUE', cls: 'text-red-400 font-medium' }
  if (diff === 0) return { label: 'Today', cls: 'text-[var(--accent-amber)] font-medium' }
  if (diff === 1) return { label: 'Tomorrow', cls: '' }
  return { label, cls: '' }
}

function TagPill({ tag }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded-lg text-[9px] font-medium"
      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
    >
      {tag.name}
    </span>
  )
}

export default function TodayPanel({ todos, tags, onComplete, onRemoveFromToday, onReorder, expanded, onToggleExpand }) {
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [dragPosition, setDragPosition] = useState(null)
  const dragRef = useRef(null)

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const total = todos.length

  const handleDragStart = (e, id) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    dragRef.current = e.target
    setTimeout(() => { if (dragRef.current) dragRef.current.classList.add('opacity-30') }, 0)
  }

  const handleDragEnd = () => {
    if (dragRef.current) dragRef.current.classList.remove('opacity-30')
    setDragId(null)
    setDragOverId(null)
    setDragPosition(null)
    dragRef.current = null
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    setDragOverId(id)
    setDragPosition(e.clientY < mid ? 'above' : 'below')
  }

  const handleDragLeave = () => {
    setDragOverId(null)
    setDragPosition(null)
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    e.stopPropagation()
    const sourceId = e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId) return

    const ids = todos.map((t) => t.id)
    const sourceIdx = ids.indexOf(sourceId)
    if (sourceIdx > -1) ids.splice(sourceIdx, 1)
    const targetIdx = ids.indexOf(targetId)
    const insertIdx = dragPosition === 'above' ? targetIdx : targetIdx + 1
    ids.splice(insertIdx, 0, sourceId)
    onReorder(ids)

    setDragOverId(null)
    setDragPosition(null)
  }

  const getTagObj = (todo) => {
    const todoTags = todo.tags || []
    if (todoTags.length === 0) return null
    const tagName = todoTags[0]
    return tags.find((t) => t.name === tagName) || { name: tagName, color: '#818cf8' }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Sun size={18} className="text-[var(--accent-amber)]" />
              For Today
              <span className="text-xs font-normal text-[var(--text-tertiary)]">
                &middot; {total} item{total !== 1 ? 's' : ''}
              </span>
            </h2>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{todayDate}</div>
          </div>
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-tertiary)] text-[10px] font-medium hover:border-[var(--border-active)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {todos.map((todo, i) => {
          const due = formatDue(todo.due_date)
          const tag = getTagObj(todo)
          const p = (todo.priority || 'medium').toLowerCase()
          const pStyle = PRIORITY_STYLES[p] || PRIORITY_STYLES.medium
          const isOver = dragOverId === todo.id

          return (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, todo.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, todo.id)}
              className={`group flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors relative hover:bg-[var(--bg-tertiary)]/30 ${
                isOver && dragPosition === 'above' ? 'shadow-[inset_0_2px_0_0_var(--accent-indigo)]' : ''
              } ${isOver && dragPosition === 'below' ? 'shadow-[inset_0_-2px_0_0_var(--accent-indigo)]' : ''}`}
            >
              <GripVertical size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 mt-0.5 cursor-grab shrink-0" />
              <span className="text-[10px] font-semibold text-[var(--text-tertiary)] min-w-[14px] text-right mt-1 tabular-nums">{i + 1}</span>
              <button onClick={() => onComplete(todo)} className="mt-0.5 shrink-0">
                <Circle size={16} className="text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)]" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--text-primary)] flex-1 min-w-0">{todo.title}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-medium capitalize shrink-0"
                    style={{ backgroundColor: pStyle.bg, color: pStyle.text }}
                  >
                    {p}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {tag && <TagPill tag={tag} />}
                  {todo.linked_entity_name && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[rgba(96,165,250,0.12)] text-[#60a5fa]">
                      {todo.linked_entity_name}
                    </span>
                  )}
                  {due && <span className={`text-[9px] ${due.cls || 'text-[var(--text-tertiary)]'}`}>{due.label}</span>}
                </div>
              </div>
              <button
                onClick={() => onRemoveFromToday(todo)}
                className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-red-400 transition-all"
                title="Remove from today"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}

        {/* Drop zone */}
        <div
          className="border-[1.5px] border-dashed border-[var(--border-active)] rounded-xl py-7 text-center mt-2 transition-colors opacity-50 hover:opacity-70"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[var(--accent-amber)]', 'bg-[rgba(245,158,11,0.04)]', 'opacity-100') }}
          onDragLeave={(e) => { e.currentTarget.classList.remove('border-[var(--accent-amber)]', 'bg-[rgba(245,158,11,0.04)]', 'opacity-100') }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('border-[var(--accent-amber)]', 'bg-[rgba(245,158,11,0.04)]', 'opacity-100')
            const id = e.dataTransfer.getData('text/plain')
            if (id) {
              // This will be handled by the parent via the external drop handler
              const event = new CustomEvent('todayDrop', { detail: { todoId: id } })
              window.dispatchEvent(event)
            }
          }}
        >
          <div className="text-lg opacity-50 mb-1">&#8693;</div>
          <div className="text-xs text-[var(--text-tertiary)]">Drag a todo here to add it to today</div>
          <div className="text-[10px] text-[var(--text-tertiary)] opacity-50 mt-1">or click "Add to today" on any todo</div>
        </div>

        {todos.length === 0 && (
          <div className="text-center py-8">
            <Sun size={24} className="mx-auto text-[var(--text-tertiary)] opacity-30 mb-2" />
            <div className="text-sm text-[var(--text-tertiary)]">No items for today</div>
            <div className="text-xs text-[var(--text-tertiary)] opacity-60 mt-1">Add todos from the main list</div>
          </div>
        )}
      </div>
    </div>
  )
}
