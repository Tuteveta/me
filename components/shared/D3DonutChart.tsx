'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface DonutSlice {
  label: string
  value: number
  color: string
}

interface Props {
  data: DonutSlice[]
  size?: number
  centerLabel?: string
  centerValue?: string | number
}

export default function D3DonutChart({ data, size = 160, centerLabel, centerValue }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const r = size / 2
    const outerR = r - 6
    const innerR = outerR * 0.58

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', size).attr('height', size)

    const g = svg.append('g').attr('transform', `translate(${r},${r})`)

    const pie = d3.pie<DonutSlice>().value(d => d.value).sort(null).padAngle(0.025)
    const arc = d3.arc<d3.PieArcDatum<DonutSlice>>().innerRadius(innerR).outerRadius(outerR).cornerRadius(3)

    const arcs = g.selectAll('path').data(pie(data)).enter().append('g')

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)

    // Center text
    if (centerValue !== undefined) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.1em')
        .attr('font-size', '18px')
        .attr('font-weight', '900')
        .attr('fill', '#111827')
        .text(String(centerValue))
    }
    if (centerLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', centerValue !== undefined ? '1.2em' : '0.4em')
        .attr('font-size', '10px')
        .attr('fill', '#9CA3AF')
        .text(centerLabel)
    }
  }, [data, size, centerLabel, centerValue])

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg ref={svgRef} />
      {/* Legend */}
      <ul className="space-y-1.5">
        {data.map(d => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-gray-600">{d.label}</span>
            <span className="text-xs font-bold text-gray-900 ml-auto">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
