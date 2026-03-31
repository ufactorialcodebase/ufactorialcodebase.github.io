// src/components/vault/artifacts/ArtifactReader.jsx
import { Trash2 } from 'lucide-react'

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

export default function ArtifactReader({ artifact, onDelete }) {
  const style = getContentTypeStyle(artifact.content_type)

  const handleDelete = () => {
    if (!confirm(`Delete "${artifact.title}"? This cannot be undone.`)) return
    onDelete(artifact)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Title + badge */}
      <div>
        <h2 className="text-[var(--text-primary)] text-lg font-semibold leading-snug mb-2">
          {artifact.title || 'Untitled'}
        </h2>
        <span
          className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-medium"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </div>

      {/* Summary */}
      {artifact.summary && (
        <div>
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-1">Summary</div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {artifact.summary}
          </p>
        </div>
      )}

      {/* Full content */}
      {artifact.content && (
        <div>
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-1">Content</div>
          <div
            className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap bg-[var(--bg-tertiary)] rounded-lg p-3 overflow-auto max-h-[60vh]"
          >
            {artifact.content}
          </div>
        </div>
      )}

      {/* Linked topic */}
      {artifact.linked_topic && (
        <div>
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-1">Linked Topic</div>
          <span className="px-2 py-0.5 rounded-md text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            {artifact.linked_topic}
          </span>
        </div>
      )}

      {/* Delete */}
      <div className="pt-4 border-t border-[var(--border-subtle)] mt-2">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          <Trash2 size={14} />
          Delete document
        </button>
      </div>
    </div>
  )
}
