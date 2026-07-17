// src/components/vault/topics/MentionTimeline.v2.jsx
import { useState, useEffect, useCallback } from 'react'
import { getTopicMentions } from '../../../lib/api/vault-topic-mentions'
import { getEpisode } from '../../../lib/api/vault-episodes'
import { useNow } from '../../../hooks/useNow'

const SENTIMENT_COLOR = {
  positive: 'bg-[color:#4f6b4f]',
  hopeful:  'bg-[color:#4f6b4f]',
  neutral:  'bg-[color:#8a7a64]',
  mixed:    'bg-[color:#a0773b]',
  concerned:'bg-[color:#a0773b]',
  negative: 'bg-[color:#884444]',
}

function dotColor(s) {
  return SENTIMENT_COLOR[(s || 'neutral').toLowerCase()] || SENTIMENT_COLOR.neutral
}

// ISS-248: accept `now` so persona-demo callers can substitute the
// story-time anchor for real Date.now() when labeling "Today" / "Yesterday".
function formatWhen(iso, now) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const nowDate = now || new Date()
  const sameDay = d.toDateString() === nowDate.toDateString()
  const y = new Date(nowDate)
  y.setDate(y.getDate() - 1)
  const isYesterday = d.toDateString() === y.toDateString()
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')
  if (sameDay) return `Today ${time}`
  if (isYesterday) return `Yesterday ${time}`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time
}

const SNIPPET_LIMIT = 180

function SnippetText({ text }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return null
  const isLong = text.length > SNIPPET_LIMIT
  const display = isLong && !expanded ? text.slice(0, SNIPPET_LIMIT) + '…' : text
  return (
    <p className="mt-1.5 text-xs text-[var(--text-primary)] leading-relaxed">
      {display}
      {isLong && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] underline"
        >
          more
        </button>
      )}
    </p>
  )
}

function EpisodeDetails({ episode, aiInput }) {
  if (!episode && !aiInput) return null
  return (
    <div className="mt-3 pl-3 border-l border-[var(--border-subtle)] space-y-2">
      {episode ? (
        <>
          {episode.summary_text && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {episode.summary_text}
            </p>
          )}
          {episode.emotional_state && (
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {episode.emotional_state}
            </span>
          )}
          {episode.life_areas && episode.life_areas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {episode.life_areas.map((area) => (
                <span
                  key={area}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] capitalize"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-[var(--text-tertiary)] italic">Loading conversation details…</p>
      )}
      {aiInput && (
        <blockquote className="mt-2 pl-3 border-l-2 border-[var(--border-active)] text-xs text-[var(--text-secondary)] italic leading-relaxed">
          <span className="block text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] not-italic mb-1">
            HridAI replied
          </span>
          {aiInput}
        </blockquote>
      )}
    </div>
  )
}

function MentionCard({ mention, now }) {
  const [episodeOpen, setEpisodeOpen] = useState(false)
  const [episode, setEpisode] = useState(null)
  const [episodeFetched, setEpisodeFetched] = useState(false)

  const handleToggleEpisode = useCallback(async () => {
    const next = !episodeOpen
    setEpisodeOpen(next)
    if (next && !episodeFetched && mention.episode_id) {
      const ep = await getEpisode(mention.episode_id)
      setEpisode(ep)
      setEpisodeFetched(true)
    }
  }, [episodeOpen, episodeFetched, mention.episode_id])

  return (
    <article className="relative pl-4 md:pl-6 pb-4">
      {/* Branch stub — desktop only: horizontal tick from the trunk to this mention */}
      <span aria-hidden className="hidden md:block absolute left-0 top-3 w-4 h-px bg-[var(--border-active)]" />

      <div className="flex items-baseline gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotColor(mention.topic_sentiment)}`}
          title={mention.topic_sentiment || 'neutral'}
        />
        <time className="text-[11px] text-[var(--text-tertiary)]">
          {formatWhen(mention.conversation_at, now)}
        </time>
        {mention.attributed_to && mention.attributed_to !== 'user' && (
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            About: {mention.attributed_to}
          </span>
        )}
      </div>

      <SnippetText text={mention.context_snippet} />

      {mention.decision_made && (
        <p className="mt-1.5 text-xs text-[color:#4f6b4f] pl-2 border-l-2 border-[color:rgba(79,107,79,0.4)]">
          ↓ decided: {mention.decision_made}
        </p>
      )}

      <button
        onClick={handleToggleEpisode}
        className="mt-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
      >
        {episodeOpen ? 'Hide conversation details' : 'View conversation details'}
      </button>

      {episodeOpen && (
        <EpisodeDetails
          episode={episodeFetched ? episode : null}
          aiInput={mention.ai_input}
        />
      )}
    </article>
  )
}

const PAGE_SIZE = 5

export default function MentionTimelineV2({ topicId }) {
  const [mentions, setMentions] = useState(undefined) // undefined = loading, null = error, [] = empty
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  // ISS-248: persona anchor in demo, real Date.now() otherwise.
  const now = useNow()

  useEffect(() => {
    if (!topicId) {
      setMentions(null)
      return
    }
    let cancelled = false
    getTopicMentions(topicId, { limit: PAGE_SIZE, offset: 0 }).then((result) => {
      if (cancelled) return
      if (result === null) {
        setMentions(null)
      } else {
        setMentions(result.mentions)
        setTotal(result.total)
        setOffset(PAGE_SIZE)
      }
    })
    return () => { cancelled = true }
  }, [topicId])

  const handleLoadMore = async () => {
    if (loadingMore) return
    setLoadingMore(true)
    const result = await getTopicMentions(topicId, { limit: PAGE_SIZE, offset })
    if (result) {
      setMentions((prev) => [...(prev || []), ...result.mentions])
      setTotal(result.total)
      setOffset((prev) => prev + PAGE_SIZE)
    }
    setLoadingMore(false)
  }

  // Loading state
  if (mentions === undefined) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 rounded bg-[var(--bg-tertiary)]" />
        ))}
      </div>
    )
  }

  // Error / endpoint not yet shipped
  if (mentions === null) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] italic py-2">
        Recent moments will appear here when the API ships.
      </p>
    )
  }

  // No mentions yet
  if (mentions.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] italic py-2">
        No moments captured yet.
      </p>
    )
  }

  const atEnd = total !== null && mentions.length >= total

  return (
    <div>
      <div className="md:border-l md:border-[var(--border-subtle)]">
        {mentions.map((m) => (
          <MentionCard key={m.id} mention={m} now={now} />
        ))}
      </div>
      {!atEnd && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-2 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          {loadingMore ? 'Loading…' : '+ History'}
        </button>
      )}
    </div>
  )
}
