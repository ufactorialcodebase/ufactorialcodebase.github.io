import { Tag, Clock, Pin } from 'lucide-react'

const TOPIC_STATUS_CONFIG = {
  active:   { bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]', textClass: 'text-[color:#4f6b4f]' },
  resolved: { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]' },
  default:  { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]' },
}

function getConfig(status) {
  const s = (status || 'default').toLowerCase()
  return TOPIC_STATUS_CONFIG[s] || TOPIC_STATUS_CONFIG.default
}

export default function TopicCardV2({ topic, pinned = false, onTogglePin }) {
  const status = topic.current_status || topic.status || 'active'
  const config = getConfig(status)
  const summary = topic.current_summary || topic.context || ''
  const decision = topic.last_decision
  const openQs = Array.isArray(topic.open_questions) ? topic.open_questions : []
  const visibleQs = openQs.slice(0, 3)
  const moreQs = Math.max(0, openQs.length - visibleQs.length)

  return (
    <article className={`rounded-lg p-3 mb-2 border ${config.bgClass} transition-shadow hover:shadow-sm`}>
      <header className="flex items-start gap-2">
        <Tag className={`w-4 h-4 mt-0.5 ${config.textClass}`} />
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold ${config.textClass} leading-snug`}>{topic.name}</h4>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${config.textClass} bg-white/40`}>
          {status}
        </span>
        {onTogglePin && (
          <button
            aria-label={pinned ? 'Unpin' : 'Pin'}
            onClick={(e) => { e.stopPropagation(); onTogglePin(topic.id) }}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Pin size={14} fill={pinned ? 'currentColor' : 'none'} />
          </button>
        )}
      </header>

      {summary && (
        <p className="mt-2 text-xs text-[var(--text-primary)] leading-relaxed">
          {summary}
        </p>
      )}

      {decision && (
        <p className="mt-2 text-xs text-[var(--text-primary)] leading-relaxed pl-3 border-l-2 border-[color:rgba(79,107,79,0.4)]">
          <span className="text-[var(--text-tertiary)]">decided:</span> {decision}
        </p>
      )}

      {visibleQs.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">open</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {visibleQs.map((q, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] leading-snug">{q}</li>
            ))}
            {moreQs > 0 && <li className="text-xs text-[var(--text-tertiary)]">+{moreQs} more</li>}
          </ul>
        </div>
      )}

      {topic.last_mentioned && (
        <div className="mt-2 text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(topic.last_mentioned).toLocaleDateString()}
        </div>
      )}
    </article>
  )
}
