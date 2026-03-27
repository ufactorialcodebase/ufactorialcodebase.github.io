import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { getSession } from '../lib/auth'
import { getAccessCode } from '../lib/api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const isAuthenticated = !!session || !!getAccessCode()

  const getAuthHeader = useCallback(() => {
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` }
    }
    const code = getAccessCode()
    if (code) {
      return { 'X-Access-Code': code }
    }
    return {}
  }, [session])

  const fetchUserId = useCallback(async (accessToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserId(data.user_id)
      }
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          await fetchUserId(session.access_token)
        }
      } catch {
        // No session
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    init()

    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.access_token) {
          await fetchUserId(session.access_token)
        } else {
          setUserId(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchUserId])

  const clear = useCallback(() => {
    setUser(null)
    setSession(null)
    setUserId(null)
  }, [])

  const value = {
    user, session, userId, loading, initialized,
    isAuthenticated, getAuthHeader, clear,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
