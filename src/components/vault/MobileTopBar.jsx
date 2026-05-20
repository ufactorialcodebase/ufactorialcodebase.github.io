// src/components/vault/MobileTopBar.jsx
// Mobile-only: "HridAI BETA" bar with context panel and gear
import { useNavigate, useLocation } from 'react-router-dom'
import { Settings, Brain } from 'lucide-react'

export default function MobileTopBar({ showContext, onToggleContext, basePath = '/vault', onExit }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isChat = pathname === `${basePath}/chat`

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shrink-0 sticky top-0 z-30">
      <span className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">HridAI</span>
      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider bg-[rgba(245,158,11,0.15)] text-[var(--accent-amber)]">BETA</span>
      <div className="flex-1" />
      {/* Context panel toggle — only on chat page */}
      {isChat && onToggleContext && (
        <button
          onClick={onToggleContext}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            showContext
              ? 'bg-[rgba(99,102,241,0.15)] text-[var(--accent-indigo)]'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Brain size={14} />
        </button>
      )}
      {/* Settings or Exit (demo mode) */}
      {onExit ? (
        <button
          onClick={onExit}
          className="px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors text-[10px] font-medium"
        >
          Exit
        </button>
      ) : (
        <button
          onClick={() => navigate('/vault/profile')}
          className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <Settings size={14} />
        </button>
      )}
    </div>
  )
}
