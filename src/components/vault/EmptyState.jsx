// src/components/vault/EmptyState.jsx
import { useNavigate } from 'react-router-dom'

export default function EmptyState({ icon, message, submessage, ctaLabel, ctaPath }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
      )}
      <p className="text-[var(--text-secondary)] text-sm max-w-md">{message}</p>
      {submessage && (
        <p className="text-[var(--text-tertiary)] text-xs mt-1 max-w-md">{submessage}</p>
      )}
      {ctaLabel && ctaPath && (
        <button
          onClick={() => navigate(ctaPath)}
          className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
