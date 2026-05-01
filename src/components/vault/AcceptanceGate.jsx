// src/components/vault/AcceptanceGate.jsx
//
// Blocks access to the vault until the user has accepted the current
// versions of ToS, Privacy Policy, and affirmed 18+ age.
// Queries acceptance_log on mount; shows a blocking modal if any are missing.
// Works for existing users who never went through the new signup flow,
// and for re-acceptance when policy versions change.

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const CURRENT_VERSION = '2026-04-29'
const REQUIRED_TYPES = ['tos', 'privacy', 'age_18_plus']

export default function AcceptanceGate() {
  const { userId } = useAuth()
  const [missingTypes, setMissingTypes] = useState(null) // null = loading, [] = all accepted
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!userId || !supabase) return

    async function checkAcceptance() {
      const { data, error } = await supabase
        .from('acceptance_log')
        .select('document_type')
        .eq('user_id', userId)
        .eq('version_identifier', CURRENT_VERSION)
        .in('document_type', REQUIRED_TYPES)

      if (error) {
        console.error('Acceptance check failed:', error)
        // On error, don't block — fail open so the user isn't locked out
        setMissingTypes([])
        return
      }

      const acceptedTypes = new Set((data || []).map(r => r.document_type))
      const missing = REQUIRED_TYPES.filter(t => !acceptedTypes.has(t))
      setMissingTypes(missing)
    }

    checkAcceptance()
  }, [userId])

  // Still loading, or all accepted, or no supabase/userId
  if (!userId || !supabase || missingTypes === null || missingTypes.length === 0) {
    return null
  }

  const canSubmit = ageConfirmed && termsAccepted && !submitting

  const handleAccept = async () => {
    setSubmitting(true)
    const rows = missingTypes.map(docType => ({
      user_id: userId,
      document_type: docType,
      version_identifier: CURRENT_VERSION,
      version_date: CURRENT_VERSION,
    }))

    const { error } = await supabase.from('acceptance_log').insert(rows)
    if (error) {
      console.error('Acceptance log failed:', error)
    }
    setMissingTypes([])
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-active)] p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
          Before you continue
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          We need you to review and accept our terms to continue using HridAI.
        </p>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              I am at least 18 years old
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              I agree to the{' '}
              <a href="https://ufactorial.com/terms" target="_blank" rel="noopener noreferrer"
                className="text-emerald-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="https://ufactorial.com/privacy" target="_blank" rel="noopener noreferrer"
                className="text-emerald-400 hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!canSubmit}
          className="mt-6 w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
