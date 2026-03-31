// src/components/vault/self/GoalItem.jsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import InlineEdit from '../InlineEdit'

const STATUS_STYLES = {
  active: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' },
  idle: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8' },
  completed: { bg: 'rgba(52,211,153,0.15)', text: '#34d399' },
}

export default function GoalItem({ goal, onUpdate, onDelete, readOnly }) {
  const [hovered, setHovered] = useState(false)
  const status = (goal.status || 'active').toLowerCase()
  const style = STATUS_STYLES[status] || STATUS_STYLES.active

  return (
    <div
      className="p-3 bg-[var(--bg-tertiary)] rounded-lg mb-2 flex items-center justify-between group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex-1 min-w-0">
        {readOnly ? (
          <div className="text-[var(--text-primary)] text-sm">{goal.text || goal.title || goal.value || goal.name}</div>
        ) : (
          <InlineEdit
            value={goal.text || goal.title || goal.value || goal.name}
            onSave={(val) => onUpdate?.({ ...goal, text: val })}
            className="text-sm"
          />
        )}
        {(goal.description || goal.timeline || goal.category) && (
          <div className="flex items-center gap-2 mt-0.5">
            {goal.category && (
              <span className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">{goal.category}</span>
            )}
            {goal.timeline && (
              <span className="text-[var(--text-tertiary)] text-[10px]">{goal.timeline}</span>
            )}
            {goal.description && (
              <span className="text-[var(--text-tertiary)] text-xs">{goal.description}</span>
            )}
          </div>
        )}
        {goal.specific_actions && goal.specific_actions.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {goal.specific_actions.map((action, i) => (
              <div key={i} className="text-[var(--text-secondary)] text-[11px] flex items-start gap-1.5">
                <span className="text-[var(--text-tertiary)] mt-0.5">-</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {status}
        </span>
        {!readOnly && hovered && (
          <button
            onClick={() => { if (confirm('Delete this goal?')) onDelete?.(goal) }}
            className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
