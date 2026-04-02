// src/components/vault/world/ForceGraph.jsx
import { useRef, useEffect } from 'react'
import { select } from 'd3-selection'
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceLink } from 'd3-force'
import { drag as d3Drag } from 'd3-drag'

const TYPE_COLORS = {
  you: '#fbbf24',
  person: '#60a5fa',
  org: '#34d399',
  organization: '#34d399',
  location: '#fb923c',
  place: '#fb923c',
  other: '#c084fc',
}

const TOPIC_STATUS_COLORS = {
  active: '#6366f1',
  dormant: '#8b95a8',
  resolved: '#34d399',
}

function getNodeColor(node) {
  if (node.id === 'you') return TYPE_COLORS.you
  if (node.type === 'topic') return TOPIC_STATUS_COLORS[node.status] || '#6366f1'
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

export default function ForceGraph({ nodes, edges, onNodeClick, width, height }) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)

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
      .force('collision', forceCollide().radius(d => d.radius + 6))
      .force('link', forceLink(edgeData)
        .id(d => d.id)
        .distance(d => d.source.id === 'you' || d.target.id === 'you' ? 150 : 60)
        .strength(d => d.strength || 0.3)
      )
      .alphaDecay(0.015)

    simulationRef.current = simulation

    // Draw edges
    const link = g.append('g')
      .selectAll('line')
      .data(edgeData)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.15)')
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

    // Draw labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodeData)
      .join('text')
      .text(d => truncateLabel(d.label))
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 14)
      .attr('fill', '#ffffff')
      .attr('font-size', d => d.id === 'you' ? '12px' : '10px')
      .attr('font-weight', d => d.id === 'you' ? '600' : '400')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8), 0 0px 6px rgba(0,0,0,0.5)')

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
  }, [nodes, edges, width, height, onNodeClick])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block', background: 'transparent' }}
    />
  )
}
