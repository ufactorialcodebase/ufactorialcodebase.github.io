import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logAcceptance } from '../lib/acceptance'
import { readSignupIntent, clearSignupIntent } from '../lib/signup-intent'
import { setFeatureFlag } from '../hooks/useFeatureFlag'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Signing you in...')
  // complete_signup consumes an access-code use — the effect must run exactly
  // once even under StrictMode's double-invocation in dev.
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    // Dead-end recovery: sign the half-authenticated identity out (it has no
    // linked account) and send the user back to /signup with the reason.
    const failToSignup = async (message) => {
      clearSignupIntent()
      await supabase.auth.signOut()
      navigate(`/signup?oauth_error=${encodeURIComponent(message)}`)
    }

    const handle = async () => {
      if (!supabase) { navigate('/signup'); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/signup'); return }

      // Password recovery flow → send to profile to set new password
      // Supabase puts recovery params in hash fragment, not query string
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const queryParams = new URLSearchParams(window.location.search)
      if (hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery') {
        navigate('/profile')
        return
      }

      // Has this auth identity already claimed an access code?
      // access_code_id IS NULL is the entire first-time-vs-returning signal.
      const { data: profile } = await supabase
        .from('users')
        .select('access_code_id')
        .eq('auth_id', session.user.id)
        .maybeSingle()

      if (profile?.access_code_id) {
        clearSignupIntent()
        navigate('/vault/chat')
        return
      }

      // First-time identity: finish signup with the access code + consent the
      // user provided on /signup BEFORE the OAuth redirect (the Google button
      // is locked until both are in). No stash means they authenticated
      // without going through that gate — e.g. a new user clicking Google on
      // the Sign in tab — so route them back to do it properly.
      const intent = readSignupIntent()
      if (!intent) {
        await failToSignup('New here? Enter your access code and accept the terms on the sign-up page first.')
        return
      }

      setStatus('Setting up your account...')
      const { data: userId, error: rpcError } = await supabase.rpc('complete_signup', {
        p_auth_id: session.user.id,
        p_email: session.user.email,
        p_access_code: intent.code,
        p_display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
      })
      if (rpcError || !userId) {
        // The RPC's HINT is already a clean, user-facing sentence for every
        // ACCESS_CODE_* case (mig 055).
        await failToSignup(rpcError?.hint || rpcError?.message || 'Signup could not be completed. Please try again.')
        return
      }

      // Consent was affirmatively given on /signup (checkboxes gating the
      // Google button) — record it now that the account row exists.
      await logAcceptance(userId)
      clearSignupIntent()
      // New accounts start on the redesigned vault (same seed as the
      // email/password path in Signup.jsx).
      setFeatureFlag('vault_redesign', true)
      // Full navigation, not client-side routing: auth state re-initializes
      // so /api/auth/me resolves the now-linked user_id on first vault load.
      window.location.href = '/vault/chat'
    }
    handle()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <p className="text-white/60">{status}</p>
    </div>
  )
}
