// src/components/vault/todos/TagModal.jsx
import { useState } from 'react'
import { X } from 'lucide-react'

const TAG_COLORS = [
  '#818cf8', '#2dd4bf', '#fbbf24', '#f472b6',
  '#a78bfa', '#fb923c', '#60a5fa', '#34d399',
]

export default function TagModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(TAG_COLORS[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, color)
    setName('')
    setColor(TAG_COLORS[0])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] border border-[var(--border-active)] rounded-2xl p-6 w-[340px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Create New Tag</h3>
          <button type="button" onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <X size={16} />
          </button>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name (e.g. Errands, Side Project...)"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-indigo)] mb-3"
        />
        <div className="text-[11px] text-[var(--text-tertiary)] mb-2">Color</div>
        <div className="flex gap-2 mb-4">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                border: color === c ? '2px solid white' : '2px solid transparent',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-medium">Cancel</button>
          <button type="submit" disabled={!name.trim()} className="px-4 py-1.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium disabled:opacity-40">Create Tag</button>
        </div>
      </form>
    </div>
  )
}
