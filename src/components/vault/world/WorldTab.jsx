// src/components/vault/world/WorldTab.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import WorldNodePanel from './WorldNodePanel'
import ForceGraph from './ForceGraph'
import { useVaultData } from '../../../lib/vault-cache'
import { getWorld } from '../../../lib/api/vault-world'
import { bfsDistances } from '../../../lib/graph-highlight'

const NODE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'entities', label: 'Entities only' },
]

export default function WorldTab() {
  const { data: worldData, loading, error, refetch } = useVaultData('world', getWorld)
  const [selectedNode, setSelectedNode] = useState(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState(null)

  // Responsive sizing — wait for real measurements before rendering graph
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Get initial size immediately
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
  }, [])

  const handleNodeClick = useCallback((node) => {
    if (node.id === 'you') return
    setSelectedNode(node)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const [nodeFilter, setNodeFilter] = useState('all')
  const rawNodes = worldData?.nodes || []
  const rawEdges = worldData?.edges || []

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

  // BFS distance map from the selected node — drives node + edge + label
  // opacity in ForceGraph. Null means "no highlight active": everything
  // renders at full brightness. Uses raw edges (id strings) so the walk
  // survives d3's mutation of edge.source / edge.target into node objects.
  const highlightDistances = useMemo(() => {
    if (!selectedNode) return null
    return bfsDistances(selectedNode.id, rawEdges)
  }, [selectedNode, rawEdges])

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
      </div>
      {/* Node filter — chip strip matching FilterBar / TopicFilters pattern. */}
      {hasGraph && (
        <div className="px-6 mt-1 flex gap-1" data-testid="world-node-filter">
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
            {selectedNode.relationship && (
              <div className="text-[var(--text-tertiary)] text-sm mb-2">Relationship: {selectedNode.relationship}</div>
            )}
            {selectedNode.status && (
              <div className="text-[var(--text-tertiary)] text-sm">Status: {selectedNode.status}</div>
            )}
          </div>
        )}
      </WorldNodePanel>
    </div>
  )
}
