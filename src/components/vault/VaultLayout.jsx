// src/components/vault/VaultLayout.jsx
import { useState, useEffect, createContext, useContext } from 'react'
import { Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import IconRail from './IconRailContainer'
import BottomNav from './BottomNav'
import MobileTopBar from './MobileTopBar'
import ChatTab from './ChatTab'
import BetaWelcome from './BetaWelcome'
import AcceptanceGate from './AcceptanceGate'
import { useAuth } from '../../hooks/useAuth'
import { getCached, setCached } from '../../lib/vault-cache'
import { getWorld } from '../../lib/api/vault-world'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'

// Context to let Chat component communicate context panel state to MobileTopBar
const MobileContextPanelCtx = createContext(null)
export function useMobileContextPanel() { return useContext(MobileContextPanelCtx) }

export default function VaultLayout() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { refreshSubscription } = useAuth()
  const [toast, setToast] = useState(null)
  const [mobileContextOpen, setMobileContextOpen] = useState(false)
  const themeClass = useFeatureFlag('vault_redesign') ? 'vault-theme-warm' : 'vault-theme'

  // Eagerly preload world graph data on layout mount (heaviest dataset)
  useEffect(() => {
    if (!getCached('world')) {
      getWorld().then(d => setCached('world', d)).catch(() => {})
    }
  }, [])

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
  const isProfileActive = pathname === '/vault/profile'

  return (
    <MobileContextPanelCtx.Provider value={{ show: mobileContextOpen, toggle: () => setMobileContextOpen(v => !v) }}>
      <div className={`${themeClass} h-dvh flex flex-col md:flex-row bg-[var(--bg-primary)]`}>
        <AcceptanceGate />
        <BetaWelcome />
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-lg">
            {toast}
          </div>
        )}

        {/* Desktop: side rail (hidden on mobile) */}
        <div className="hidden md:block">
          <IconRail basePath="/vault" />
        </div>

        {/* Mobile: top bar (hidden on desktop) */}
        <div className="md:hidden shrink-0">
          <MobileTopBar
            showContext={mobileContextOpen}
            onToggleContext={() => setMobileContextOpen(v => !v)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative min-h-0">
          {/* Chat is always mounted to preserve session state — hidden when other tabs are active */}
          <div className={isChatActive ? 'h-full' : 'hidden'}>
            <ChatTab />
          </div>
          {/* Other tabs render via Outlet and unmount on switch (fresh data each time) */}
          {!isChatActive && !isProfileActive && <Outlet />}
          {/* Profile renders within VaultLayout so chat stays mounted */}
          {isProfileActive && <Outlet />}
        </main>

        {/* Mobile: bottom nav (hidden on desktop) */}
        <div className="md:hidden shrink-0">
          <BottomNav />
        </div>
      </div>
    </MobileContextPanelCtx.Provider>
  )
}
