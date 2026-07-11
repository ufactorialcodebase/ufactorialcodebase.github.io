// src/components/vault/lists/ListsTab.jsx
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import ListIndex from './ListIndex'
import ListDetail from './ListDetail'
import CreateListForm from './CreateListForm'
import { getLists, createList, deleteList, addListItem, removeListItem, setChecklistMode, toggleCheckedValue, updateListItem } from '../../../lib/api/vault-lists'
import { useVaultData, setCached } from '../../../lib/vault-cache'

export default function ListsTab() {
  const { data: listData, loading, error, refetch } = useVaultData('lists', getLists, {
    transform: (result) => result.lists || [],
  })
  const [lists, setLists] = useState([])
  const [selectedListId, setSelectedListId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (listData) {
      setLists(listData)
      // Auto-select first list if none selected
      if (listData.length > 0 && !selectedListId) {
        setSelectedListId(listData[0].id)
      }
    }
  }, [listData])

  const selectedList = lists.find((l) => l.id === selectedListId) || null

  const handleCreateList = async (data) => {
    try {
      const newList = await createList(data)
      setLists((prev) => {
        const updated = [...prev, newList]
        setCached('lists', updated)
        return updated
      })
      setSelectedListId(newList.id)
      setShowCreateForm(false)
    } catch (err) {
      toast.error('Failed to create list: ' + err.message)
    }
  }

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId)
      setLists((prev) => {
        const updated = prev.filter((l) => l.id !== listId)
        setCached('lists', updated)
        // Select first remaining list or null
        if (selectedListId === listId) {
          setSelectedListId(updated.length > 0 ? updated[0].id : null)
        }
        return updated
      })
    } catch (err) {
      toast.error('Failed to delete list: ' + err.message)
    }
  }

  const handleAddItem = async (listName, value, notes) => {
    try {
      await addListItem(listName, value, notes)
      // Optimistically update local state
      setLists((prev) => {
        const updated = prev.map((l) => {
          if (l.name === listName) {
            return { ...l, items: [...(l.items || []), { value, notes: notes || null }] }
          }
          return l
        })
        setCached('lists', updated)
        return updated
      })
    } catch (err) {
      toast.error('Failed to add item: ' + err.message)
    }
  }

  const handleRemoveItem = async (listName, value) => {
    try {
      await removeListItem(listName, value)
      // Optimistically update local state
      setLists((prev) => {
        const updated = prev.map((l) => {
          if (l.name === listName) {
            return { ...l, items: (l.items || []).filter((item) => item.value !== value) }
          }
          return l
        })
        setCached('lists', updated)
        return updated
      })
    } catch (err) {
      toast.error('Failed to remove item: ' + err.message)
    }
  }

  // ISS-241 F1 — checklist mode. Optimistic flip so the UI feels instant;
  // roll back on failure. `checked_values` is preserved by the backend
  // when disabling, so we don't zero it out here.
  const handleToggleChecklistMode = async (listName, enabled) => {
    const previous = lists
    setLists((prev) => {
      const updated = prev.map((l) => l.name === listName ? { ...l, is_checklist: enabled } : l)
      setCached('lists', updated)
      return updated
    })
    try {
      await setChecklistMode(listName, enabled)
    } catch (err) {
      setLists(previous)
      setCached('lists', previous)
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} checklist mode: ${err.message}`)
    }
  }

  // F2 — rename an item in place, preserving array position. Optimistic
  // with rollback. Returns true / false so ListDetail can drop out of
  // edit mode only on success. 404 (missing list/item) and 409
  // (collision with another item) each surface a specific toast.
  const handleUpdateItem = async (listName, oldValue, newValue, notes) => {
    const previous = lists
    setLists((prev) => {
      const updated = prev.map((l) => {
        if (l.name !== listName) return l
        const items = (l.items || []).map((item) =>
          item.value === oldValue
            ? { ...item, value: newValue, notes: notes ?? item.notes }
            : item
        )
        const checked = l.checked_values || []
        const nextChecked = checked.includes(oldValue)
          ? checked.map((v) => (v === oldValue ? newValue : v))
          : checked
        return { ...l, items, checked_values: nextChecked }
      })
      setCached('lists', updated)
      return updated
    })
    try {
      await updateListItem(listName, oldValue, newValue, notes)
      return true
    } catch (err) {
      setLists(previous)
      setCached('lists', previous)
      const msg = err.message || String(err)
      if (msg.includes('409') || /already exists|collid/i.test(msg)) {
        toast.error(`"${newValue}" already exists in this list`)
      } else if (msg.includes('404') || /not.?found/i.test(msg)) {
        toast.error(`"${oldValue}" is no longer in the list`)
      } else {
        toast.error(`Failed to rename "${oldValue}": ${msg}`)
      }
      return false
    }
  }

  // Toggle an item's checked state. Optimistic; rolls back on failure.
  // Idempotent server-side, so a double-tap ends up at the intended state.
  const handleToggleCheckedValue = async (listName, value) => {
    const previous = lists
    setLists((prev) => {
      const updated = prev.map((l) => {
        if (l.name !== listName) return l
        const current = new Set(l.checked_values || [])
        if (current.has(value)) current.delete(value)
        else current.add(value)
        return { ...l, checked_values: Array.from(current) }
      })
      setCached('lists', updated)
      return updated
    })
    try {
      await toggleCheckedValue(listName, value)
    } catch (err) {
      setLists(previous)
      setCached('lists', previous)
      toast.error(`Failed to toggle "${value}": ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Lists" subtitle="Collections and preferences" />
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-[var(--bg-secondary)] rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Lists" subtitle="Collections and preferences" />
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (lists.length === 0 && !showCreateForm) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Lists" subtitle="Collections and preferences" />
        <EmptyState
          icon="📋"
          message="No lists yet. Tell HridAI about your preferences, or create a list here."
        />
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-sm font-medium hover:opacity-90"
          >
            + New List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 h-full">
      <PageHeader title="Your Lists" subtitle="Collections and preferences" />

      {showCreateForm && (
        <CreateListForm
          onSubmit={handleCreateList}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Left: list index (~1/3) */}
        <div className="w-full md:w-1/3 shrink-0">
          <ListIndex
            lists={lists}
            selectedId={selectedListId}
            onSelect={setSelectedListId}
            onShowCreate={() => setShowCreateForm(true)}
          />
        </div>

        {/* Right: list detail (~2/3) */}
        <div className="flex-1 min-w-0">
          {selectedList ? (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
              <ListDetail
                list={selectedList}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onUpdateItem={handleUpdateItem}
                onDeleteList={handleDeleteList}
                onToggleChecklistMode={handleToggleChecklistMode}
                onToggleCheckedValue={handleToggleCheckedValue}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-[var(--text-tertiary)] text-sm">
              Select a list to view its items.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
