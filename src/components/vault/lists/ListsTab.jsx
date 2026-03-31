// src/components/vault/lists/ListsTab.jsx
import { useState, useEffect } from 'react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import ListIndex from './ListIndex'
import ListDetail from './ListDetail'
import CreateListForm from './CreateListForm'
import { getLists, createList, deleteList, addListItem, removeListItem } from '../../../lib/api/vault-lists'
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
      alert('Failed to create list: ' + err.message)
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
      alert('Failed to delete list: ' + err.message)
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
      alert('Failed to add item: ' + err.message)
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
      alert('Failed to remove item: ' + err.message)
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
                onDeleteList={handleDeleteList}
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
