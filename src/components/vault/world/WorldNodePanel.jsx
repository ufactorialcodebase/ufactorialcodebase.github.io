// Bespoke details panel for the World graph. Two key differences from
// the shared SidePanel:
//
//   1. NO backdrop dim — the whole point of Feature 4 is that the graph
//      stays lit behind the panel so the user can see the highlighted
//      subgraph while reading node detail.
//   2. Mobile variant is a bottom-sheet that starts at ~40% viewport
//      height, drag-up to full screen, drag-down to dismiss. Uses
//      framer-motion drag; snaps to open / expanded / closed on release.
//
// The Escape key closes the panel from either variant.

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useDragControls } from 'framer-motion'
import { X, GripHorizontal } from 'lucide-react'

const BREAKPOINT_PX = 640  // sm — matches tailwind's sm breakpoint

// Sheet snap points as fractions of viewport height. 0 = fully open at top,
// 0.6 = ~40% visible from bottom, 1 = dismissed off-bottom.
const SNAP_OPEN = 0
const SNAP_PARTIAL = 0.6
const SNAP_CLOSED = 1

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT_PX : false
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < BREAKPOINT_PX)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

function DesktopPanel({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="world-node-panel-desktop"
          initial={{ x: 384, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 384, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="pointer-events-auto fixed top-0 right-0 z-40 h-full w-96 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] shadow-2xl overflow-y-auto"
          data-testid="world-node-panel"
          data-variant="desktop"
        >
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] z-10">
            <span className="text-[var(--text-primary)] font-medium">{title}</span>
            <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Close details">
              <X size={18} />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

// Approximate header height (grip row + title row) used to size the
// scrollable content area per snap state.
const SHEET_HEADER_PX = 88

function MobileSheet({ open, onClose, title, children }) {
  // y = 0 → fully open at top; y = 60vh → partial; y = 100vh → dismissed.
  const y = useMotionValue('60vh')
  // Which snap the sheet is resting at — sizes the content area so ALL
  // content is reachable by scrolling within the VISIBLE part of the
  // sheet. (The old version was a full-screen element translated down
  // 60vh: at the partial snap its bottom 60% lived below the viewport,
  // so long connection lists were cut off and unscrollable.)
  const [snap, setSnap] = useState('partial')
  // Drag starts from the header only — a whole-sheet drag listener
  // swallowed touch scrolls inside the content area.
  const dragControls = useDragControls()

  // Reset to the partial snap whenever the sheet (re)opens —
  // adjust-during-render form so no setState-in-effect cascade.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setSnap('partial')
  }

  // When `open` toggles on/off, animate to the appropriate snap point.
  useEffect(() => {
    if (open) {
      y.set('60vh')  // partial on open — user can drag up for full
    } else {
      y.set('100vh')
    }
  }, [open, y])

  const handleDragEnd = (_, info) => {
    const viewportH = window.innerHeight
    const currentY = info.point.y  // absolute viewport y of the drag handle
    const currentFrac = currentY / viewportH
    // Snap based on velocity + position.
    if (info.velocity.y > 500 || currentFrac > 0.85) {
      onClose()
    } else if (info.velocity.y < -300 || currentFrac < 0.3) {
      y.set('0vh')  // snap to full open
      setSnap('full')
    } else {
      y.set('60vh')  // partial
      setSnap('partial')
    }
  }

  const contentHeight = snap === 'full'
    ? `calc(100vh - ${SHEET_HEADER_PX}px)`
    : `calc(40vh - ${SHEET_HEADER_PX}px)`

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="world-node-panel-mobile"
          initial={{ y: '100vh' }}
          animate={{ y: '60vh' }}
          exit={{ y: '100vh' }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          style={{ y }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          className="pointer-events-auto fixed inset-x-0 top-0 z-40 h-screen bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] rounded-t-2xl shadow-2xl"
          data-testid="world-node-panel"
          data-variant="mobile"
          data-snap={snap}
        >
          <div
            className="bg-[var(--bg-secondary)] rounded-t-2xl touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              if (e.target.closest('button')) return  // X stays a click
              dragControls.start(e)
            }}
          >
            <div className="flex items-center justify-center py-2" aria-hidden="true">
              <GripHorizontal size={20} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-primary)] font-medium">{title}</span>
              <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Close details">
                <X size={18} />
              </button>
            </div>
          </div>
          <div
            className="p-4 overflow-y-auto overscroll-contain"
            style={{ height: contentHeight }}
            data-testid="world-node-panel-content"
          >
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default function WorldNodePanel({ open, onClose, title, children }) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // No backdrop — the pointer-events-none wrapper lets clicks pass through
  // to the graph so the user can click another node (re-anchor the
  // highlight) without dismissing the panel.
  return (
    <div className="pointer-events-none">
      {isMobile
        ? <MobileSheet open={open} onClose={onClose} title={title}>{children}</MobileSheet>
        : <DesktopPanel open={open} onClose={onClose} title={title}>{children}</DesktopPanel>}
    </div>
  )
}
