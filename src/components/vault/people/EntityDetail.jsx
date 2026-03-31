// src/components/vault/people/EntityDetail.jsx
import { useState } from 'react'
import InlineEdit from '../InlineEdit'
import { getTypeColor, getTypeLabel } from './entity-utils'

export default function EntityDetail({ entity, onUpdate, onDelete, onMerge, allEntities = [] }) {
  const [addingAlias, setAddingAlias] = useState(false)
  const [newAlias, setNewAlias] = useState('')
  const [merging, setMerging] = useState(false)
  const [mergeTargetId, setMergeTargetId] = useState('')
  const color = getTypeColor(entity.type)
  const initial = (entity.name || '?').charAt(0).toUpperCase()
  const relationship = entity.relationship_to_self || entity.relationship
  const attributes = entity.attributes || {}
  const aliases = entity.aliases || []
  const topics = entity.connected_topics || []

  const attrEntries = Object.entries(attributes)
    .filter(([k]) => !['id', 'entity_id', 'type', 'user_id', 'name'].includes(k))

  const handleAddAlias = () => {
    const trimmed = newAlias.trim()
    if (!trimmed) return
    const updatedAliases = [...aliases, trimmed]
    onUpdate?.({ ...entity, aliases: updatedAliases })
    setNewAlias('')
    setAddingAlias(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
          style={{ backgroundColor: `${color}22`, color }}>
          {initial}
        </div>
        <div>
          <div className="text-[var(--text-primary)] text-lg font-semibold">{entity.name}</div>
          <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium"
            style={{ backgroundColor: `${color}22`, color }}>
            {getTypeLabel(entity.type)}
          </span>
        </div>
      </div>

      {/* Relationship */}
      {relationship && (
        <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg mb-4">
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">Relationship</div>
          <div className="text-[var(--text-primary)] text-sm mt-0.5">{relationship}</div>
        </div>
      )}

      {/* Attributes */}
      {attrEntries.length > 0 && (
        <div className="mb-4">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">Attributes</div>
          <div className="space-y-1.5">
            {attrEntries.map(([key, value]) => (
              <div key={key} className="p-2 bg-[var(--bg-primary)] rounded-lg flex justify-between">
                <span className="text-[var(--text-tertiary)] text-xs capitalize">{key.replace(/_/g, ' ')}</span>
                <InlineEdit
                  value={String(value)}
                  onSave={(newVal) => {
                    const updatedAttrs = { ...attributes, [key]: newVal }
                    onUpdate?.({ ...entity, attributes: updatedAttrs })
                  }}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aliases */}
      <div className="mb-4">
        <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">Also known as</div>
        <div className="flex flex-wrap gap-1.5">
          {aliases.map((alias, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {alias}
            </span>
          ))}
          {addingAlias ? (
            <input
              autoFocus
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddAlias()
                if (e.key === 'Escape') { setAddingAlias(false); setNewAlias('') }
              }}
              onBlur={handleAddAlias}
              className="px-2.5 py-1 rounded-full text-xs bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent-indigo)] outline-none w-24"
              placeholder="Alias..."
            />
          ) : (
            <button
              onClick={() => setAddingAlias(true)}
              className="px-2.5 py-1 rounded-full text-xs border border-dashed border-[var(--border-active)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Connected Topics */}
      {topics.length > 0 && (
        <div className="mb-5">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">Connected Topics</div>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-[rgba(99,102,241,0.1)] text-[var(--accent-indigo)]">
                {topic.name || topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Merge UI */}
      {merging && (
        <div className="mb-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wide mb-2">
            Merge "{entity.name}" into another entity
          </div>
          <p className="text-[var(--text-tertiary)] text-[10px] mb-2">
            All relationships, mentions, and references will move to the selected entity. "{entity.name}" will be added as an alias and then removed.
          </p>
          <select
            value={mergeTargetId}
            onChange={(e) => setMergeTargetId(e.target.value)}
            className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-xs outline-none mb-2"
          >
            <option value="">Select entity to keep...</option>
            {allEntities
              .filter((e) => (e.id || e.entity_id) !== (entity.id || entity.entity_id))
              .map((e) => (
                <option key={e.id || e.entity_id} value={e.id || e.entity_id}>
                  {e.name} ({getTypeLabel(e.type)})
                </option>
              ))}
          </select>
          <div className="flex gap-2">
            <button
              disabled={!mergeTargetId}
              onClick={() => {
                const target = allEntities.find((e) => (e.id || e.entity_id) === mergeTargetId)
                if (confirm(`Merge "${entity.name}" into "${target?.name}"? This cannot be undone.`)) {
                  onMerge?.(mergeTargetId, entity.id || entity.entity_id)
                  setMerging(false)
                  setMergeTargetId('')
                }
              }}
              className="px-3 py-1 rounded-lg text-xs bg-[var(--accent-indigo)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Merge
            </button>
            <button
              onClick={() => { setMerging(false); setMergeTargetId('') }}
              className="px-3 py-1 rounded-lg text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex gap-2">
        {!merging && (
          <button
            onClick={() => setMerging(true)}
            className="px-4 py-2 rounded-lg text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Merge with...
          </button>
        )}
        <button
          onClick={() => onDelete(entity)}
          className="px-4 py-2 rounded-lg text-xs bg-[rgba(248,113,113,0.1)] text-red-400 hover:bg-[rgba(248,113,113,0.2)] transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
