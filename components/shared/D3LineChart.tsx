'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface LineSeries {
  name: string
  data: { x: string; y: number }[]
  color: string
}

interface Props {
  series: LineSeries[]
  height?: number
  yLabel?: string
  showArea?: boolean
}

export default function D3LineChart({ series, height = 200, yLabel, showArea = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !series.length) return

    const width = containerRef.current.clientWidth
    const margin = { top: 12, right: 16, bottom: 32, left: yLabel ? 48 : 40 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const allPts = series.flatMap(s => s.data)
    const xDomain = series[0].data.map(d => d.x)

    const xScale = d3.scalePoint().domain(xDomain).range([0, innerW]).padding(0.05)
    const yMax = d3.max(allPts, d => d.y) ?? 100
    const yScale = d3.scaleLinear().domain([0, yMax * 1.12]).range([innerH, 0]).nice()

    // Horizontal grid lines
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#F3F4F6')
      .attr('stroke-dasharray', '0')
    g.select('.domain').remove()

    // X axis
    const xTick = xDomain.length > 8
      ? xDomain.filter((_, i) => i % 2 === 0 || i === xDomain.length - 1)
      : xDomain

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickValues(xTick).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', '#E5E7EB'))
      .selectAll('text')
      .attr('fill', '#9CA3AF').attr('font-size', '10px').attr('dy', '1.2em')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', '#E5E7EB'))
      .selectAll('text')
      .attr('fill', '#9CA3AF').attr('font-size', '10px').attr('dx', '-0.4em')

    // Y label
    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -38).attr('x', -innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF').attr('font-size', '10px')
        .text(yLabel)
    }

    // Area + line per series
    series.forEach(s => {
      const gradId = `grad-${s.name.replace(/\W/g, '')}`
      const defs = svg.append('defs')
      const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
      grad.append('stop').attr('offset', '0%').attr('stop-color', s.color).attr('stop-opacity', 0.18)
      grad.append('stop').attr('offset', '100%').attr('stop-color', s.color).attr('stop-opacity', 0.01)

      if (showArea) {
        const area = d3.area<{ x: string; y: number }>()
          .x(d => xScale(d.x)!)
          .y0(innerH).y1(d => yScale(d.y))
          .curve(d3.curveCatmullRom.alpha(0.5))

        g.append('path').datum(s.data).attr('fill', `url(#${gradId})`).attr('d', area)
      }

      const line = d3.line<{ x: string; y: number }>()
        .x(d => xScale(d.x)!)
        .y(d => yScale(d.y))
        .curve(d3.curveCatmullRom.alpha(0.5))

      g.append('path').datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
        .attr('d', line)
    })

    // Legend (if multiple series)
    if (series.length > 1) {
      const legend = svg.append('g').attr('transform', `translate(${margin.left},${height - 6})`)
      series.forEach((s, i) => {
        const x = i * 100
        legend.append('rect').attr('x', x).attr('y', 0).attr('width', 10).attr('height', 2).attr('rx', 1).attr('fill', s.color)
        legend.append('text').attr('x', x + 14).attr('y', 3).attr('fill', '#6B7280').attr('font-size', '10px').text(s.name)
      })
    }
  }, [series, height, yLabel, showArea])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} />
    </div>
  )
}
