// src/components/vault/world/WorldTab.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../PageHeader'
import TabHint from '../TabHint'
import EmptyState from '../EmptyState'
import WorldNodePanel from './WorldNodePanel'
import ForceGraph from './ForceGraph'
import { useVaultData } from '../../../lib/vault-cache'
import { getWorld } from '../../../lib/api/vault-world'
import { getEntities } from '../../../lib/api/vault-entities'
import { getTopics } from '../../../lib/api/vault-topics'
import { bfsDistances, DEFAULT_BRIDGE_EXCLUDED } from '../../../lib/graph-highlight'
import { rankNodeMatches, groupConnections, getNodeColor } from '../../../lib/world-view-utils'
import { timeAgo } from '../../../lib/format-utils'

const NODE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'entities', label: 'Entities only' },
]

export default function WorldTab() {
  const { data: worldData, loading, error, refetch } = useVaultData('world', getWorld)
  // Piggyback on the shared vault-cache: entities + topics are already
  // fetched for the People / Topics tabs. Post-ISS-230 both endpoints
  // return `mention_count` per row, which we use to size world nodes by
  // frequency (bigger dot = more frequently mentioned). The world API
  // itself doesn't propagate mention_count today — this is a client-side
  // enrichment. Zero backend change needed.
  const { data: entityData } = useVaultData('entities', getEntities, {
    transform: (result) => result.entities || result || [],
  })
  const { data: topicData } = useVaultData('topics', getTopics, {
    transform: (result) => result.topics || result || [],
  })
  const [selectedNode, setSelectedNode] = useState(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState(null)

  const handleNodeClick = useCallback((node) => {
    if (node.id === 'you') return
    setSelectedNode(node)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const [nodeFilter, setNodeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Build a nodeId → mention_count map from the shared caches, then enrich
  // world nodes with it so ForceGraph's `computeNodeRadius` can scale by
  // frequency. Falls back gracefully when caches haven't loaded yet.
  const mentionCountMap = useMemo(() => {
    const m = new Map()
    // Enrich only once BOTH sources have landed — applying them one at a
    // time rebuilt the graph once per arrival (the "loads 2-3 times"
    // flicker; the other half of that fix is ForceGraph's signature guard).
    if (!entityData || !topicData) return m
    for (const e of (entityData || [])) {
      const id = e.id || e.entity_id
      if (id != null && typeof e.mention_count === 'number') m.set(id, e.mention_count)
    }
    for (const t of (topicData || [])) {
      if (t.id != null && typeof t.mention_count === 'number') m.set(t.id, t.mention_count)
    }
    return m
  }, [entityData, topicData])

  const rawNodes = useMemo(() => {
    const source = worldData?.nodes || []
    if (mentionCountMap.size === 0) return source
    return source.map((n) => (
      n.id === 'you' || mentionCountMap.get(n.id) == null
        ? n
        : { ...n, mention_count: mentionCountMap.get(n.id) }
    ))
  }, [worldData, mentionCountMap])

  // Memoize to keep the reference stable across renders — three
  // downstream useMemos depend on it (BFS distances, connections list,
  // filtered `nodes`/`edges` view).
  const rawEdges = useMemo(() => worldData?.edges || [], [worldData])

  // "Entities only" hides topic nodes (topic node type == 'topic') and any
  // edge that references one. "you" always stays so the graph keeps its
  // anchor. Todo nodes aren't currently rendered by the API but the filter
  // is written to drop them too if that ever changes.
  const { nodes, edges } = useMemo(() => {
    if (nodeFilter === 'all') return { nodes: rawNodes, edges: rawEdges }
    const kept = new Set()
    const filteredNodes = rawNodes.filter((n) => {
      const t = (n.type || '').toLowerCase()
      const keep = n.id === 'you' || (t !== 'topic' && t !== 'todo')
      if (keep) kept.add(n.id)
      return keep
    })
    const filteredEdges = rawEdges.filter((e) => kept.has(e.source) && kept.has(e.target))
    return { nodes: filteredNodes, edges: filteredEdges }
  }, [rawNodes, rawEdges, nodeFilter])

  const hasGraph = !loading && !error && rawNodes.length > 1

  // Responsive sizing. Measurement is gated on hasGraph: the controls +
  // legend rows only render once the graph data is in, and measuring
  // before they exist gave the first build a taller container than the
  // final layout — the graph then rebuilt on the ~57px shrink (one of
  // the "world view loads 2-3 times" sources). Measuring after hasGraph
  // means the first build already uses the settled height.
  useEffect(() => {
    if (!hasGraph) return
    const el = containerRef.current
    if (!el) return

    // Get initial size immediately (layout already includes controls)
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: rect.width, height: Math.max(rect.height, 500) })
    }

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0) {
        setDimensions({ width, height: Math.max(height, 500) })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasGraph])

  // BFS distance map from the selected node — drives which nodes get
  // the glow filter and which get the dim filter. `bridgeExcluded:
  // ['you']` prevents BFS from walking through the central "you" hub;
  // otherwise every entity would be 2° from every other (via the
  // you-in-the-middle shortcut) and the highlight would collapse into
  // "everything lights up." What we WANT is entity-to-entity closeness.
  const highlightDistances = useMemo(() => {
    if (!selectedNode) return null
    return bfsDistances(selectedNode.id, rawEdges, undefined, {
      bridgeExcluded: DEFAULT_BRIDGE_EXCLUDED,
    })
  }, [selectedNode, rawEdges])

  // Fast id→node lookup for resolving the "other end" of each edge into
  // a human label when building the Connections list for the panel.
  const nodesById = useMemo(() => {
    const m = new Map()
    for (const n of rawNodes) m.set(n.id, n)
    return m
  }, [rawNodes])

  // nodeId → last_mentioned from the shared entity/topic caches — shown
  // beside each connection entry so the panel carries recency signal.
  const lastMentionedMap = useMemo(() => {
    const m = new Map()
    for (const e of (entityData || [])) {
      const id = e.id || e.entity_id
      if (id != null && e.last_mentioned) m.set(id, e.last_mentioned)
    }
    for (const t of (topicData || [])) {
      if (t.id != null && t.last_mentioned) m.set(t.id, t.last_mentioned)
    }
    return m
  }, [entityData, topicData])

  // Search: substring match on node labels; Enter/Search picks the top
  // match, clicking a suggestion picks that node. Selection goes through
  // the exact same state as a manual graph click, so the highlight +
  // panel behavior is identical.
  const searchMatches = useMemo(
    () => rankNodeMatches(rawNodes, searchQuery),
    [rawNodes, searchQuery]
  )

  const handleSearchSelect = useCallback((node) => {
    setSelectedNode(node)
    setSearchQuery('')
  }, [])

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault()
    if (searchMatches.length > 0) handleSearchSelect(searchMatches[0])
  }, [searchMatches, handleSearchSelect])

  // Clicking a connection entry re-anchors the selection on that node —
  // the panel then shows ITS connections and the graph highlight follows.
  const handleConnectionClick = useCallback((otherId) => {
    if (otherId === 'you') return
    const node = nodesById.get(otherId)
    if (node) setSelectedNode(node)
  }, [nodesById])

  // Relations touching the selected node — every edge where selectedNode
  // is either endpoint. Kept intentionally unopinionated about direction
  // (we don't render arrows): the relation LABEL already carries the
  // semantics (`spouse`, `works_at`, `mentioned_in`), and mixing arrows
  // in with topic ↔ entity `mentioned_in` edges reads noisier than the
  // label alone. Deduped by (other, label) so a rare double-persisted
  // edge doesn't show twice.
  const selectedConnections = useMemo(() => {
    if (!selectedNode) return []
    const out = []
    const seen = new Set()
    for (const e of rawEdges) {
      const isSource = e.source === selectedNode.id
      const isTarget = e.target === selectedNode.id
      if (!isSource && !isTarget) continue
      const otherId = isSource ? e.target : e.source
      const other = nodesById.get(otherId)
      if (!other) continue
      const label = (e.label || e.type || 'related').replace(/_/g, ' ')
      const key = `${otherId}::${label}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({
        otherId,
        otherLabel: other.label || otherId,
        otherType: other.type,
        otherColor: other.color || getNodeColor(other),
        relation: label,
        lastMentioned: lastMentionedMap.get(otherId) || null,
      })
    }
    // Stable ordering: `you` first (most important context), then by
    // other-node label so the list feels alphabetical rather than
    // insertion-order random.
    out.sort((a, b) => {
      if (a.otherId === 'you' && b.otherId !== 'you') return -1
      if (b.otherId === 'you' && a.otherId !== 'you') return 1
      return a.otherLabel.localeCompare(b.otherLabel)
    })
    return out
  }, [selectedNode, rawEdges, nodesById, lastMentionedMap])

  // Panel view: People / Organizations / Places / Topics buckets in fixed
  // order ("you" pulled out on top).
  const groupedConnections = useMemo(
    () => groupConnections(selectedConnections),
    [selectedConnections]
  )

  // Overlay content shown inside the always-mounted container
  const overlay = loading ? (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent-indigo)] border-t-transparent rounded-full animate-spin" />
    </div>
  ) : error ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <p className="text-[var(--text-secondary)] text-sm mb-3">Failed to load your world graph.</p>
      <button
        onClick={refetch}
        className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Retry
      </button>
    </div>
  ) : nodes.length <= 1 ? (
    <div className="absolute inset-0 flex items-center justify-center">
      <EmptyState
        icon="🌐"
        message="Your world graph is empty."
        submessage="Start chatting to build your network of people, places, and topics."
        ctaLabel="Go to Chat"
        ctaPath="/vault/chat"
      />
    </div>
  ) : null

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader title="Your World" subtitle="Your life, visualized" />
        <TabHint tab="world" count={nodes.length > 1 ? nodes.length : 0} />
      </div>
      {/* Controls row: search + node-filter chips */}
      {hasGraph && (
        <div className="px-6 mt-1 flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearchSubmit} className="relative" data-testid="world-search">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your world…"
                data-testid="world-search-input"
                className="w-56 px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-active)]"
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--bg-tertiary)] text-[var(--text-primary)] flex items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <Search size={12} /> Search
              </button>
            </div>
            {searchMatches.length > 0 && (
              <ul
                data-testid="world-search-results"
                className="absolute z-20 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl"
              >
                {searchMatches.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleSearchSelect(n)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: n.color || getNodeColor(n) }}
                        aria-hidden="true"
                      />
                      <span className="text-[var(--text-primary)] truncate flex-1">{n.label}</span>
                      <span className="text-[var(--text-tertiary)] text-[10px] capitalize flex-shrink-0">{n.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
          <div className="flex gap-1" data-testid="world-node-filter">
            {NODE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setNodeFilter(f.value)}
                data-filter={f.value}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  nodeFilter === f.value
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Legend — only visible when graph is shown. Topic swatch hidden
          under "Entities only" since no topic nodes are in the view. */}
      {hasGraph && (
        <div className="px-6 mt-2 flex gap-4 text-[10px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" /> You</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" /> Person</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" /> Organization</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]" /> Place</span>
          {nodeFilter === 'all' && (
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" /> Topic</span>
          )}
        </div>
      )}
      {/* Container is ALWAYS mounted so ResizeObserver can measure it */}
      <div ref={containerRef} className="flex-1 min-h-0 relative">
        {overlay}
        {hasGraph && dimensions && (
          <ForceGraph
            nodes={nodes}
            edges={edges}
            width={dimensions.width}
            height={dimensions.height}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            highlightDistances={highlightDistances}
          />
        )}
      </div>
      {/* World-specific details panel — no backdrop dim, mobile bottom-sheet.
          The graph stays visible + interactive behind the panel so the
          user can see the highlighted subgraph while reading node detail
          and click another node to re-anchor the highlight. */}
      <WorldNodePanel open={!!selectedNode} onClose={() => setSelectedNode(null)} title={selectedNode?.label || 'Details'}>
        {selectedNode && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <span className="text-[var(--text-secondary)] text-xs capitalize">{selectedNode.type}</span>
            </div>
            <div className="text-[var(--text-primary)] text-lg font-semibold mb-2">{selectedNode.label}</div>
            {selectedNode.status && (
              <div className="text-[var(--text-tertiary)] text-sm mb-3">Status: {selectedNode.status}</div>
            )}

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]" data-testid="world-node-connections">
              <div className="text-[var(--text-secondary)] text-xs uppercase tracking-wide mb-2">
                Connections{selectedConnections.length > 0 ? ` (${selectedConnections.length})` : ''}
              </div>
              {selectedConnections.length === 0 ? (
                <div className="text-[var(--text-tertiary)] text-sm italic">
                  No connections recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* "you" edge first — most important context, not a bucket */}
                  {groupedConnections.youConnection && (
                    <div className="flex items-start gap-2 text-sm px-1.5">
                      <span
                        className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-[#fbbf24]"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[var(--text-primary)]">You</div>
                        <div className="text-[var(--text-tertiary)] text-xs">{groupedConnections.youConnection.relation}</div>
                      </div>
                    </div>
                  )}
                  {groupedConnections.groups.map((g) => (
                    <div key={g.name} data-testid={`world-connection-group-${g.name.toLowerCase()}`}>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                        {g.name} ({g.items.length})
                      </div>
                      <ul className="space-y-0.5">
                        {g.items.map((c) => (
                          <li key={`${c.otherId}-${c.relation}`}>
                            {/* Clicking re-anchors selection on this node */}
                            <button
                              type="button"
                              onClick={() => handleConnectionClick(c.otherId)}
                              className="w-full flex items-start gap-2 text-sm text-left px-1.5 py-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                              <span
                                className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: c.otherColor || 'var(--text-tertiary)' }}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[var(--text-primary)] truncate">{c.otherLabel}</span>
                                <span className="block text-[var(--text-tertiary)] text-xs">
                                  {c.relation}
                                  {c.lastMentioned ? ` · ${timeAgo(c.lastMentioned)}` : ''}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </WorldNodePanel>
    </div>
  )
}
