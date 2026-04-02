// Shared artifact style constants

export const CONTENT_TYPE_STYLES = {
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

export function getContentTypeStyle(contentType) {
  return CONTENT_TYPE_STYLES[contentType] || {
    label: contentType || 'Document',
    bg: 'rgba(107,114,128,0.15)',
    color: '#6b7280',
  }
}
