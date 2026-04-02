// Shared list style constants

export const CATEGORY_STYLES = {
  general: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  food: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  travel: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  entertainment: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  fitness: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  shopping: { bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  other: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
}

export function getCategoryStyle(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.general
}
