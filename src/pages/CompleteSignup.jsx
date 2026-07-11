import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Mirrors Signup.jsx's logAcceptance — kept local rather than extracted to
// a shared module to keep this fix minimal (two small, independent call
// sites, same 3-row shape).
const ACCEPTANCE_VERSION = '2026-04-29'

async function logAcceptance(userId) {
  if (!supabase) return
  const rows = [
    { user_id: userId, document_type: 'tos', version_identifier: ACCEPTANCE_VERSION, version_date: ACCEPTANCE_VERSION },
    { user_id: userId, document_type: 'privacy', version_identifier: ACCEPTANCE_VERSION, version_date: ACCEPTANCE_VERSION },
    { user_id: userId, document_type: 'age_18_plus', version_identifier: ACCEPTANCE_VERSION, version_date: ACCEPTANCE_VERSION },
  ]
  const { error } = await supabase.from('acceptance_log').insert(rows)
  if (error) console.error('Acceptance log failed:', error)
}

export default function CompleteSignup() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [code, setCode] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) { navigate('/signup'); return }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/signup'); return }
      setSession(data.session)
    })
  }, [navigate])

  const canSubmit = ageConfirmed && termsAccepted && code.trim() && !loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ageConfirmed || !termsAccepted) return
    setError(null)
    setLoading(true)
    const { data: userId, error: rpcError } = await supabase.rpc('complete_signup', {
      p_auth_id: session.user.id,
      p_email: session.user.email,
      p_access_code: code.trim().toUpperCase(),
      p_display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
    })
    if (rpcError) {
      // The RPC's HINT is already a clean, user-facing sentence for every
      // ACCESS_CODE_* case (mig 055) — no separate message table to invent.
      setError(rpcError.hint || rpcError.message || 'Signup failed.')
      setLoading(false)
      return
    }
    if (userId) {
      await logAcceptance(userId)
    }
    navigate('/vault/chat')
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">One more step</h1>
          <p className="text-white/60 mt-2">
            Signed in as {session.user.email}. Enter your access code to finish setting up your account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="oauth-access-code" className="block text-sm text-white/60 mb-1">Access Code</label>
            <input
              id="oauth-access-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 font-mono tracking-wider text-center placeholder:font-sans placeholder:tracking-normal focus:border-emerald-500 focus:outline-none"
              placeholder="DEMO-XXXX-XXXX"
            />
          </div>

          {/* Acceptance checkboxes — same wording/links as the Create Account form */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer" />
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                I am at least 18 years old
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer" />
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                I agree to the{' '}
                <a href="https://ufactorial.com/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="https://ufactorial.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
