import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
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

      // OAuth (and any other) session: has this auth identity already
      // claimed an access code? access_code_id IS NULL is the entire
      // first-time-vs-returning signal — no separate "first time" flag.
      const { data: profile } = await supabase
        .from('users')
        .select('access_code_id')
        .eq('auth_id', session.user.id)
        .maybeSingle()

      if (profile?.access_code_id) {
        navigate('/vault/chat')
      } else {
        navigate('/complete-signup')
      }
    }
    handle()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <p className="text-white/60">Signing you in...</p>
    </div>
  )
}
