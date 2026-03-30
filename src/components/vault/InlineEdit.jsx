// src/components/vault/InlineEdit.jsx
import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'

export default function InlineEdit({ value, onSave, placeholder = 'Empty', className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSave = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    }
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent-indigo)] rounded px-2 py-1 text-sm outline-none ${className}`}
        placeholder={placeholder}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`group cursor-pointer inline-flex items-center gap-1 ${className}`}
    >
      <span className="text-[var(--text-primary)]">{value || placeholder}</span>
      <Pencil
        size={12}
        className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </span>
  )
}
