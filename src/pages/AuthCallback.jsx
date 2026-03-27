import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handle = async () => {
      if (!supabase) { navigate('/login'); return }
      const { data: { session } } = await supabase.auth.getSession()
      navigate(session ? '/hridai' : '/signup')
    }
    handle()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <p className="text-white/60">Signing you in...</p>
    </div>
  )
}
