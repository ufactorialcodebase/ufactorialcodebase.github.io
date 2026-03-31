// src/components/vault/people/entity-utils.js

export const TYPE_COLORS = {
  person: 'var(--entity-person)',
  organization: 'var(--entity-org)',
  location: 'var(--entity-place)',
}

export function getTypeColor(type) {
  return TYPE_COLORS[type] || 'var(--entity-other)'
}

export function getTypeLabel(type) {
  if (type === 'organization') return 'Org'
  if (type === 'location') return 'Place'
  if (type === 'person') return 'Person'
  return type || 'Other'
}

/**
 * Normalize entity from backend shape (canonical_name, entity_type)
 * to frontend shape (name, type) for consistent component usage.
 */
export function normalizeEntity(raw) {
  return {
    ...raw,
    name: raw.name || raw.canonical_name || 'Unknown',
    type: raw.type || raw.entity_type || 'other',
  }
}
