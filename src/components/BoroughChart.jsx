import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function getFit(rent, budget, commuteOrigin, nLat, nLng) {
  const miles = getDistance(commuteOrigin.lat, commuteOrigin.lng, nLat, nLng)
  if (rent <= budget && miles <= 5) return 'strong'
  if (rent <= budget) return 'partial'
  return 'over'
}

const BOROUGH_COLORS = {
  Manhattan: '#378ADD',
  Brooklyn: '#D85A30',
  Queens: '#1D9E75',
  Bronx: '#7F77DD'
}

export default function BoroughChart({ neighborhoods, commuteOrigin, budget, bedroom }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!neighborhoods.length || !commuteOrigin) return

    const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx']
    const data = boroughs.map(b => ({
      borough: b,
      count: neighborhoods
        .filter(n => n.borough === b && getFit(n[bedroom], budget, commuteOrigin, n.lat, n.lng) === 'strong')
        .reduce((s, n) => s + n.listings, 0)
    }))

    const W = svgRef.current.parentElement.clientWidth - 32
    const H = 130
    const marginLeft = 70
    const marginRight = 16
    const marginTop = 8
    const marginBottom = 8

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    const max = d3.max(data, d => d.count) || 1
    const x = d3.scaleLinear().domain([0, max]).range([0, W - marginLeft - marginRight])
    const y = d3.scaleBand().domain(boroughs).range([marginTop, H - marginBottom]).padding(0.25)

    const g = svg.append('g').attr('transform', `translate(${marginLeft},0)`)

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('y', d => y(d.borough))
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => BOROUGH_COLORS[d.borough])
      .attr('opacity', 0.85)
      .attr('width', 0)
      .transition().duration(500)
      .attr('width', d => x(d.count))

    g.selectAll('.count')
      .data(data)
      .join('text')
      .attr('class', 'count')
      .attr('x', d => x(d.count) + 6)
      .attr('y', d => y(d.borough) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'central')
      .attr('fill', '#B5D4F4')
      .attr('font-size', '11px')
      .text(d => d.count)

    svg.selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', marginLeft - 8)
      .attr('y', d => y(d.borough) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'central')
      .attr('text-anchor', 'end')
      .attr('fill', '#5580A0')
      .attr('font-size', '11px')
      .text(d => d.borough)

  }, [neighborhoods, commuteOrigin, budget, bedroom])

  return (
    <div style={{
      borderTop: '1px solid #1a2a3a',
      padding: '8px 16px',
      background: '#0a1520'
    }}>
      <div style={{
        fontSize: '10px', color: '#5580A0',
        letterSpacing: '0.5px', marginBottom: '6px'
      }}>
        LISTINGS BY BOROUGH — matching your constraints
      </div>
      <svg ref={svgRef} />
    </div>
  )
}