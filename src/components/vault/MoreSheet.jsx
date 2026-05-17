// src/components/vault/MoreSheet.jsx
// Grid popup for additional vault pages (mobile only) — swipe down to dismiss
import { useRef } from 'react'

export default function MoreSheet({ pages, onNavigate, onClose }) {
  const sheetRef = useRef(null)
  const touchStartY = useRef(0)
  const touchDelta = useRef(0)

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-handle]')) touchStartY.current = e.touches[0].clientY
  }
  const handleTouchMove = (e) => {
    if (!touchStartY.current) return
    touchDelta.current = e.touches[0].clientY - touchStartY.current
    if (touchDelta.current > 0 && sheetRef.current) sheetRef.current.style.transform = `translateY(${touchDelta.current}px)`
  }
  const handleTouchEnd = () => {
    if (touchDelta.current > 60) onClose()
    if (sheetRef.current) sheetRef.current.style.transform = ''
    touchStartY.current = 0
    touchDelta.current = 0
  }

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={sheetRef}
        className="absolute bottom-[56px] left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-active)] rounded-t-2xl p-4 pb-2 shadow-2xl animate-slide-up transition-transform"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div data-handle className="w-9 h-1 rounded-full bg-[var(--border-active)] mx-auto mb-4 cursor-grab" />
        <div className="grid grid-cols-3 gap-3">
          {pages.map((page) => (
            <button
              key={page.path}
              onClick={() => onNavigate(page.path)}
              className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] active:bg-[var(--bg-tertiary)] active:border-[var(--border-active)] transition-colors"
            >
              <span className="text-xl">{page.icon}</span>
              <span className="text-[11px] font-medium text-[var(--text-primary)]">{page.label}</span>
              <span className="text-[8px] text-[var(--text-tertiary)] text-center leading-tight">{page.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
