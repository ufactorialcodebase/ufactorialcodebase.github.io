import { useState, useCallback } from 'react'

const KEY = (ns) => `hridai_pinned_${ns}`

function read(ns) {
  try {
    const raw = localStorage.getItem(KEY(ns))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function write(ns, arr) {
  try { localStorage.setItem(KEY(ns), JSON.stringify(arr)) } catch { /* ignore */ }
}

export function usePinnedItems(namespace) {
  const [pinned, setPinned] = useState(() => read(namespace))

  const pin = useCallback((id) => {
    setPinned((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      write(namespace, next)
      return next
    })
  }, [namespace])

  const unpin = useCallback((id) => {
    setPinned((prev) => {
      const next = prev.filter((x) => x !== id)
      write(namespace, next)
      return next
    })
  }, [namespace])

  const isPinned = useCallback((id) => pinned.includes(id), [pinned])

  return { pinned, pin, unpin, isPinned }
}
