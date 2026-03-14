'use client'

import { useState } from 'react'
import { REPORTS } from '@/lib/mock-data/me-data'
import type { ReportStatus } from '@/types'
import { Download, FileText, AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react'

const STATUS_CONFIG: Record<ReportStatus, { label: string; badge: string; icon: React.ElementType }> = {
  approved:  { label: 'Approved',  badge: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  submitted: { label: 'Submitted', badge: 'bg-blue-50 text-blue-700',       icon: FileText },
  pending:   { label: 'Pending',   badge: 'bg-amber-50 text-amber-700',     icon: Clock },
  overdue:   { label: 'Overdue',   badge: 'bg-red-50 text-red-700',         icon: AlertCircle },
}

const TYPE_FILTERS = ['All', 'quarterly', 'monthly', 'annual', 'ad-hoc'] as const

export default function ReportsPage() {
  const [status, setStatus] = useState<ReportStatus | 'all'>('all')
  const [type, setType] = useState<typeof TYPE_FILTERS[number]>('All')

  const filtered = REPORTS
    .filter(r => status === 'all' || r.status === status)
    .filter(r => type === 'All' || r.type === type)

  const counts = {
    approved:  REPORTS.filter(r => r.status === 'approved').length,
    submitted: REPORTS.filter(r => r.status === 'submitted').length,
    pending:   REPORTS.filter(r => r.status === 'pending').length,
    overdue:   REPORTS.filter(r => r.status === 'overdue').length,
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-400 mt-0.5">{REPORTS.length} reports · FY 2024/25</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Submit Report
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(counts) as [ReportStatus, number][]).map(([s, count]) => {
          const cfg = STATUS_CONFIG[s]
          const StatusIcon = cfg.icon
          return (
            <button
              key={s}
              onClick={() => setStatus(status === s ? 'all' : s)}
              className={`bg-white border rounded-sm p-4 text-left transition-colors hover:border-blue-200 ${
                status === s ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <StatusIcon className={`w-4 h-4 ${
                  s === 'approved' ? 'text-emerald-600' :
                  s === 'submitted' ? 'text-blue-600' :
                  s === 'pending' ? 'text-amber-600' : 'text-red-600'
                }`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {count}
                </span>
              </div>
              <p className="text-xs text-gray-500 capitalize">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
              type === t
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Reports table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-gray-500 font-semibold">Report Title</th>
              <th className="text-left px-4 py-3 text-gray-500 font-semibold">Program</th>
              <th className="text-left px-4 py-3 text-gray-500 font-semibold">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-semibold">Period</th>
              <th className="text-left px-4 py-3 text-gray-500 font-semibold">Submitted By</th>
              <th className="text-left px-4 py-3 text-gray-500 font-semibold">Due Date</th>
              <th className="text-center px-4 py-3 text-gray-500 font-semibold">Status</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const cfg = STATUS_CONFIG[r.status]
              const StatusIcon = cfg.icon
              const isOverdue = r.status === 'overdue'
              return (
                <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/20' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 max-w-[240px] truncate">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.program}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize whitespace-nowrap">{r.type}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.period}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.submittedBy}</td>
                  <td className={`px-4 py-3 whitespace-nowrap ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {r.dueDate}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(r.status === 'approved' || r.status === 'submitted') && (
                      <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No reports match your filter.</div>
        )}
      </div>

      {/* Overdue notice */}
      {counts.overdue > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-sm p-4">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-800">
              {counts.overdue} report{counts.overdue > 1 ? 's are' : ' is'} overdue
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Programme officers must submit outstanding reports immediately to avoid compliance issues.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
