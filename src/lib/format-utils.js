// Shared formatting utilities

export function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export function daysUntilDate(monthDay) {
  if (!monthDay) return null
  const parts = monthDay.split('-')
  if (parts.length !== 2) return null
  const month = parseInt(parts[0]) - 1
  const day = parseInt(parts[1])
  if (isNaN(month) || isNaN(day)) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), month, day)
  if (next < now) next = new Date(now.getFullYear() + 1, month, day)
  return Math.ceil((next - now) / 86400000)
}
