import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function signUp(email, password, accessCode) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, access_code: accessCode }),
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.message || 'Signup failed.')
  }
  return data
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Auth not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithMagicLink(email) {
  if (!supabase) throw new Error('Auth not configured')
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function resetPassword(email) {
  if (!supabase) throw new Error('Auth not configured')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  if (!supabase) throw new Error('Auth not configured')
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
