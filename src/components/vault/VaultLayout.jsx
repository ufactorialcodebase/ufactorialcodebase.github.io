// src/components/vault/VaultLayout.jsx
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import IconRail from './IconRail'
import ChatTab from './ChatTab'

export default function VaultLayout() {
  const { pathname } = useLocation()

  // Redirect /vault to /vault/chat
  if (pathname === '/vault' || pathname === '/vault/') {
    return <Navigate to="/vault/chat" replace />
  }

  const isChatActive = pathname === '/vault/chat'

  return (
    <div className="vault-theme h-screen flex bg-[var(--bg-primary)]">
      <IconRail />
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
