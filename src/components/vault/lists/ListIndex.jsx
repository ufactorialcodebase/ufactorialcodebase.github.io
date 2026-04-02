// src/components/vault/lists/ListIndex.jsx
import { Plus } from 'lucide-react'
import { getCategoryStyle } from './list-utils'

export default function ListIndex({ lists, selectedId, onSelect, onShowCreate }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">
          Lists ({lists.length})
        </span>
        <button
          onClick={onShowCreate}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={12} />
          New List
        </button>
      </div>

      {lists.map((list) => {
        const style = getCategoryStyle(list.category)
        const itemCount = (list.items || []).length
        const isActive = list.id === selectedId

        return (
          <button
            key={list.id}
            onClick={() => onSelect(list.id)}
            className={`w-full text-left rounded-xl p-3 transition-colors border ${
              isActive
                ? 'border-[var(--border-active)] bg-[rgba(99,102,241,0.08)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-active)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[var(--text-primary)] text-sm font-medium truncate">
                  {list.name}
                </div>
                <div className="text-[var(--text-tertiary)] text-[10px] mt-0.5">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium shrink-0"
                style={{ backgroundColor: style.bg, color: style.color }}
              >
                {list.category || 'general'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
