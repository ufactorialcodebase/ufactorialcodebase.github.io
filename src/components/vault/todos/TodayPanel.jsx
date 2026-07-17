// src/components/vault/todos/TodayPanel.jsx
import { useState, useRef } from 'react'
import { Sun, GripVertical, X, Check, Circle, Maximize2, Minimize2, Calendar } from 'lucide-react'
import { useNow } from '../../../hooks/useNow'

const PRIORITY_STYLES = {
  high: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
}

// ISS-248: accept `now` so persona-demo callers can substitute the
// story-time anchor for real Date.now() when computing OVERDUE / Today.
function formatDue(d, now) {
  if (!d) return null
  const date = new Date(d + 'T00:00:00')
  const nowStart = now ? new Date(now.getTime()) : new Date()
  nowStart.setHours(0, 0, 0, 0)
  const diff = Math.floor((date - nowStart) / 86400000)
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

export default function TodayPanel({ todos, tags, onComplete, onUpdate, onSetTags, onRemoveFromToday, onReorder, expanded, onToggleExpand }) {
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [dragPosition, setDragPosition] = useState(null)
  const dragRef = useRef(null)
  // ISS-248: persona anchor in demo, real Date.now() otherwise.
  const now = useNow()

  const todayDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
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
          const due = formatDue(todo.due_date, now)
          const tag = getTagObj(todo)
          const p = (todo.priority || 'medium').toLowerCase()
          const pStyle = PRIORITY_STYLES[p] || PRIORITY_STYLES.medium
          const isOver = dragOverId === todo.id

          const todoTags = todo.tags || []

          return (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, todo.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, todo.id)}
              className={`group flex items-start gap-2.5 px-3 py-2.5 pr-8 rounded-xl transition-colors relative hover:bg-[var(--bg-tertiary)]/30 ${
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
                  {/* Tag selector */}
                  {tags.length > 0 ? (
                    <select
                      value={todoTags[0] || ''}
                      onChange={(e) => onSetTags(todo, e.target.value ? [e.target.value] : [])}
                      className="text-[9px] font-medium rounded-lg px-1.5 py-0.5 cursor-pointer outline-none appearance-none"
                      style={{
                        paddingRight: '14px',
                        backgroundColor: tag ? `${tag.color}20` : 'transparent',
                        color: tag ? tag.color : 'var(--text-tertiary)',
                        border: tag ? '1px solid transparent' : '1px dashed var(--border-active)',
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%235a6478' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 4px center',
                      }}
                    >
                      <option value="">{tag ? 'Remove tag' : '+ add tag'}</option>
                      {tags.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  ) : tag ? (
                    <TagPill tag={tag} />
                  ) : null}
                  {todo.linked_entity_name && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[rgba(96,165,250,0.12)] text-[#60a5fa]">
                      {todo.linked_entity_name}
                    </span>
                  )}
                  {/* Clickable due date */}
                  <span className="relative">
                    <span className={`text-[9px] cursor-pointer hover:underline ${due?.cls || 'text-[var(--text-tertiary)]'}`}
                      onClick={(e) => e.currentTarget.nextElementSibling?.showPicker?.()}>
                      {due ? due.label : 'No due date'}
                    </span>
                    <input
                      type="date"
                      value={todo.due_date || ''}
                      onChange={(e) => onUpdate({ ...todo, due_date: e.target.value || null })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer [color-scheme:dark]"
                      tabIndex={-1}
                    />
                  </span>
                </div>
              </div>
              {/* X button — positioned outside the content flow to avoid overlap */}
              <button
                onClick={() => onRemoveFromToday(todo)}
                className="absolute right-1.5 top-1.5 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-[rgba(248,113,113,0.1)] transition-all"
                title="Remove from today"
              >
                <X size={12} />
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
