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
      } else {
        navigate('/hridai')
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
