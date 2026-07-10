// src/components/vault/world/ForceGraph.jsx
import { useRef, useEffect } from 'react'
import { select } from 'd3-selection'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceLink, forceX, forceY } from 'd3-force'
import { drag as d3Drag } from 'd3-drag'
import { nodeOpacity, edgeOpacity } from '../../../lib/graph-highlight'

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

function getNodeRadius(node) {
  if (node.id === 'you') return 24
  if (node.type === 'topic') return 10
  return 12
}

function truncateLabel(label, max = 12) {
  if (!label) return ''
  return label.length > max ? label.slice(0, max) + '...' : label
}

export default function ForceGraph({ nodes, edges, onNodeClick, width, height, highlightDistances = null, onBackgroundClick }) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  // Ref so the highlight useEffect can walk each element and pull its base
  // opacity (the tie-strength-derived value from Item 8) without recomputing.
  const baseEdgeOpacityRef = useRef(new Map())

  useEffect(() => {
    if (!svgRef.current || !nodes.length || !width || !height) return

    // Deep copy data so D3 mutations don't affect React state
    const nodeData = nodes.map(n => ({
      ...n,
      radius: getNodeRadius(n),
      color: getNodeColor(n),
      // Pin "you" node at center
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

    // Root group for zoom/pan
    const g = svg.append('g')

    // Zoom behavior
    const zoom = d3Zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Force simulation
    const simulation = forceSimulation(nodeData)
      .force('charge', forceManyBody().strength(d => d.id === 'you' ? -300 : -100))
      .force('center', forceCenter(width / 2, height / 2).strength(0.03))
      // ISS-102: forceCenter only re-centers the centroid; it does not hold individual
      // nodes. Without forceX/forceY, disconnected ("orphan") topics with no edges get
      // pushed off-canvas by charge repulsion. These positional forces gently pull every
      // node toward center so nothing escapes the viewport.
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

    // Draw edges. Stroke color reads --graph-edge-color from the active theme so
    // warm mode gets a subtle warm-brown line (visible on cream) while dark mode
    // keeps its original white-on-navy gossamer. .style() (inline CSS) supports
    // var(); .attr() doesn't reliably.
    //
    // Tie strength → stroke-width: strength is a 0..1-ish weight (defaults 0.3,
    // higher = stronger relationship / more mentions). Scaling stroke-width by
    // strength lets the heavy edges dominate visually without swamping the
    // canvas. Clamped [0.5, 5] so a stray very-weak edge still shows and a
    // very-strong one stays legible. `data-strength` mirrors the raw value for
    // playwright + a11y tools.
    const link = g.append('g')
      .selectAll('line')
      .data(edgeData)
      .join('line')
      .style('stroke', 'var(--graph-edge-color, rgba(255,255,255,0.15))')
      .attr('data-strength', d => d.strength)
      .attr('stroke-width', d => Math.max(0.5, Math.min(5, (d.strength || 0.3) * 4)))
      .attr('stroke-opacity', d => Math.min(d.strength * 2, 0.6))

    // Cache the tie-strength-derived base opacity so the highlight
    // effect can multiply against it without recomputing the strength ramp.
    const baseMap = baseEdgeOpacityRef.current
    baseMap.clear()
    edgeData.forEach((d, i) => baseMap.set(i, Math.min(d.strength * 2, 0.6)))

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
      // Node type surfaced for playwright + future data-attribute-based
      // filter tests. "you" carries its own literal type.
      .attr('data-node-type', d => d.id === 'you' ? 'you' : (d.type || 'other'))

    // Draw labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodeData)
      .join('text')
      .text(d => truncateLabel(d.label))
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 14)
      // Fill + text-shadow read from CSS vars so warm mode gets deep ink on
      // cream (no halo needed) while dark mode keeps its bright-on-navy halo
      // via the var() fallback. Uses .style() (not .attr()) so var() resolves.
      .style('fill', 'var(--graph-label-color, #ffffff)')
      .attr('font-size', d => d.id === 'you' ? '12px' : '10px')
      .attr('font-weight', d => d.id === 'you' ? '600' : '400')
      .attr('pointer-events', 'none')
      .style('text-shadow', 'var(--graph-label-shadow, 0 1px 3px rgba(0,0,0,0.8), 0 0px 6px rgba(0,0,0,0.5))')

    // Tick function
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

    // Drag behavior
    const drag = d3Drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        // Keep "you" pinned, release others
        if (d.id !== 'you') {
          d.fx = null
          d.fy = null
        }
      })

    node.call(drag)

    // Click handler
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (d.id !== 'you' && onNodeClick) {
        onNodeClick(d)
      }
    })

    // Click on the SVG background (empty canvas) clears the highlight.
    svg.on('click', (event) => {
      if (event.target === svgRef.current && onBackgroundClick) {
        onBackgroundClick()
      }
    })

    // Hover effects
    node
      .on('mouseenter', function (event, d) {
        select(this)
          .transition()
          .duration(150)
          .attr('r', d.radius + 3)

        // Show full label on hover
        label
          .filter(l => l.id === d.id)
          .text(d.label)
      })
      .on('mouseleave', function (event, d) {
        select(this)
          .transition()
          .duration(150)
          .attr('r', d.radius)

        // Restore truncated label
        label
          .filter(l => l.id === d.id)
          .text(truncateLabel(d.label))
      })

    // Cleanup
    return () => {
      simulation.stop()
      simulationRef.current = null
      svg.selectAll('*').remove()
    }
  }, [nodes, edges, width, height, onNodeClick, onBackgroundClick])

  // Highlight effect — runs independently of the sim rebuild so clicking a
  // node doesn't tear down and re-force the graph. Walks the live SVG and
  // updates opacity on nodes / edges / labels with a short transition.
  // When highlightDistances is null (no active highlight), everything
  // returns to full brightness.
  useEffect(() => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)

    svg.selectAll('circle')
      .transition().duration(180)
      .attr('opacity', d => nodeOpacity(highlightDistances, d.id))

    const baseMap = baseEdgeOpacityRef.current
    svg.selectAll('line')
      .transition().duration(180)
      .attr('stroke-opacity', (d, i) => {
        const sourceId = d.source && (d.source.id ?? d.source)
        const targetId = d.target && (d.target.id ?? d.target)
        const base = baseMap.get(i) ?? Math.min((d.strength || 0.3) * 2, 0.6)
        return edgeOpacity(highlightDistances, sourceId, targetId, base)
      })

    svg.selectAll('text')
      .transition().duration(180)
      .attr('opacity', d => nodeOpacity(highlightDistances, d.id))
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
