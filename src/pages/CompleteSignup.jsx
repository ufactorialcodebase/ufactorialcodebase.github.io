import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CompleteSignup() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) { navigate('/signup'); return }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/signup'); return }
      setSession(data.session)
    })
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: rpcError } = await supabase.rpc('complete_signup', {
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
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
