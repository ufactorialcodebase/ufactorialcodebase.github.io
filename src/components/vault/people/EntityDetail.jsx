// src/components/vault/people/EntityDetail.jsx
import { useState } from 'react'
import InlineEdit from '../InlineEdit'

const TYPE_COLORS = {
  person: 'var(--entity-person)',
  organization: 'var(--entity-org)',
  location: 'var(--entity-place)',
}

function getTypeColor(type) {
  return TYPE_COLORS[type] || 'var(--entity-other)'
}

function getTypeLabel(type) {
  if (type === 'organization') return 'Org'
  if (type === 'location') return 'Place'
  if (type === 'person') return 'Person'
  return type || 'Other'
}

export default function EntityDetail({ entity, onUpdate, onDelete }) {
  const [addingAlias, setAddingAlias] = useState(false)
  const [newAlias, setNewAlias] = useState('')
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

      {/* Actions */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex gap-2">
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
