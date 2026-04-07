// src/components/vault/topics/TopicRow.jsx
import { useState } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'
import { timeAgo } from '../../../lib/format-utils'
import { motion, AnimatePresence } from 'framer-motion'
import InlineEdit from '../InlineEdit'

const STATUS_STYLES = {
  active: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa', label: 'Active' },
  dormant: { bg: 'rgba(139,149,168,0.15)', text: '#8b95a8', label: 'Dormant' },
  resolved: { bg: 'rgba(52,211,153,0.15)', text: '#34d399', label: 'Resolved' },
}

const CATEGORY_STYLES = {
  family: { bg: 'rgba(20,184,166,0.12)', text: '#14b8a6' },
  career: { bg: 'rgba(99,102,241,0.12)', text: '#6366f1' },
  health: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e' },
  finance: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  social: { bg: 'rgba(236,72,153,0.12)', text: '#ec4899' },
  other: { bg: 'rgba(139,149,168,0.12)', text: '#8b95a8' },
}

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#8b95a8',
}

const STATUS_CYCLE = ['active', 'resolved', 'dormant']

export default function TopicRow({ topic, onUpdate, onDelete, entityLookup = {} }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const status = (topic.current_status || 'active').toLowerCase()
  const style = STATUS_STYLES[status] || STATUS_STYLES.active
  const category = (topic.category || '').toLowerCase()
  const catStyle = CATEGORY_STYLES[category] || null
  const sentimentColor = topic.overall_sentiment ? SENTIMENT_COLORS[topic.overall_sentiment.toLowerCase()] || null : null

  const handleStatusCycle = (e) => {
    e.stopPropagation()
    const currentIdx = STATUS_CYCLE.indexOf(status)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]
    onUpdate({ ...topic, current_status: nextStatus })
  }

  return (
    <div
      className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl mb-2 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-tertiary)]/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {sentimentColor && (
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sentimentColor }}
            title={`Sentiment: ${topic.overall_sentiment}`} />
        )}
        <div className="flex-1 min-w-0">
          <InlineEdit
            value={topic.name}
            onSave={(val) => onUpdate({ ...topic, name: val })}
            className="text-sm font-medium"
          />
        </div>
        {catStyle && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0"
            style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
            {category}
          </span>
        )}
        <button
          onClick={handleStatusCycle}
          className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: style.bg, color: style.text }}
          title="Click to change status"
        >
          {style.label}
        </button>
        {topic.last_mentioned && (
          <span className="text-[var(--text-tertiary)] text-[10px] shrink-0 hidden sm:block">
            {timeAgo(topic.last_mentioned)}
          </span>
        )}
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm('Delete this topic?')) onDelete(topic) }}
            className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
        <ChevronDown
          size={14}
          className={`text-[var(--text-tertiary)] transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
        />
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-[var(--border-subtle)]">
              {topic.current_summary && (
                <p className="text-[var(--text-secondary)] text-xs mt-3 leading-relaxed">
                  {topic.current_summary}
                </p>
              )}
              {topic.last_decision && (
                <div className="mt-2">
                  <span className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">Last decision</span>
                  <p className="text-[var(--text-secondary)] text-xs mt-0.5">{topic.last_decision}</p>
                </div>
              )}
              {topic.open_questions && topic.open_questions.length > 0 && (
                <div className="mt-2">
                  <span className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">Open questions</span>
                  <ul className="mt-1 space-y-0.5">
                    {topic.open_questions.map((q, i) => (
                      <li key={i} className="text-[var(--text-secondary)] text-xs flex gap-1.5">
                        <span className="text-[var(--text-tertiary)] shrink-0">?</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {topic.key_entity_ids && topic.key_entity_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {topic.key_entity_ids.map((id, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-[rgba(99,102,241,0.1)] text-[var(--accent-indigo)]">
                      {entityLookup[id] || 'Entity'}
                    </span>
                  ))}
                </div>
              )}
              {topic.mention_count > 0 && (
                <span className="text-[var(--text-tertiary)] text-[10px] mt-2 block">
                  Mentioned {topic.mention_count} time{topic.mention_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
