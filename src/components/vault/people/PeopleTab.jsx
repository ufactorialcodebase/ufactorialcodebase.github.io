// src/components/vault/people/PeopleTab.jsx
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import SidePanel from '../SidePanel'
import FilterBar from './FilterBar'
import EntityCard from './EntityCard'
import EntityDetail from './EntityDetail'
import SortToggle from '../SortToggle'
import { getEntities, deleteEntity, updateEntity, mergeEntities } from '../../../lib/api/vault-entities'
import { normalizeEntity } from './entity-utils'
import { useVaultData, setCached } from '../../../lib/vault-cache'

// ISS-230 shipped 2026-07-07: `/vault/entities` hydrates `mention_count`
// and `last_mentioned` per row. People tab mirrors the Topics-tab sort:
// Frequency (default) or Recency.
const ENTITY_SORT_OPTIONS = [
  { value: 'frequency', label: 'Frequency' },
  { value: 'recency', label: 'Recency' },
]

export default function PeopleTab() {
  const { data: entityData, loading, error, refetch } = useVaultData('entities', getEntities, {
    transform: (result) => (result.entities || result || []).map(normalizeEntity)
  })
  const [entities, setEntities] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('person')
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [sort, setSort] = useState('frequency')

  useEffect(() => { if (entityData) setEntities(entityData) }, [entityData])

  const filtered = useMemo(() => {
    let list = Array.isArray(entities) ? entities : []
    if (typeFilter) {
      list = list.filter((e) => e.type === typeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((e) => {
        const name = (e.name || '').toLowerCase()
        const aliases = (e.aliases || []).join(' ').toLowerCase()
        const attrs = JSON.stringify(e.attributes || {}).toLowerCase()
        return name.includes(q) || aliases.includes(q) || attrs.includes(q)
      })
    }
    const sorted = [...list]
    if (sort === 'frequency') {
      // mention_count desc (ISS-230). Nulls sort last.
      sorted.sort((a, b) => (b.mention_count || 0) - (a.mention_count || 0))
    } else {
      // Recency = last_mentioned desc, falling back to updated_at for
      // entities with no mentions yet.
      sorted.sort((a, b) => {
        const ta = new Date(a.last_mentioned || a.updated_at || 0).getTime()
        const tb = new Date(b.last_mentioned || b.updated_at || 0).getTime()
        return tb - ta
      })
    }
    return sorted
  }, [entities, typeFilter, search, sort])

  const handleDelete = async (entity) => {
    if (!confirm(`Delete ${entity.name}? This will remove them and all their relationships.`)) return
    try {
      await deleteEntity(entity.id || entity.entity_id)
      setEntities((prev) => {
        const updated = prev.filter((e) => (e.id || e.entity_id) !== (entity.id || entity.entity_id))
        setCached('entities', updated)
        return updated
      })
      setSelectedEntity(null)
    } catch (err) {
      toast.error('Failed to delete: ' + err.message)
    }
  }

  const handleMerge = async (keepId, removeId) => {
    try {
      const result = await mergeEntities(keepId, removeId)
      if (result.success) {
        // Remove the merged-away entity, update the kept entity
        setEntities((prev) => {
          const updated = prev.filter((e) => (e.id || e.entity_id) !== removeId)
            .map((e) =>
              (e.id || e.entity_id) === keepId ? normalizeEntity(result.merged_entity) : e
            )
          setCached('entities', updated)
          return updated
        })
        setSelectedEntity(null)
      }
    } catch (err) {
      toast.error('Failed to merge: ' + err.message)
    }
  }

  const handleUpdateEntity = async (updatedEntity) => {
    try {
      await updateEntity(updatedEntity.id || updatedEntity.entity_id, updatedEntity)
      setEntities((prev) => {
        const updated = prev.map((e) =>
          (e.id || e.entity_id) === (updatedEntity.id || updatedEntity.entity_id) ? updatedEntity : e
        )
        setCached('entities', updated)
        return updated
      })
      setSelectedEntity(updatedEntity)
    } catch (err) {
      toast.error('Failed to update: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Network" subtitle="People, places, and organizations in your life" />
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Network" subtitle="People, places, and organizations in your life" />
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

  if (entities.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Network" subtitle="People, places, and organizations in your life" />
        <EmptyState
          icon="👥"
          message="No people or places stored yet. As you mention people in conversation, HridAI will remember them here."
          ctaLabel="Go to Chat"
          ctaPath="/vault/chat"
        />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader title="Your Network" subtitle="People, places, and organizations in your life" />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <div className="mb-4 -mt-1">
        <SortToggle value={sort} onChange={setSort} options={ENTITY_SORT_OPTIONS} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((entity) => (
          <EntityCard
            key={entity.id || entity.entity_id}
            entity={entity}
            onClick={setSelectedEntity}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-[var(--text-tertiary)] text-sm text-center py-8">No results match your filters.</p>
      )}

      <SidePanel
        open={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title={selectedEntity?.name || 'Entity'}
      >
        {selectedEntity && (
          <EntityDetail
            entity={selectedEntity}
            onUpdate={handleUpdateEntity}
            onDelete={handleDelete}
            onMerge={handleMerge}
            allEntities={entities}
          />
        )}
      </SidePanel>
    </div>
  )
}
