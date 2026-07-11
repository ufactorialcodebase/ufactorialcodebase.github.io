// src/components/vault/lists/ListDetail.jsx
import { useState, useMemo } from 'react'
import { X, Trash2, Plus, CheckSquare, Square, ListChecks } from 'lucide-react'
import { getCategoryStyle } from './list-utils'

export default function ListDetail({
  list,
  onAddItem,
  onRemoveItem,
  onDeleteList,
  onToggleChecklistMode,
  onToggleCheckedValue,
}) {
  const [newValue, setNewValue] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const items = list.items || []
  const style = getCategoryStyle(list.category)

  // ISS-241 F1 — checklist mode. When `is_checklist` is true, items whose
  // value is in `checked_values` render checked AND sink to the bottom of
  // the list. Unchecked items stay in their original order; checked items
  // also preserve their relative order (stable sort).
  const isChecklist = Boolean(list.is_checklist)
  const checkedSet = useMemo(() => new Set(list.checked_values || []), [list.checked_values])
  const checkedCount = useMemo(
    () => items.reduce((n, i) => (checkedSet.has(i.value) ? n + 1 : n), 0),
    [items, checkedSet]
  )
  const sortedItems = useMemo(() => {
    if (!isChecklist) return items
    const unchecked = []
    const checked = []
    for (const item of items) {
      if (checkedSet.has(item.value)) checked.push(item)
      else unchecked.push(item)
    }
    return [...unchecked, ...checked]
  }, [items, checkedSet, isChecklist])

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
    <div className="flex flex-col gap-4 h-full" data-testid="list-detail" data-is-checklist={isChecklist ? 'true' : 'false'}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[var(--text-primary)] text-lg font-semibold flex-1 min-w-0 truncate">
            {list.name}
          </h2>
          {/* Checklist mode toggle. Icon-only button so the header stays
              compact; title + aria-label describe the action for a11y and
              tooltips. Optimistic — the parent handler rolls back on error. */}
          {onToggleChecklistMode && (
            <button
              onClick={() => onToggleChecklistMode(list.name, !isChecklist)}
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] uppercase tracking-wide font-medium transition-colors ${
                isChecklist
                  ? 'bg-[var(--accent-indigo)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              data-testid="checklist-mode-toggle"
              data-enabled={isChecklist ? 'true' : 'false'}
              title={isChecklist ? 'Turn checklist mode off' : 'Turn checklist mode on'}
              aria-pressed={isChecklist}
            >
              <ListChecks size={12} />
              {isChecklist ? 'Checklist' : 'Checklist'}
            </button>
          )}
          <span
            className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium shrink-0"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            {list.category || 'general'}
          </span>
        </div>
        <div className="text-[var(--text-tertiary)] text-xs" data-testid="list-item-count">
          {items.length} {items.length === 1 ? 'item' : 'items'}
          {isChecklist && items.length > 0 && (
            <span data-testid="list-checked-count"> — {checkedCount} checked</span>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-1 flex-1">
        {items.length === 0 && !showAddForm && (
          <p className="text-[var(--text-tertiary)] text-sm text-center py-6">
            No items yet. Add one below.
          </p>
        )}
        {sortedItems.map((item) => {
          const isChecked = isChecklist && checkedSet.has(item.value)
          return (
            <div
              key={item.value}
              data-testid="list-item"
              data-item-value={item.value}
              data-checked={isChecked ? 'true' : 'false'}
              className={`flex items-start gap-2 bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 group transition-opacity ${
                isChecked ? 'opacity-60' : ''
              }`}
            >
              {isChecklist && (
                <button
                  onClick={() => onToggleCheckedValue?.(list.name, item.value)}
                  data-testid="list-item-checkbox"
                  aria-pressed={isChecked}
                  aria-label={isChecked ? `Uncheck "${item.value}"` : `Check "${item.value}"`}
                  className={`shrink-0 mt-0.5 transition-colors ${
                    isChecked ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[var(--text-primary)] text-sm ${
                    isChecked ? 'line-through' : ''
                  }`}
                >
                  {item.value}
                </div>
                {item.notes && (
                  <div className="text-[var(--text-tertiary)] text-xs mt-0.5">{item.notes}</div>
                )}
              </div>
              <button
                onClick={() => onRemoveItem(list.name, item.value)}
                className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                aria-label={`Remove "${item.value}"`}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
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
