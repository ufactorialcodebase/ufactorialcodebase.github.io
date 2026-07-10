// src/components/vault/world/ForceGraph.jsx
import { useRef, useEffect } from 'react'
import { select } from 'd3-selection'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceLink, forceX, forceY } from 'd3-force'
import { drag as d3Drag } from 'd3-drag'
import { glowTierForDistance, GLOW_TIERS, GLOW_COLOR } from '../../../lib/graph-highlight'
import { computeNodeRadius } from '../../../lib/graph-node-size'

const TYPE_COLORS = {
  you: '#fbbf24',
  person: '#60a5fa',
  org: '#34d399',
  organization: '#34d399',
  location: '#fb923c',
  place: '#fb923c',
  other: '#c084fc',
}

function getNodeColor(node) {
  if (node.id === 'you') return TYPE_COLORS.you
  if (node.type === 'topic') return '#c084fc'
  return TYPE_COLORS[node.type] || TYPE_COLORS.other
}

function truncateLabel(label, max = 12) {
  if (!label) return ''
  return label.length > max ? label.slice(0, max) + '...' : label
}

export default function ForceGraph({ nodes, edges, onNodeClick, width, height, highlightDistances = null, onBackgroundClick }) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !nodes.length || !width || !height) return

    // Deep copy data so D3 mutations don't affect React state. Radius is
    // computed via the (feature-flagged) node-size module — 'frequency'
    // mode scales by mention_count, 'fixed' reverts to pre-batch-2 defaults.
    const nodeData = nodes.map(n => ({
      ...n,
      radius: computeNodeRadius(n),
      color: getNodeColor(n),
      ...(n.id === 'you' ? { fx: width / 2, fy: height / 2 } : {}),
    }))

    const edgeData = edges.map(e => ({
      source: e.source,
      target: e.target,
      strength: e.strength || 0.3,
    }))

    // Clear previous SVG content
    const svg = select(svgRef.current)
    svg.selectAll('*').remove()

    // ── SVG <defs> with drop-shadow glow filters, one per highlight tier.
    // Tier 0 = clicked node (brightest, largest halo); tier 3 = 3° neighbour
    // (subtle). No opacity or dimming anywhere — non-highlighted nodes just
    // render without a filter so the rest of the graph stays fully legible.
    const defs = svg.append('defs')
    GLOW_TIERS.forEach((tier) => {
      const filter = defs.append('filter')
        .attr('id', tier.id)
        .attr('x', '-100%').attr('y', '-100%')
        .attr('width', '300%').attr('height', '300%')
      filter.append('feDropShadow')
        .attr('dx', 0).attr('dy', 0)
        .attr('stdDeviation', tier.stdDeviation)
        .attr('flood-color', GLOW_COLOR)
        .attr('flood-opacity', tier.floodOpacity)
    })

    // Root group for zoom/pan
    const g = svg.append('g')

    const zoom = d3Zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => { g.attr('transform', event.transform) })
    svg.call(zoom)

    // Force simulation
    const simulation = forceSimulation(nodeData)
      .force('charge', forceManyBody().strength(d => d.id === 'you' ? -300 : -100))
      .force('center', forceCenter(width / 2, height / 2).strength(0.03))
      // ISS-102: forceCenter alone lets orphan topics drift off-canvas.
      .force('x', forceX(width / 2).strength(0.06))
      .force('y', forceY(height / 2).strength(0.06))
      .force('collision', forceCollide().radius(d => d.radius + 6))
      .force('link', forceLink(edgeData)
        .id(d => d.id)
        .distance(d => d.source.id === 'you' || d.target.id === 'you' ? 150 : 60)
        .strength(d => d.strength || 0.3)
      )
      .alphaDecay(0.015)

    simulationRef.current = simulation

    // Draw edges. Stroke-width is FIXED at 1 — user feedback: the
    // Item-8 strength-scaled width didn't read well. Kept the tie-
    // strength-derived stroke-opacity so heavier ties still stand out
    // subtly, but width is uniform.
    const link = g.append('g')
      .selectAll('line')
      .data(edgeData)
      .join('line')
      .style('stroke', 'var(--graph-edge-color, rgba(255,255,255,0.15))')
      .attr('data-strength', d => d.strength)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', d => Math.min(d.strength * 2, 0.6))

    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodeData)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('cursor', d => d.id === 'you' ? 'default' : 'pointer')
      .attr('stroke', 'rgba(0,0,0,0.3)')
      .attr('stroke-width', 1)
      .attr('data-node-type', d => d.id === 'you' ? 'you' : (d.type || 'other'))
      .attr('data-mention-count', d => d.mention_count ?? null)

    // Draw labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodeData)
      .join('text')
      .text(d => truncateLabel(d.label))
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 14)
      .style('fill', 'var(--graph-label-color, #ffffff)')
      .attr('font-size', d => d.id === 'you' ? '12px' : '10px')
      .attr('font-weight', d => d.id === 'you' ? '600' : '400')
      .attr('pointer-events', 'none')
      .style('text-shadow', 'var(--graph-label-shadow, 0 1px 3px rgba(0,0,0,0.8), 0 0px 6px rgba(0,0,0,0.5))')

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    // Drag
    const drag = d3Drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x; d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        if (d.id !== 'you') { d.fx = null; d.fy = null }
      })
    node.call(drag)

    // Click handlers
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (d.id !== 'you' && onNodeClick) onNodeClick(d)
    })
    svg.on('click', (event) => {
      if (event.target === svgRef.current && onBackgroundClick) onBackgroundClick()
    })

    // Hover — radius bump only. Full label on hover regardless.
    node
      .on('mouseenter', function (event, d) {
        select(this).transition().duration(150).attr('r', d.radius + 3)
        label.filter(l => l.id === d.id).text(d.label)
      })
      .on('mouseleave', function (event, d) {
        select(this).transition().duration(150).attr('r', d.radius)
        label.filter(l => l.id === d.id).text(truncateLabel(d.label))
      })

    return () => {
      simulation.stop()
      simulationRef.current = null
      svg.selectAll('*').remove()
    }
  }, [nodes, edges, width, height, onNodeClick, onBackgroundClick])

  // Highlight effect — glow-based, not opacity. Applies a drop-shadow
  // <filter> to nodes within the highlight radius (tier by distance);
  // everything else keeps its default appearance (no dim, no fade).
  useEffect(() => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)

    svg.selectAll('circle')
      .attr('filter', function (d) {
        // "you" is always visible in its native color — no glow even on click
        // (though onNodeClick guards against clicking "you" anyway).
        if (!d || d.id === 'you') return null
        const tier = glowTierForDistance(highlightDistances, d.id)
        return tier === null ? null : `url(#${GLOW_TIERS[tier].id})`
      })
  }, [highlightDistances])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block', background: 'transparent' }}
    />
  )
}
