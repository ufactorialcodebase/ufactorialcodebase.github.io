// src/components/vault/todos/TodosTab.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import TodoItem from './TodoItem'
import CreateTodoForm from './CreateTodoForm'
import FilterBar from './FilterBar'
import TodayPanel from './TodayPanel'
import TagModal from './TagModal'
import TodoDetailSheet from './TodoDetailSheet'
import {
  getTodos, createTodo, updateTodo, completeTodo, deleteTodo,
  setTodoToday, reorderToday, getTodoTags, createTodoTag, setTodoTags,
} from '../../../lib/api/vault-todos'
import { useVaultData, setCached } from '../../../lib/vault-cache'

export default function TodosTab() {
  // ── Data fetching ──
  const { data: todoData, loading, error, refetch } = useVaultData('todos',
    () => getTodos({ include_completed: true }), {
    transform: (result) => result.todos || []
  })
  const { data: tagData } = useVaultData('todo-tags',
    () => getTodoTags(), {
    transform: (result) => result.tags || []
  })

  const [todos, setTodos] = useState([])
  const [tags, setTags] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [detailTodo, setDetailTodo] = useState(null)
  const [filter, setFilter] = useState({ type: 'all' })
  const [mainExpanded, setMainExpanded] = useState(false)
  const [todayExpanded, setTodayExpanded] = useState(false)
  const [mobileTab, setMobileTab] = useState('all') // 'all' | 'today'

  useEffect(() => { if (todoData) setTodos(todoData) }, [todoData])
  useEffect(() => { if (tagData) setTags(tagData) }, [tagData])

  // Listen for drops on the today panel dropzone
  useEffect(() => {
    const handler = (e) => handleAddToToday(e.detail.todoId)
    window.addEventListener('todayDrop', handler)
    return () => window.removeEventListener('todayDrop', handler)
  }, [todos])

  // ── Derived data ──
  const pending = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    let items = todos.filter((t) => t.status !== 'completed')

    // Apply filter
    if (filter.type === 'priority') items = items.filter((t) => t.priority === filter.value)
    else if (filter.type === 'tag') items = items.filter((t) => (t.tags || []).includes(filter.value))
    else if (filter.type === 'entity') items = items.filter((t) => t.linked_entity_name === filter.value)

    return items.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1
      const pb = priorityOrder[b.priority] ?? 1
      if (pa !== pb) return pa - pb
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    })
  }, [todos, filter])

  const completed = useMemo(() => {
    return todos
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))
  }, [todos])

  const todayTodos = useMemo(() => {
    return todos
      .filter((t) => t.in_today && t.status !== 'completed')
      .sort((a, b) => (a.today_order || 0) - (b.today_order || 0))
  }, [todos])

  // Unique entity names for filter dropdown
  const entityNames = useMemo(() => {
    const names = new Set()
    todos.forEach((t) => { if (t.linked_entity_name) names.add(t.linked_entity_name) })
    return [...names].sort()
  }, [todos])

  // ── Handlers ──
  const updateLocal = useCallback((updater) => {
    setTodos((prev) => {
      const updated = updater(prev)
      setCached('todos', updated)
      return updated
    })
  }, [])

  const handleCreate = async (data) => {
    try {
      const newTodo = await createTodo(data)
      updateLocal((prev) => [...prev, newTodo])
      setShowCreateForm(false)
    } catch (err) {
      toast.error('Failed to create: ' + err.message)
    }
  }

  const handleComplete = async (todo) => {
    try {
      const result = await completeTodo(todo.id)
      updateLocal((prev) => prev.map((t) => t.id === todo.id ? result : t))
    } catch (err) {
      toast.error('Failed to complete: ' + err.message)
    }
  }

  const handleUpdate = async (updatedTodo) => {
    try {
      const result = await updateTodo(updatedTodo.id, {
        title: updatedTodo.title,
        priority: updatedTodo.priority,
        due_date: updatedTodo.due_date,
      })
      updateLocal((prev) => prev.map((t) => t.id === updatedTodo.id ? result : t))
    } catch (err) {
      toast.error('Failed to update: ' + err.message)
    }
  }

  const handleDelete = async (todo) => {
    try {
      await deleteTodo(todo.id)
      updateLocal((prev) => prev.filter((t) => t.id !== todo.id))
    } catch (err) {
      toast.error('Failed to delete: ' + err.message)
    }
  }

  const handleSetToday = async (todo, inToday) => {
    try {
      const result = await setTodoToday(todo.id, inToday)
      updateLocal((prev) => prev.map((t) => t.id === todo.id ? result : t))
    } catch (err) {
      toast.error('Failed to update: ' + err.message)
    }
  }

  const handleAddToToday = async (todoId) => {
    const todo = todos.find((t) => t.id === todoId)
    if (!todo || todo.in_today) return
    handleSetToday(todo, true)
  }

  const handleRemoveFromToday = async (todo) => {
    handleSetToday(todo, false)
  }

  const handleReorderToday = async (todoIds) => {
    // Optimistic: reorder locally first
    updateLocal((prev) => {
      return prev.map((t) => {
        const idx = todoIds.indexOf(t.id)
        if (idx >= 0) return { ...t, today_order: idx + 1 }
        return t
      })
    })
    try {
      await reorderToday(todoIds)
    } catch (err) {
      console.error('Reorder failed:', err)
      refetch()
    }
  }

  const handleSetTags = async (todo, newTags) => {
    try {
      const result = await setTodoTags(todo.id, newTags)
      updateLocal((prev) => prev.map((t) => t.id === todo.id ? result : t))
    } catch (err) {
      toast.error('Failed to set tags: ' + err.message)
    }
  }

  const handleCreateTag = async (name, color) => {
    try {
      const tag = await createTodoTag(name, color)
      setTags((prev) => {
        const updated = [...prev, tag]
        setCached('todo-tags', updated)
        return updated
      })
      setShowTagModal(false)
    } catch (err) {
      toast.error('Failed to create tag: ' + err.message)
    }
  }

  const toggleMainExpand = () => {
    setMainExpanded(!mainExpanded)
    if (!mainExpanded) setTodayExpanded(false)
  }
  const toggleTodayExpand = () => {
    setTodayExpanded(!todayExpanded)
    if (!todayExpanded) setMainExpanded(false)
  }

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Todos" subtitle="Tasks and action items" />
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[var(--bg-secondary)] rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Todos" subtitle="Tasks and action items" />
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => refetch()} className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline">Retry</button>
        </div>
      </div>
    )
  }

  // ── Render ──
  const mainPanel = (
    <div className={`flex flex-col h-full overflow-hidden ${
      todayExpanded ? 'hidden md:flex md:min-w-[48px] md:max-w-[48px]' : ''
    } ${mainExpanded ? 'md:flex-[9]' : 'flex-1'}`}>
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <PageHeader title="Your Todos" subtitle="Tasks and action items" />
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleMainExpand}
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-tertiary)] text-[10px] font-medium hover:border-[var(--border-active)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {mainExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {mainExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium hover:opacity-90 flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <CreateTodoForm tags={tags} onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} onOpenTagModal={() => setShowTagModal(true)} />
        )}

        {/* Empty state */}
        {todos.length === 0 && !showCreateForm && (
          <>
            <EmptyState icon="✅" message="No tasks yet. Mention something you need to do in conversation, or add one here." ctaLabel="Add a Todo" ctaPath="" />
            <div className="flex justify-center mt-2">
              <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-sm font-medium hover:opacity-90">+ Add Todo</button>
            </div>
          </>
        )}

        {todos.length > 0 && (
          <>
            {/* Filter bar */}
            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              tags={tags}
              entities={entityNames}
              onNewTag={() => setShowTagModal(true)}
            />

            {/* Pending */}
            {pending.length > 0 && (
              <div className="mb-4">
                <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-2">
                  Pending ({pending.length})
                </div>
                {pending.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    tags={tags}
                    onComplete={handleComplete}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onSetToday={handleSetToday}
                    onSetTags={handleSetTags}
                    onOpenTagModal={() => setShowTagModal(true)}
                    onOpenDetail={(t) => setDetailTodo(t)}
                    draggable
                  />
                ))}
              </div>
            )}

            {pending.length === 0 && (
              <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
                No todos match this filter
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-1 text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-2 hover:text-[var(--text-secondary)]"
                >
                  Completed ({completed.length})
                  <ChevronDown size={12} className={`transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                </button>
                {showCompleted && completed.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    tags={tags}
                    onComplete={handleComplete}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onSetToday={handleSetToday}
                    onSetTags={handleSetTags}
                    onOpenTagModal={() => setShowTagModal(true)}
                    onOpenDetail={(t) => setDetailTodo(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  const todayPanel = (
    <div className={`today-panel-surface border-l border-[var(--border-subtle)] bg-[rgba(26,34,56,0.5)] ${
      mainExpanded ? 'hidden md:block md:w-[48px] md:min-w-[48px]' : ''
    } ${todayExpanded ? 'md:w-[90%]' : 'md:w-1/2'} ${
      mobileTab === 'today' ? 'flex flex-col flex-1' : 'hidden md:flex md:flex-col'
    }`}>
      <TodayPanel
        todos={todayTodos}
        tags={tags}
        onComplete={handleComplete}
        onUpdate={handleUpdate}
        onSetTags={handleSetTags}
        onRemoveFromToday={handleRemoveFromToday}
        onReorder={handleReorderToday}
        expanded={todayExpanded}
        onToggleExpand={toggleTodayExpand}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Mobile tab bar */}
      <div className="flex md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <button
          onClick={() => setMobileTab('all')}
          className={`flex-1 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
            mobileTab === 'all' ? 'text-[var(--text-primary)] border-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] border-transparent'
          }`}
        >
          All Todos
        </button>
        <button
          onClick={() => setMobileTab('today')}
          className={`flex-1 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
            mobileTab === 'today' ? 'text-[var(--text-primary)] border-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] border-transparent'
          }`}
        >
          For Today{todayTodos.length > 0 ? ` (${todayTodos.length})` : ''}
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {mobileTab === 'all' ? mainPanel : <div className="hidden md:flex flex-1 overflow-hidden">{mainPanel}</div>}
        {todayPanel}
      </div>

      {/* Tag modal */}
      {showTagModal && <TagModal onClose={() => setShowTagModal(false)} onCreate={handleCreateTag} />}
      {detailTodo && (
        <TodoDetailSheet
          todo={detailTodo}
          tags={tags}
          onUpdate={handleUpdate}
          onSetTags={handleSetTags}
          onSetToday={handleSetToday}
          onDelete={handleDelete}
          onClose={() => setDetailTodo(null)}
        />
      )}
    </div>
  )
}
