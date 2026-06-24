// src/components/vault/RailClusterPopover.jsx
import { useEffect, useRef } from 'react'

/**
 * Small popover anchored to a rail cluster icon. Lists sub-items;
 * click navigates via the parent's onSelect callback.
 */
export default function RailClusterPopover({ open, items, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute left-full top-0 ml-2 min-w-[160px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg py-1 z-50"
    >
      {items.map((item) => (
        <button
          key={item.path}
          role="menuitem"
          onClick={() => onSelect(item.path)}
          className="block w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
