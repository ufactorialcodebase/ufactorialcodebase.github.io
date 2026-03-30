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
