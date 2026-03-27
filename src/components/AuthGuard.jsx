import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthGuard({ children }) {
  const navigate = useNavigate()
  const { isAuthenticated, loading, initialized } = useAuth()

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      navigate('/signup')
    }
  }, [initialized, loading, isAuthenticated, navigate])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white/60">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null
  return children
}
