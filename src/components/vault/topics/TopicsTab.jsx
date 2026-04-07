// src/components/vault/topics/TopicsTab.jsx
import { useState, useEffect, useMemo } from 'react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import TopicFilters from './TopicFilters'
import TopicRow from './TopicRow'
import { getTopics, updateTopic, deleteTopic } from '../../../lib/api/vault-topics'
import { getEntities } from '../../../lib/api/vault-entities'
import { useVaultData, setCached, getCached } from '../../../lib/vault-cache'
import { normalizeEntity } from '../people/entity-utils'

export default function TopicsTab() {
  const { data: topicData, loading, error, refetch } = useVaultData('topics', getTopics, {
    transform: (result) => result.topics || []
  })
  const { data: entityData } = useVaultData('entities', getEntities, {
    transform: (result) => (result.entities || result || []).map(normalizeEntity)
  })
  const [topics, setTopics] = useState([])
  const [statusFilter, setStatusFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)

  useEffect(() => { if (topicData) setTopics(topicData) }, [topicData])

  // Build entity name lookup: id → name
  const entityLookup = useMemo(() => {
    const map = {}
    for (const e of (entityData || [])) {
      map[e.id] = e.name
      if (e.entity_id) map[e.entity_id] = e.name
    }
    return map
  }, [entityData])

  const filtered = useMemo(() => {
    let result = topics
    if (statusFilter) {
      result = result.filter((t) => (t.current_status || 'active').toLowerCase() === statusFilter)
    }
    if (categoryFilter) {
      result = result.filter((t) => (t.category || '').toLowerCase() === categoryFilter)
    }
    return result
  }, [topics, statusFilter, categoryFilter])

  const handleUpdate = async (updatedTopic) => {
    try {
      await updateTopic(updatedTopic.id, {
        name: updatedTopic.name,
        current_status: updatedTopic.current_status,
      })
      setTopics((prev) => {
        const updated = prev.map((t) => t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t)
        setCached('topics', updated)
        return updated
      })
    } catch (err) {
      alert('Failed to update: ' + err.message)
    }
  }

  const handleDelete = async (topic) => {
    try {
      await deleteTopic(topic.id)
      setTopics((prev) => {
        const updated = prev.filter((t) => t.id !== topic.id)
        setCached('topics', updated)
        return updated
      })
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Topics" subtitle="Themes and threads in your life" />
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-[var(--bg-secondary)] rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Topics" subtitle="Themes and threads in your life" />
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => refetch()}
            className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline">Retry</button>
        </div>
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Topics" subtitle="Themes and threads in your life" />
        <EmptyState icon="💡"
          message="No topics tracked yet. After a few conversations, HridAI will identify the themes in your life and track them here."
          ctaLabel="Go to Chat" ctaPath="/vault/chat" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <PageHeader title="Your Topics" subtitle="Themes and threads in your life" />
      <TopicFilters
        statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter} onCategoryFilterChange={setCategoryFilter}
      />
      {filtered.map((topic) => (
        <TopicRow key={topic.id} topic={topic} onUpdate={handleUpdate} onDelete={handleDelete} entityLookup={entityLookup} />
      ))}
      {filtered.length === 0 && (
        <p className="text-[var(--text-tertiary)] text-sm text-center py-8">No topics match this filter.</p>
      )}
    </div>
  )
}
