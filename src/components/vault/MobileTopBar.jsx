// src/components/vault/MobileTopBar.jsx
// Mobile-only: consistent "HridAI BETA + gear" bar on every page
import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'

export default function MobileTopBar() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shrink-0 sticky top-0 z-30">
      <span className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">HridAI</span>
      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider bg-[rgba(245,158,11,0.15)] text-[var(--accent-amber)]">BETA</span>
      <div className="flex-1" />
      <button
        onClick={() => navigate('/profile')}
        className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}
