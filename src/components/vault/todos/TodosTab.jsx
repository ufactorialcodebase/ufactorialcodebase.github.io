// src/components/vault/todos/TodosTab.jsx
import { useState, useEffect, useMemo } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import TodoItem from './TodoItem'
import CreateTodoForm from './CreateTodoForm'
import { getTodos, createTodo, updateTodo, completeTodo, deleteTodo } from '../../../lib/api/vault-todos'

export default function TodosTab() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchTodos() {
      try {
        const result = await getTodos({ include_completed: true })
        if (!cancelled) {
          setTodos(result.todos || [])
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false) }
      }
    }
    fetchTodos()
    return () => { cancelled = true }
  }, [retryCount])

  const pending = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return todos
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 1
        const pb = priorityOrder[b.priority] ?? 1
        if (pa !== pb) return pa - pb
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
        if (a.due_date) return -1
        if (b.due_date) return 1
        return 0
      })
  }, [todos])

  const completed = useMemo(() => {
    return todos
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))
  }, [todos])

  const handleCreate = async (data) => {
    try {
      const newTodo = await createTodo(data)
      setTodos((prev) => [...prev, newTodo])
      setShowCreateForm(false)
    } catch (err) {
      alert('Failed to create: ' + err.message)
    }
  }

  const handleComplete = async (todo) => {
    try {
      const updated = await completeTodo(todo.id)
      setTodos((prev) => prev.map((t) => t.id === todo.id ? updated : t))
    } catch (err) {
      alert('Failed to complete: ' + err.message)
    }
  }

  const handleUpdate = async (updatedTodo) => {
    try {
      const result = await updateTodo(updatedTodo.id, {
        title: updatedTodo.title,
        priority: updatedTodo.priority,
        due_date: updatedTodo.due_date,
      })
      setTodos((prev) => prev.map((t) => t.id === updatedTodo.id ? result : t))
    } catch (err) {
      alert('Failed to update: ' + err.message)
    }
  }

  const handleDelete = async (todo) => {
    try {
      await deleteTodo(todo.id)
      setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

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
          <button onClick={() => { setLoading(true); setError(null); setRetryCount(c => c + 1) }}
            className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline">Retry</button>
        </div>
      </div>
    )
  }

  if (todos.length === 0 && !showCreateForm) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Todos" subtitle="Tasks and action items" />
        <EmptyState icon="✅"
          message="No tasks yet. Mention something you need to do in conversation, or add one here."
          ctaLabel="Add a Todo" ctaPath="" />
        <div className="flex justify-center mt-2">
          <button onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-sm font-medium hover:opacity-90">
            + Add Todo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Your Todos" subtitle="Tasks and action items" />
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium hover:opacity-90 flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {showCreateForm && (
        <CreateTodoForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-4">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">
            Pending ({pending.length})
          </div>
          {pending.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onComplete={handleComplete} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
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
            <TodoItem key={todo.id} todo={todo} onComplete={handleComplete} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
