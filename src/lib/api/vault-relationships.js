// src/lib/api/vault-relationships.js
import { apiFetch } from '../api-client.js'

/**
 * Update an entity-to-entity relationship's label (kg_relationships row).
 * Backend: PUT /vault/relationships/{id} — 404 if the id doesn't belong
 * to the authenticated user.
 */
export async function updateRelationship(relationshipId, relationshipType) {
  return apiFetch(`/vault/relationships/${relationshipId}`, {
    method: 'PUT',
    body: { relationship_type: relationshipType },
  })
}
