// src/components/vault/shared/SheetWrapper.jsx
// Slide-up sheet with swipe-down dismiss and dirty-check prompt
import { useRef, useState } from 'react'

export default function SheetWrapper({ isDirty, onSave, onClose, children }) {
  const sheetRef = useRef(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const touchStartY = useRef(0)
  const touchDeltaY = useRef(0)

  const tryClose = () => {
    if (isDirty) {
      setShowPrompt(true)
    } else {
      onClose()
    }
  }

  const handleTouchStart = (e) => {
    const handle = e.target.closest('[data-sheet-handle]')
    if (handle) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e) => {
    if (touchStartY.current === 0) return
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current
    if (touchDeltaY.current > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${touchDeltaY.current}px)`
    }
  }

  const handleTouchEnd = () => {
    if (touchDeltaY.current > 80) {
      tryClose()
    }
    if (sheetRef.current) sheetRef.current.style.transform = ''
    touchStartY.current = 0
    touchDeltaY.current = 0
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={(e) => { if (e.target === e.currentTarget) tryClose() }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={sheetRef}
        className="relative bg-[var(--bg-secondary)] rounded-t-2xl px-5 pb-6 pt-0 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto transition-transform"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div data-sheet-handle className="w-9 h-1 rounded-full bg-[var(--border-active)] mx-auto mt-3 mb-5 cursor-grab" />

        {children}

        {/* Dirty prompt */}
        {showPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-active)] rounded-2xl p-5 w-[280px] shadow-2xl text-center">
              <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Save changes?</div>
              <div className="text-xs text-[var(--text-tertiary)] mb-4">You have unsaved changes.</div>
              <div className="flex gap-3">
                <button onClick={() => { setShowPrompt(false); onClose() }}
                  className="flex-1 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-medium">
                  Discard
                </button>
                <button onClick={() => { setShowPrompt(false); onSave() }}
                  className="flex-1 py-2 rounded-xl bg-[var(--accent-indigo)] text-white text-sm font-medium">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
