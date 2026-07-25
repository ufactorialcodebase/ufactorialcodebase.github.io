// src/lib/acceptance.js
//
// Shared acceptance logging for both signup paths (email/password on
// /signup, Google OAuth completion in AuthCallback). Must be called with
// an authenticated Supabase session whose auth_id is already linked to
// users.user_id — the acceptance_log INSERT policy checks that link.

import { supabase } from './supabase'

export const ACCEPTANCE_VERSION = '2026-04-29'

export async function logAcceptance(userId) {
  if (!supabase) return
  const rows = ['tos', 'privacy', 'age_18_plus'].map((docType) => ({
    user_id: userId,
    document_type: docType,
    version_identifier: ACCEPTANCE_VERSION,
    version_date: ACCEPTANCE_VERSION,
  }))
  const { error } = await supabase.from('acceptance_log').insert(rows)
  if (error) console.error('Acceptance log failed:', error)
}
