// src/components/vault/artifacts/ArtifactCard.jsx

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

const CONTENT_TYPE_STYLES = {
  action_plan: {
    label: 'Action Plan',
    bg: 'rgba(99,102,241,0.15)',
    color: 'var(--accent-indigo)',
  },
  decision_brief: {
    label: 'Decision Brief',
    bg: 'rgba(20,184,166,0.15)',
    color: '#14b8a6',
  },
  external_prompt: {
    label: 'External Prompt',
    bg: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
  },
}

function getContentTypeStyle(contentType) {
  return CONTENT_TYPE_STYLES[contentType] || {
    label: contentType || 'Document',
    bg: 'rgba(107,114,128,0.15)',
    color: '#6b7280',
  }
}

export default function ArtifactCard({ artifact, onClick }) {
  const style = getContentTypeStyle(artifact.content_type)
  const updated = timeAgo(artifact.updated_at || artifact.created_at)

  return (
    <div
      onClick={() => onClick(artifact)}
      className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:border-[var(--border-active)] transition-colors flex flex-col gap-2.5"
    >
      {/* Header: title + badge */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[var(--text-primary)] font-medium text-sm leading-snug line-clamp-2">
            {artifact.title || 'Untitled'}
          </div>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-medium shrink-0 mt-0.5"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </div>

      {/* Summary */}
      {artifact.summary && (
        <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2">
          {artifact.summary}
        </p>
      )}

      {/* Footer: linked topic + time */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        {artifact.linked_topic && (
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] truncate max-w-[140px]">
            {artifact.linked_topic}
          </span>
        )}
        {updated && (
          <span className="text-[var(--text-tertiary)] text-[10px] ml-auto shrink-0">
            {updated}
          </span>
        )}
      </div>
    </div>
  )
}
