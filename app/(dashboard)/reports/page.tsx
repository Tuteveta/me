'use client'

import { useState } from 'react'
import { useQuarterlyReport } from '@/lib/quarterly-report-context'
import { useBudgetPlan } from '@/lib/budget-plan-context'
import { useAuth } from '@/lib/auth-context'
import { exportCSV } from '@/lib/utils'
import type { ReportStatus } from '@/types'
import { Download, FileText, CheckCircle, Clock, AlertCircle, Wallet } from 'lucide-react'

type DisplayReport = {
  id: string
  title: string
  type: 'quarterly' | 'budget-plan'
  wing: string
  division: string
  branch: string
  fiscalYear: string
  status: ReportStatus
  submittedBy: string
  submittedAt?: string
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; badge: string; icon: React.ElementType }> = {
  approved:  { label: 'Reviewed',  badge: 'bg-emerald-50 text-emerald-700', icon: CheckCircle  },
  submitted: { label: 'Submitted', badge: 'bg-blue-50 text-blue-700',       icon: FileText     },
  pending:   { label: 'Draft',     badge: 'bg-amber-50 text-amber-700',     icon: Clock        },
  overdue:   { label: 'Overdue',   badge: 'bg-red-50 text-red-700',         icon: AlertCircle  },
}

type TypeFilter = 'All' | 'quarterly' | 'budget-plan'

export default function ReportsPage() {
  const { reports: qrReports } = useQuarterlyReport()
  const { plans }              = useBudgetPlan()
  const { user }               = useAuth()

  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('All')

  const isExecutive = ['executive', 'deputy', 'dcs', 'super'].includes(user?.role ?? '')

  const qrDisplay: DisplayReport[] = qrReports
    .filter(r => isExecutive || r.createdBy === user?.name)
    .map(r => ({
      id: r.id, title: r.title, type: 'quarterly' as const,
      wing: r.wing, division: r.division, branch: r.branch, fiscalYear: r.fiscalYear,
      status: r.status === 'reviewed' ? 'approved' : r.status === 'submitted' ? 'submitted' : 'pending',
      submittedBy: r.createdBy, submittedAt: r.submittedAt,
    }))

  const bpDisplay: DisplayReport[] = plans
    .filter(p => isExecutive || p.createdBy === user?.name)
    .map(p => ({
      id: p.id, title: p.title, type: 'budget-plan' as const,
      wing: p.wing, division: p.division, branch: p.branch, fiscalYear: p.fiscalYear,
      status: p.status === 'reviewed' ? 'approved' : p.status === 'submitted' ? 'submitted' : 'pending',
      submittedBy: p.createdBy, submittedAt: p.submittedAt,
    }))

  const allReports = [...qrDisplay, ...bpDisplay]

  const filtered = allReports
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r => typeFilter   === 'All' || r.type   === typeFilter)

  const counts: Record<ReportStatus, number> = {
    approved:  allReports.filter(r => r.status === 'approved').length,
    submitted: allReports.filter(r => r.status === 'submitted').length,
    pending:   allReports.filter(r => r.status === 'pending').length,
    overdue:   0,
  }

  function handleExport() {
    exportCSV(filtered.map(r => ({
      'Title':        r.title,
      'Type':         r.type === 'quarterly' ? 'Quarterly Report' : 'Budget Plan',
      'Wing':         r.wing,
      'Division':     r.division,
      'Branch':       r.branch,
      'Fiscal Year':  r.fiscalYear,
      'Status':       STATUS_CONFIG[r.status].label,
      'Submitted By': r.submittedBy,
      'Date':         r.submittedAt ?? '—',
    })), 'DICT-Reports')
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {allReports.length} report{allReports.length !== 1 ? 's' : ''} — Quarterly &amp; Budget Plans
          </p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(counts) as [ReportStatus, number][]).map(([s, count]) => {
          const cfg = STATUS_CONFIG[s]
          const Icon = cfg.icon
          return (
            <button key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`bg-white border rounded p-4 text-left transition-colors hover:border-blue-200 ${
                statusFilter === s ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${
                  s === 'approved' ? 'text-emerald-600' : s === 'submitted' ? 'text-blue-600' :
                  s === 'pending'  ? 'text-amber-600'  : 'text-red-600'
                }`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{count}</span>
              </div>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'quarterly', 'budget-plan'] as TypeFilter[]).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              typeFilter === t ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {t === 'All' ? 'All Types' : t === 'quarterly' ? 'Quarterly Reports' : 'Budget Plans'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 640 }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Division</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Fiscal Year</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden lg:table-cell">Submitted By</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Date</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const cfg  = STATUS_CONFIG[r.status]
                const Icon = cfg.icon
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.type === 'quarterly'
                          ? <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          : <Wallet   className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        }
                        <span className="font-medium text-gray-900 max-w-48 truncate">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">
                      {r.type === 'quarterly' ? 'Quarterly Report' : 'Budget Plan'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-36 truncate">{r.division}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden md:table-cell">{r.fiscalYear}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">{r.submittedBy}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">{r.submittedAt ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            {allReports.length === 0
              ? 'No reports yet. Create a Quarterly Report or Budget Plan to get started.'
              : 'No reports match your filter.'}
          </div>
        )}
      </div>
    </div>
  )
}
