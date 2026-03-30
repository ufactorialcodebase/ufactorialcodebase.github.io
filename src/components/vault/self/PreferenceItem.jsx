// src/components/vault/self/PreferenceItem.jsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import InlineEdit from '../InlineEdit'

export default function PreferenceItem({ preference, onUpdate, onDelete, readOnly }) {
  const [hovered, setHovered] = useState(false)
  const category = preference.category || preference.type || 'general'
  const value = preference.value || preference.name || preference.title

  return (
    <div
      className="p-3 bg-[var(--bg-tertiary)] rounded-lg mb-2 flex items-center justify-between group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {readOnly ? (
        <span className="text-[var(--text-primary)] text-sm">{value}</span>
      ) : (
        <InlineEdit
          value={value}
          onSave={(val) => onUpdate?.({ ...preference, value: val })}
          className="text-sm"
        />
      )}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">{category}</span>
        {!readOnly && hovered && (
          <button
            onClick={() => { if (confirm('Delete this preference?')) onDelete?.(preference) }}
            className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
