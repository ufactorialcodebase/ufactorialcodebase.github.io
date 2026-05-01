// src/components/vault/VaultLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import IconRail from './IconRail'
import ChatTab from './ChatTab'
import BetaWelcome from './BetaWelcome'
import { useAuth } from '../../hooks/useAuth'

export default function VaultLayout() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { refreshSubscription } = useAuth()
  const [toast, setToast] = useState(null)

  // Handle Stripe checkout return
  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (checkout === 'success') {
      setToast('Welcome to Premium! 🎉')
      refreshSubscription?.()
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
      setTimeout(() => setToast(null), 5000)
    } else if (checkout === 'canceled') {
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, refreshSubscription])

  // Redirect /vault to /vault/chat
  if (pathname === '/vault' || pathname === '/vault/') {
    return <Navigate to="/vault/chat" replace />
  }

  const isChatActive = pathname === '/vault/chat'

  return (
    <div className="vault-theme h-screen flex bg-[var(--bg-primary)]">
      <BetaWelcome />
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
      <IconRail basePath="/vault" />
      <main className="flex-1 overflow-y-auto relative">
        {/* Chat is always mounted to preserve session state — hidden when other tabs are active */}
        <div className={isChatActive ? '' : 'hidden'}>
          <ChatTab />
        </div>
        {/* Other tabs render via Outlet and unmount on switch (fresh data each time) */}
        {!isChatActive && <Outlet />}
      </main>
    </div>
  )
}
