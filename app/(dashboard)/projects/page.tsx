'use client'

import { useState } from 'react'
import { PROJECTS } from '@/lib/mock-data/me-data'
import type { ProjectStatus } from '@/types'
import { Calendar, DollarSign, Users, LayoutGrid, List, ChevronRight } from 'lucide-react'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; badge: string; dot: string }> = {
  active:    { label: 'Active',    badge: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  delayed:   { label: 'Delayed',   badge: 'bg-red-50 text-red-700',      dot: 'bg-red-500' },
  'on-hold': { label: 'On Hold',   badge: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
  planned:   { label: 'Planned',   badge: 'bg-purple-50 text-purple-700',dot: 'bg-purple-500' },
}

const FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Active',    value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Delayed',   value: 'delayed' },
  { label: 'Planned',   value: 'planned' },
]

function fmt(n: number) {
  if (n >= 1_000_000) return `K${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `K${(n / 1_000).toFixed(0)}K`
  return `K${n}`
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')

  const filtered = PROJECTS
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.program.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">Projects &amp; Programs</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {PROJECTS.length} projects shown</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded px-3 py-1.5 text-xs w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {/* View toggle */}
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded border transition-colors ${view === 'grid' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded border transition-colors ${view === 'list' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-[10px]">
              ({f.value === 'all' ? PROJECTS.length : PROJECTS.filter(p => p.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => {
            const cfg = STATUS_CONFIG[p.status]
            const budgetPct = Math.round((p.spent / p.budget) * 100)
            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-sm p-4 hover:border-blue-200 transition-colors">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    {p.program}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Completion</span>
                    <span className="font-bold text-gray-900">{p.completion}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.completion}%`,
                        background: p.status === 'delayed' ? '#EF4444' : p.status === 'completed' ? '#10B981' : '#3B82F6',
                      }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <DollarSign className="w-3 h-3" />
                    <span>{fmt(p.budget)}</span>
                    <span className="text-gray-400">({budgetPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{p.beneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
                    <Calendar className="w-3 h-3" />
                    <span>{p.startDate} → {p.endDate}</span>
                  </div>
                </div>

                {/* Milestones */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Milestones</p>
                  <ul className="space-y-1">
                    {p.milestones.map(m => (
                      <li key={m.id} className="flex items-center gap-2 text-[11px]">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.completed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className={m.completed ? 'text-gray-400 line-through' : 'text-gray-600'}>{m.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-150">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Project</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Program</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Completion</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Budget</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Due</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cfg = STATUS_CONFIG[p.status]
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 truncate max-w-50">{p.name}</p>
                        <p className="text-gray-400 text-[10px]">Lead: {p.lead}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">{p.program}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.completion}%` }} />
                          </div>
                          <span className="text-gray-700 font-bold w-8 text-right">{p.completion}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap hidden md:table-cell">{fmt(p.budget)}</td>
                      <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap hidden md:table-cell">{p.endDate}</td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-sm py-16 text-center">
          <p className="text-gray-400 text-sm">No projects match your filter.</p>
        </div>
      )}
    </div>
  )
}
