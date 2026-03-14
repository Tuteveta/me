'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface BarGroup {
  label: string
  values: { name: string; value: number; color: string }[]
}

interface Props {
  groups: BarGroup[]
  height?: number
  yLabel?: string
  formatValue?: (v: number) => string
}

export default function D3BarChart({ groups, height = 220, yLabel, formatValue }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !groups.length) return

    const width = containerRef.current.clientWidth
    const margin = { top: 12, right: 16, bottom: 48, left: yLabel ? 52 : 44 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const seriesNames = groups[0].values.map(v => v.name)
    const allValues = groups.flatMap(g => g.values.map(v => v.value))
    const yMax = d3.max(allValues) ?? 100

    const x0 = d3.scaleBand().domain(groups.map(g => g.label)).range([0, innerW]).padding(0.28)
    const x1 = d3.scaleBand().domain(seriesNames).range([0, x0.bandwidth()]).padding(0.08)
    const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerH, 0]).nice()

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#F3F4F6')
    g.select('.domain').remove()

    // Bars
    groups.forEach(grp => {
      const grpG = g.append('g').attr('transform', `translate(${x0(grp.label)},0)`)
      grp.values.forEach(v => {
        grpG.append('rect')
          .attr('x', x1(v.name)!)
          .attr('y', yScale(v.value))
          .attr('width', x1.bandwidth())
          .attr('height', innerH - yScale(v.value))
          .attr('rx', 2)
          .attr('fill', v.color)
      })
    })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', '#E5E7EB'))
      .selectAll('text')
      .attr('fill', '#6B7280').attr('font-size', '10px').attr('dy', '1.2em')
      .call(t => {
        t.each(function() {
          const el = d3.select(this)
          const words = (el.text() as string).split(' ')
          if (words.length > 2) {
            el.text(words.slice(0, 2).join(' ') + '…')
          }
        })
      })

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(0)
        .tickFormat(v => formatValue ? formatValue(+v) : String(v)))
      .call(ax => ax.select('.domain').attr('stroke', '#E5E7EB'))
      .selectAll('text')
      .attr('fill', '#9CA3AF').attr('font-size', '10px').attr('dx', '-0.3em')

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40).attr('x', -innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF').attr('font-size', '10px')
        .text(yLabel)
    }

    // Legend
    if (seriesNames.length > 1) {
      const colors = groups[0].values.map(v => ({ name: v.name, color: v.color }))
      const legend = svg.append('g').attr('transform', `translate(${margin.left},${height - 6})`)
      colors.forEach((c, i) => {
        legend.append('rect').attr('x', i * 90).attr('y', 0).attr('width', 10).attr('height', 8).attr('rx', 2).attr('fill', c.color)
        legend.append('text').attr('x', i * 90 + 14).attr('y', 7).attr('fill', '#6B7280').attr('font-size', '10px').text(c.name)
      })
    }
  }, [groups, height, yLabel, formatValue])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} />
    </div>
  )
}
