// src/lib/relationship-format.js
//
// Relationship labels are stored in the AI's snake_case vocabulary
// ("extended_family", "works_at") because several backend consumers match
// them EXACTLY (inner-circle list, exclusive-edge superseding, profile
// card derivation). The UI shows them humanized and converts back to the
// canonical form on save, so users can freely edit without forking the
// vocabulary — the backend normalizes too (belt at the boundary).

/** "extended_family" → "extended family" (display form). */
export function humanizeRelationship(value) {
  if (!value) return value
  return String(value).replace(/_/g, ' ')
}

/** "Extended Family" / "extended family" → "extended_family" (storage form). */
export function normalizeRelationship(value) {
  if (!value) return value
  return String(value).trim().replace(/\s+/g, '_').toLowerCase()
}
