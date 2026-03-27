import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { resetPassword, updatePassword, signOut } from '../lib/auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, session, userId, clear } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    fetch(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).then(r => r.json()).then(data => { if (data.display_name) setDisplayName(data.display_name) }).catch(() => {})
  }, [session, navigate])

  const handleUpdateName = async () => {
    if (!session || !displayName.trim()) return
    setLoading(true); setError(null)
    try {
      await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
      })
      setMessage('Display name updated.')
    } catch { setError('Failed to update.') } finally { setLoading(false) }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setLoading(true); setError(null)
    try { await resetPassword(user.email); setMessage('Reset email sent.') }
    catch { setError('Failed to send reset email.') } finally { setLoading(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { setError('Min 8 characters.'); return }
    setLoading(true); setError(null)
    try { await updatePassword(newPassword); setNewPassword(''); setMessage('Password updated.') }
    catch { setError('Failed to change password.') } finally { setLoading(false) }
  }

  const handleLogout = async () => { await signOut(); clear(); navigate('/login') }

  if (!session) return null

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <div>
          <label className="block text-sm text-white/60 mb-1">Email</label>
          <p className="px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10">{user?.email}</p>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Display Name</label>
          <div className="flex gap-2">
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="Your name" />
            <button onClick={handleUpdateName} disabled={loading}
              className="px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">Save</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Change Password</label>
          <div className="flex gap-2">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="New password (8+ chars)" minLength={8} />
            <button onClick={handleChangePassword} disabled={loading || newPassword.length < 8}
              className="px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 hover:border-white/20 disabled:opacity-50">Update</button>
          </div>
          <button onClick={handlePasswordReset} className="mt-2 text-sm text-white/40 hover:text-white/60 underline">Send reset email instead</button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-emerald-400 text-sm">{message}</p>}
        <div>
          <label className="block text-sm text-white/60 mb-1">User ID</label>
          <p className="px-4 py-3 rounded-lg bg-white/5 text-white/30 text-sm font-mono border border-white/10">{userId}</p>
        </div>
        <button onClick={handleLogout} className="w-full py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">Sign out</button>
      </div>
    </div>
  )
}
