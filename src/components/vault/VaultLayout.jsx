// src/components/vault/VaultLayout.jsx
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import IconRail from './IconRail'

export default function VaultLayout() {
  const { pathname } = useLocation()

  // Redirect /vault to /vault/chat
  if (pathname === '/vault' || pathname === '/vault/') {
    return <Navigate to="/vault/chat" replace />
  }

  return (
    <div className="vault-theme h-screen flex bg-[var(--bg-primary)]">
      <IconRail />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
