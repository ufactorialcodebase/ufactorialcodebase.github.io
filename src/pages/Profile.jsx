// src/pages/Profile.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { resetPassword, updatePassword, signOut } from '../lib/auth'
import { createCheckoutSession } from '../lib/api/index.js'
import SettingsHome from '../components/vault/settings/SettingsHome'
import ProfileEdit from '../components/vault/settings/ProfileEdit'
import ManageSubscription from '../components/vault/settings/ManageSubscription'
import PrivacySettings from '../components/vault/settings/PrivacySettings'
import FeatureFlagsSection from '../components/vault/settings/FeatureFlagsSection'

export default function Profile() {
  const navigate = useNavigate()
  const { user, session, userId, clear, plan } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()

  const [view, setView] = useState('home') // 'home' | 'edit' | 'subscription' | 'privacy' | 'features'
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) navigate('/login')
  }, [session, navigate])

  const flash = useCallback((msg, isError = false) => {
    if (isError) { setError(msg); setMessage(null) } else { setMessage(msg); setError(null) }
    setTimeout(() => { setMessage(null); setError(null) }, 4000)
  }, [])

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setLoading(true)
    try { await resetPassword(user.email); flash('Reset email sent.') }
    catch { flash('Failed to send reset email.', true) } finally { setLoading(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { flash('Min 8 characters.', true); return }
    setLoading(true)
    try { await updatePassword(newPassword); setNewPassword(''); flash('Password updated.') }
    catch { flash('Failed to change password.', true) } finally { setLoading(false) }
  }

  const handleCopyUserId = async () => {
    try { await navigator.clipboard.writeText(userId || ''); flash('User ID copied.') }
    catch { flash('Copy failed.', true) }
  }

  const handleLogout = async () => { await signOut(); clear(); navigate('/login') }

  // Wired but disabled until launch (button stays disabled — see launch_checklist.md)
  const handleUpgrade = async () => {
    setLoading(true)
    try { const url = await createCheckoutSession(); window.location.href = url }
    catch (err) { flash(err.message, true) } finally { setLoading(false) }
  }

  if (!session) return null

  const shared = {
    user, userId, plan, isDark, toggleTheme,
    newPassword, setNewPassword,
    showPassword, setShowPassword, message, error, loading,
    handlePasswordReset, handleChangePassword,
    handleCopyUserId, handleLogout, handleUpgrade,
    goHome: () => setView('home'),
  }

  return (
    <div className="min-h-full bg-white dark:bg-slate-900">
      <div className="mx-auto w-full max-w-[520px] px-4 py-6 sm:py-8">
        {view === 'home' && (
          <SettingsHome s={shared} onNavigate={setView} onBack={() => navigate('/vault/chat')} />
        )}
        {view === 'edit' && <ProfileEdit s={shared} onBack={shared.goHome} />}
        {view === 'subscription' && <ManageSubscription s={shared} onBack={shared.goHome} />}
        {view === 'privacy' && <PrivacySettings onBack={shared.goHome} />}
        {view === 'features' && (
          <div className="max-w-2xl mx-auto p-6">
            <button onClick={() => setView('home')} className="text-sm text-[var(--text-tertiary)] mb-4 hover:text-[var(--text-primary)]">← Back</button>
            <FeatureFlagsSection />
          </div>
        )}
      </div>
    </div>
  )
}
