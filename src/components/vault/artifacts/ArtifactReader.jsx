// src/components/vault/artifacts/ArtifactReader.jsx
import { useState, useEffect } from 'react'
import { Trash2, Pencil, X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getContentTypeStyle } from './artifact-utils'
import { updateArtifact } from '../../../lib/api/vault-artifacts'

export default function ArtifactReader({ artifact, onDelete, onUpdate }) {
  const style = getContentTypeStyle(artifact.content_type)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(artifact.title || '')
  const [draftContent, setDraftContent] = useState(artifact.content || '')
  const [saving, setSaving] = useState(false)

  // Whenever a different artifact is loaded into the reader (deep-link or
  // switching card), reset the draft + drop back into read mode.
  useEffect(() => {
    setDraftTitle(artifact.title || '')
    setDraftContent(artifact.content || '')
    setEditing(false)
  }, [artifact.id])

  const dirty =
    draftTitle !== (artifact.title || '') ||
    draftContent !== (artifact.content || '')

  const handleDelete = () => {
    if (!confirm(`Delete "${artifact.title}"? This cannot be undone.`)) return
    onDelete(artifact)
  }

  const handleCancel = () => {
    setDraftTitle(artifact.title || '')
    setDraftContent(artifact.content || '')
    setEditing(false)
  }

  const handleSave = async () => {
    if (!dirty) {
      setEditing(false)
      return
    }
    const trimmedTitle = draftTitle.trim()
    if (!trimmedTitle) {
      toast.error('Title cannot be empty')
      return
    }
    setSaving(true)
    try {
      // Only send fields that actually changed — keeps the backend
      // version-bump logic honest (metadata-only updates don't bump).
      const patch = {}
      if (trimmedTitle !== (artifact.title || '')) patch.title = trimmedTitle
      if (draftContent !== (artifact.content || '')) patch.content = draftContent
      const updated = await updateArtifact(artifact.id, patch)
      // Backend returns the full updated artifact (or an { artifact: ... }
      // wrapper depending on the route shape). Normalize both.
      const merged = updated?.artifact || updated || {
        ...artifact,
        ...patch,
        version: (artifact.version || 1) + 1,
      }
      onUpdate?.(merged)
      setEditing(false)
      toast.success(`Saved — v${merged.version || (artifact.version || 1) + 1}`)
    } catch (err) {
      toast.error(`Failed to save: ${err.message || 'unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4" data-testid="artifact-reader" data-editing={editing ? 'true' : 'false'}>
      {/* Title + badge + edit toggle */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          {editing ? (
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="flex-1 text-[var(--text-primary)] text-lg font-semibold leading-snug bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--accent-indigo)]"
              data-testid="artifact-title-input"
              placeholder="Title"
            />
          ) : (
            <h2 className="text-[var(--text-primary)] text-lg font-semibold leading-snug flex-1">
              {artifact.title || 'Untitled'}
            </h2>
          )}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs px-2 py-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
              data-testid="artifact-edit-button"
              title="Edit this document"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-medium"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            {style.label}
          </span>
          {artifact.version != null && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              data-testid="artifact-version"
            >
              v{artifact.version}
            </span>
          )}
        </div>
      </div>

      {/* Summary (read-only display; regeneration is a backend concern) */}
      {artifact.summary && !editing && (
        <div>
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-1">Summary</div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {artifact.summary}
          </p>
        </div>
      )}

      {/* Full content — textarea in edit mode, styled block in read mode */}
      <div>
        <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-1">Content</div>
        {editing ? (
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="w-full min-h-[40vh] max-h-[60vh] text-[var(--text-primary)] text-sm leading-relaxed bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-3 outline-none focus:border-[var(--accent-indigo)] font-mono"
            data-testid="artifact-content-textarea"
            placeholder="Write the document contents…"
            spellCheck={false}
          />
        ) : (
          <div
            className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap bg-[var(--bg-tertiary)] rounded-lg p-3 overflow-auto max-h-[60vh]"
          >
            {artifact.content || <span className="text-[var(--text-tertiary)] italic">(No content yet — click Edit to add some.)</span>}
          </div>
        )}
      </div>

      {/* Edit-mode actions */}
      {editing && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm px-3 py-1.5 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
            data-testid="artifact-cancel-button"
          >
            <X size={14} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1 bg-[var(--accent-indigo)] text-white text-sm px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="artifact-save-button"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {/* Linked topic — read-only either way */}
      {artifact.linked_topic && !editing && (
        <div>
          <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide mb-1">Linked Topic</div>
          <span className="px-2 py-0.5 rounded-md text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            {artifact.linked_topic}
          </span>
        </div>
      )}

      {/* Delete — hidden in edit mode to avoid destructive-action confusion */}
      {!editing && (
        <div className="pt-4 border-t border-[var(--border-subtle)] mt-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            <Trash2 size={14} />
            Delete document
          </button>
        </div>
      )}
    </div>
  )
}
