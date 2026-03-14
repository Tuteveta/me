'use client'

import { useState } from 'react'
import { KPIS } from '@/lib/mock-data/me-data'
import type { KPIStatus, ProgramArea } from '@/types'
import D3LineChart from '@/components/shared/D3LineChart'
import type { KPI } from '@/types'
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react'

const STATUS_CONFIG: Record<KPIStatus, { label: string; badge: string; dot: string }> = {
  'on-track': { label: 'On Track',  badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  exceeded:   { label: 'Exceeded',  badge: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500' },
  'at-risk':  { label: 'At Risk',   badge: 'bg-amber-50 text-amber-700',     dot: 'bg-amber-500' },
  'off-track':{ label: 'Off Track', badge: 'bg-red-50 text-red-700',         dot: 'bg-red-500' },
}

const PROGRAMS: (ProgramArea | 'All')[] = [
  'All', 'Infrastructure', 'Digital Transformation', 'Capacity Building', 'eGovernment', 'Cybersecurity',
]

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus }
const TREND_COLORS = { up: 'text-emerald-600', down: 'text-red-500', stable: 'text-gray-400' }

function trafficLight(status: KPIStatus) {
  if (status === 'on-track' || status === 'exceeded') return '🟢'
  if (status === 'at-risk') return '🟡'
  return '🔴'
}

export default function KPIPage() {
  const [program, setProgram] = useState<ProgramArea | 'All'>('All')
  const [selected, setSelected] = useState<KPI | null>(null)

  const filtered = KPIS.filter(k => program === 'All' || k.program === program)

  const summary = {
    onTrack:  KPIS.filter(k => k.status === 'on-track' || k.status === 'exceeded').length,
    atRisk:   KPIS.filter(k => k.status === 'at-risk').length,
    offTrack: KPIS.filter(k => k.status === 'off-track').length,
  }

  return (
    <div className="space-y-4">

      {/* Header + summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">KPI Monitoring</h1>
          <p className="text-xs text-gray-400 mt-0.5">{KPIS.length} indicators tracked across 5 programme areas</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-semibold">{summary.onTrack} On Track</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-700 font-semibold">{summary.atRisk} At Risk</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-700 font-semibold">{summary.offTrack} Off Track</span>
          </div>
        </div>
      </div>

      {/* Program filter */}
      <div className="flex gap-2 flex-wrap">
        {PROGRAMS.map(p => (
          <button
            key={p}
            onClick={() => setProgram(p)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              program === p
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-150">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Indicator</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Program</th>
                <th className="text-right px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Baseline</th>
                <th className="text-right px-4 py-3 text-gray-500 font-semibold">Target</th>
                <th className="text-right px-4 py-3 text-gray-500 font-semibold">Actual</th>
                <th className="text-right px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Progress</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Status</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const cfg = STATUS_CONFIG[k.status]
                const pct = Math.min(Math.round((k.actual / k.target) * 100), 100)
                const TrendIcon = TREND_ICONS[k.trend]
                return (
                  <tr
                    key={k.id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    onClick={() => setSelected(k)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{trafficLight(k.status)}</span>
                        <span className="font-medium text-gray-900">{k.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">{k.program}</td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                      {k.baseline} <span className="text-gray-400">{k.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">
                      {k.target} <span className="text-gray-400">{k.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {k.actual} <span className="text-gray-400 font-normal">{k.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: k.status === 'off-track' ? '#EF4444' : k.status === 'at-risk' ? '#F59E0B' : '#10B981',
                            }}
                          />
                        </div>
                        <span className="text-gray-600 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TrendIcon className={`w-3.5 h-3.5 mx-auto ${TREND_COLORS[k.trend]}`} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Detail slide-in */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-black/20 absolute inset-0" />
          <div
            className="relative bg-white border-l border-gray-200 w-full max-w-sm h-full overflow-y-auto p-6 z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[selected.status].badge}`}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
                <h2 className="text-sm font-bold text-gray-900 mt-2">{selected.name}</h2>
                <p className="text-xs text-gray-400">{selected.program}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Baseline', value: `${selected.baseline} ${selected.unit}`, color: '#6B7280' },
                { label: 'Target',   value: `${selected.target} ${selected.unit}`,   color: '#3B82F6' },
                { label: 'Actual',   value: `${selected.actual} ${selected.unit}`,   color: '#10B981' },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-[10px] text-gray-400">{m.label}</p>
                  <p className="text-sm font-black" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-1 text-xs text-gray-500 font-medium">12-Month Trend</div>
            <D3LineChart
              series={[
                {
                  name: 'Actual',
                  color: '#3B82F6',
                  data: selected.history.map(h => ({ x: h.month, y: h.value })),
                },
                {
                  name: 'Target',
                  color: '#E5E7EB',
                  data: selected.history.map(h => ({ x: h.month, y: h.target })),
                },
              ]}
              height={160}
              showArea={false}
            />

            <p className="text-[10px] text-gray-400 mt-3">Last updated: {selected.lastUpdated}</p>
          </div>
        </div>
      )}
    </div>
  )
}
