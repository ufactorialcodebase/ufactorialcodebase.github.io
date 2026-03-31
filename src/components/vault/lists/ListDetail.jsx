// src/components/vault/lists/ListDetail.jsx
import { useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'

const CATEGORY_STYLES = {
  general: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  food: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  travel: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  entertainment: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  fitness: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  shopping: { bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  other: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
}

function getCategoryStyle(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.general
}

export default function ListDetail({ list, onAddItem, onRemoveItem, onDeleteList }) {
  const [newValue, setNewValue] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const items = list.items || []
  const style = getCategoryStyle(list.category)

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!newValue.trim()) return
    setAddingItem(true)
    try {
      await onAddItem(list.name, newValue.trim(), newNotes.trim() || null)
      setNewValue('')
      setNewNotes('')
      setShowAddForm(false)
    } finally {
      setAddingItem(false)
    }
  }

  const handleDeleteList = () => {
    if (!confirm(`Delete "${list.name}"? This will remove the list and all its items.`)) return
    onDeleteList(list.id)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[var(--text-primary)] text-lg font-semibold flex-1 min-w-0 truncate">
            {list.name}
          </h2>
          <span
            className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium shrink-0"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            {list.category || 'general'}
          </span>
        </div>
        <div className="text-[var(--text-tertiary)] text-xs">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-1 flex-1">
        {items.length === 0 && !showAddForm && (
          <p className="text-[var(--text-tertiary)] text-sm text-center py-6">
            No items yet. Add one below.
          </p>
        )}
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 group"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[var(--text-primary)] text-sm">{item.value}</div>
              {item.notes && (
                <div className="text-[var(--text-tertiary)] text-xs mt-0.5">{item.notes}</div>
              )}
            </div>
            <button
              onClick={() => onRemoveItem(list.name, item.value)}
              className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add item form */}
      {showAddForm ? (
        <form onSubmit={handleAddItem} className="border-t border-[var(--border-subtle)] pt-3">
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Item value"
              className="bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent-indigo)]"
            />
            <input
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[var(--accent-indigo)]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newValue.trim() || addingItem}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewValue(''); setNewNotes('') }}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs hover:border-[var(--border-active)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-[var(--accent-indigo)] text-sm hover:opacity-80 transition-opacity border-t border-[var(--border-subtle)] pt-3"
        >
          <Plus size={14} />
          Add item
        </button>
      )}

      {/* Delete list */}
      <div className="border-t border-[var(--border-subtle)] pt-3 mt-2">
        <button
          onClick={handleDeleteList}
          className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          <Trash2 size={14} />
          Delete list
        </button>
      </div>
    </div>
  )
}
