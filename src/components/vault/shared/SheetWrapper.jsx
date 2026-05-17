// src/components/vault/shared/SheetWrapper.jsx
// Slide-up sheet with:
// - Click backdrop to close (with dirty-check prompt if changes exist)
// - Swipe/drag down anywhere on sheet body to close (touch + mouse)
// - Form elements excluded from drag
import { useRef, useState, useCallback } from 'react'

export default function SheetWrapper({ isDirty, onSave, onClose, children }) {
  const sheetRef = useRef(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const startY = useRef(null)
  const deltaY = useRef(0)

  const tryClose = useCallback(() => {
    if (isDirty) {
      setShowPrompt(true)
    } else {
      onClose()
    }
  }, [isDirty, onClose])

  const handleStart = (clientY, e) => {
    const tag = e.target.tagName?.toLowerCase()
    if (['input', 'select', 'textarea', 'button', 'label'].includes(tag)) return
    if (e.target.closest('button') || e.target.closest('select')) return
    startY.current = clientY
  }

  const handleMove = (clientY) => {
    if (startY.current === null) return
    deltaY.current = clientY - startY.current
    if (deltaY.current > 5 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY.current}px)`
    }
  }

  const handleEnd = () => {
    if (deltaY.current > 80) tryClose()
    if (sheetRef.current) sheetRef.current.style.transform = ''
    startY.current = null
    deltaY.current = 0
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop — clicking this closes the sheet */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={tryClose}
      />
      {/* Sheet body */}
      <div
        ref={sheetRef}
        className="relative bg-[var(--bg-secondary)] rounded-t-2xl px-5 pb-6 pt-0 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto transition-transform"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => handleStart(e.touches[0].clientY, e)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientY, e)}
        onMouseMove={(e) => { if (startY.current !== null) handleMove(e.clientY) }}
        onMouseUp={handleEnd}
        onMouseLeave={() => { if (startY.current !== null) handleEnd() }}
      >
        <div className="w-9 h-1 rounded-full bg-[var(--border-active)] mx-auto mt-3 mb-5 cursor-grab" />
        {children}
      </div>

      {/* Dirty-check prompt */}
      {showPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
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
  )
}
