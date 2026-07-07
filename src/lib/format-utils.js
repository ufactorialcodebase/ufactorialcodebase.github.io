// Shared formatting utilities

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfLocalDay(d) {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

// Ribbon label for a day divider between chat messages:
//   today                → "Today"
//   yesterday            → "Yesterday"
//   2–6 days ago         → full weekday ("Tuesday")
//   older / future days  → "Mon, Jul 3"
export function formatDateRibbon(ts, now = new Date()) {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  const dayDiff = Math.floor((startOfLocalDay(now) - startOfLocalDay(d)) / 86400000)
  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff > 1 && dayDiff < 7) return WEEKDAYS_FULL[d.getDay()]
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

// Local-day key used by MessageList to detect day boundaries without
// re-parsing the same timestamp on every render iteration.
export function localDayKey(ts) {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Small in-bubble timestamp:
//   today          → "HH:MM"        (14:07)
//   this week      → "Mon HH:MM"    (Thu 14:07)
//   older / future → "Mon DD"       (Jul 3)
export function formatMessageTime(ts) {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  const dayDiff = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000
  )
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (sameDay) return `${hh}:${mm}`
  if (dayDiff > 0 && dayDiff < 7) return `${WEEKDAYS[d.getDay()]} ${hh}:${mm}`
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

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
