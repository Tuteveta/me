'use client'

import { useState } from 'react'
import { useQuarterlyReport } from '@/lib/quarterly-report-context'
import { useWorkplan } from '@/lib/workplan-context'
import { useAuth } from '@/lib/auth-context'
import { FUNCTIONAL_AREAS } from '@/lib/org-data'
import { exportCSV } from '@/lib/utils'
import type { QuarterLabel } from '@/types'
import {
  Download, CheckCircle2, Clock, TrendingUp,
  FileText, BarChart3,
} from 'lucide-react'

const QUARTERS: QuarterLabel[] = ['Q1', 'Q2', 'Q3', 'Q4']

const ALL_BRANCHES = FUNCTIONAL_AREAS.flatMap(fa =>
  fa.programs.flatMap(p =>
    p.activities.map(a => ({ wing: fa.title, division: p.title, branch: a.title }))
  )
)

// ── Tab 1: Annual KRA View (ToR §3.2.4) ──────────────────────────────────────
function AnnualKRAView() {
  const { workplans } = useWorkplan()
  const { user } = useAuth()
  const [yearFilter, setYearFilter] = useState('All')

  const isExecutive = ['executive', 'deputy', 'dcs', 'super'].includes(user?.role ?? '')
  const visible = isExecutive
    ? workplans.filter(w => w.status === 'approved' || w.status === 'active')
    : workplans.filter(w => (w.status === 'approved' || w.status === 'active') && w.createdBy === user?.name)

  const years = ['All', ...Array.from(new Set(visible.map(w => w.fiscalYear)))]
  const filtered = yearFilter === 'All' ? visible : visible.filter(w => w.fiscalYear === yearFilter)

  const rows = filtered.flatMap(wp =>
    wp.kras.map(kra => ({
      fiscalYear: wp.fiscalYear,
      division: wp.division,
      kra: kra.title,
      program: wp.strategicPriorityTitle ?? '',
      status: wp.status,
      activities: kra.description || '',
      kpis: kra.kpis.map(k => k.name).join('; '),
      expectedOutcomes: kra.kpis
        .map(k => k.annualTarget ? `${k.name}: ${k.annualTarget} ${k.unit}` : k.name)
        .join('; '),
      weight: kra.weight,
    }))
  )

  function handleExport() {
    exportCSV(rows.map(r => ({
      'Fiscal Year': r.fiscalYear,
      'Division': r.division,
      'KRA': r.kra,
      'Program / Project': r.program,
      'Status': r.status,
      'Description of Key Activities': r.activities,
      'KPIs': r.kpis,
      'Expected Outcomes': r.expectedOutcomes,
      'Weight (%)': r.weight,
    })), 'DICT-Annual-KRA-View')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Fiscal Years' : y}</option>)}
          </select>
          <span className="text-xs text-gray-400">{rows.length} KRA rows</span>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 rounded">
          <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No approved workplans found</p>
          <p className="text-xs text-gray-400 mt-1">Approved or active workplans with KRAs will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full text-xs border-collapse" style={{ minWidth: 960 }}>
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                {['Fiscal Year', 'Division', 'KRA', 'Program / Project', 'Status', 'Description of Key Activities', 'KPIs', 'Expected Outcomes', 'Weight (%)'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 last:border-r-0 whitespace-nowrap text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{r.fiscalYear}</td>
                  <td className="px-3 py-2 text-xs text-gray-700 max-w-36">{r.division}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-gray-900 max-w-44">{r.kra}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 max-w-36">{r.program || '—'}</td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'active'   ? 'bg-amber-50 text-amber-700' :
                      r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                'bg-gray-100 text-gray-600'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600 max-w-48">{r.activities || '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 max-w-48">{r.kpis || '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 max-w-48">{r.expectedOutcomes || '—'}</td>
                  <td className="px-3 py-2 text-xs text-center font-semibold text-gray-700">{r.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab 2: Quarterly Submissions ──────────────────────────────────────────────
function QuarterlySubmissions() {
  const { reports } = useQuarterlyReport()
  const { user } = useAuth()
  const [qFilter, setQFilter] = useState<QuarterLabel | 'All'>('All')
  const [wingFilter, setWingFilter] = useState('All')

  const isExecutive = ['executive', 'deputy', 'dcs', 'super'].includes(user?.role ?? '')
  const visible = isExecutive ? reports : reports.filter(r => r.createdBy === user?.name)
  const submitted = visible.filter(r => r.status === 'submitted' || r.status === 'reviewed')

  const wings = ['All', ...Array.from(new Set(submitted.map(r => r.wing)))]
  const filtered = submitted
    .filter(r => wingFilter === 'All' || r.wing === wingFilter)
    .filter(r => qFilter === 'All' || r.entries.some(e => e.quarter === qFilter))

  const totalEntries     = filtered.reduce((s, r) => s + r.entries.length, 0)
  const completedEntries = filtered.reduce((s, r) => s + r.entries.filter(e => e.status === 'Completed').length, 0)

  function handleExport() {
    const rows = filtered.flatMap(r =>
      r.entries
        .filter(e => qFilter === 'All' || e.quarter === qFilter)
        .map(e => ({
          'Report Title':              r.title,
          'Wing':                      r.wing,
          'Division':                  r.division,
          'Branch':                    r.branch,
          'Fiscal Year':               r.fiscalYear,
          'Quarter':                   e.quarter,
          'KRA':                       e.kra,
          'Program / Project':         e.program,
          'Description of Key Activities': e.plannedActivity,
          'KPIs':                      e.kpi,
          'Expected Outcomes':         e.expectedOutcomes,
          'Approved Budget (K)':       e.approvedBudget,
          'Quarter Expenditure (K)':   e.expenditure,
          'Status':                    e.status,
          'Justification / Remarks':   e.justification,
          'Officers in Charge':        e.officersInCharge,
          'Submitted By':              r.createdBy,
          'Submitted At':              r.submittedAt ?? '',
        }))
    )
    exportCSV(rows, 'DICT-Quarterly-Submissions')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
          <p className="text-2xl font-black text-blue-700">{filtered.length}</p>
          <p className="text-[11px] text-blue-600 font-medium">Reports Submitted</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-center">
          <p className="text-2xl font-black text-emerald-700">{completedEntries}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Activities Completed</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
          <p className="text-2xl font-black text-gray-700">
            {totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0}%
          </p>
          <p className="text-[11px] text-gray-600 font-medium">Completion Rate</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={qFilter} onChange={e => setQFilter(e.target.value as QuarterLabel | 'All')}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {(['All', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
              <option key={q} value={q}>{q === 'All' ? 'All Quarters' : q}</option>
            ))}
          </select>
          <select value={wingFilter} onChange={e => setWingFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {wings.map(w => <option key={w} value={w}>{w === 'All' ? 'All Wings' : w}</option>)}
          </select>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 rounded">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No submitted reports</p>
          <p className="text-xs text-gray-400 mt-1">Submitted and reviewed quarterly reports appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full text-xs border-collapse" style={{ minWidth: 800 }}>
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                {['Report Title', 'Wing', 'Division', 'Branch', 'Fiscal Year', 'Entries', 'Completed', 'Submitted By', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 last:border-r-0 whitespace-nowrap text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const entries   = qFilter === 'All' ? r.entries : r.entries.filter(e => e.quarter === qFilter)
                const completed = entries.filter(e => e.status === 'Completed').length
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-xs font-semibold text-gray-900 max-w-44">{r.title}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 max-w-36">{r.wing}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 max-w-36">{r.division}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{r.branch || '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{r.fiscalYear}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 text-center">{entries.length}</td>
                    <td className="px-3 py-2 text-xs text-center">
                      <span className="text-emerald-700 font-bold">{completed}</span>
                      <span className="text-gray-400">/{entries.length}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{r.createdBy}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{r.submittedAt ?? '—'}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>{r.status === 'reviewed' ? 'Reviewed' : 'Submitted'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab 3: Compliance Tracker ─────────────────────────────────────────────────
function ComplianceTracker() {
  const { reports } = useQuarterlyReport()
  const { user } = useAuth()
  const [wingFilter, setWingFilter] = useState('All')

  const submitted = reports.filter(r => r.status === 'submitted' || r.status === 'reviewed')
  const wings = ['All', ...FUNCTIONAL_AREAS.map(fa => fa.title)]
  const branches = ALL_BRANCHES.filter(b => wingFilter === 'All' || b.wing === wingFilter)

  function getStatus(branch: string, quarter: QuarterLabel): 'reviewed' | 'submitted' | 'draft' | 'none' {
    const match = submitted.find(r => r.branch === branch && r.entries.some(e => e.quarter === quarter))
    if (match) return match.status as 'reviewed' | 'submitted'
    const draft = reports.find(r => r.branch === branch && r.entries.some(e => e.quarter === quarter) && r.status === 'draft')
    return draft ? 'draft' : 'none'
  }

  const totalCells     = branches.length * 4
  const submittedCells = branches.reduce((s, b) =>
    s + QUARTERS.filter(q => { const st = getStatus(b.branch, q); return st === 'submitted' || st === 'reviewed' }).length, 0
  )
  const complianceRate = totalCells > 0 ? Math.round((submittedCells / totalCells) * 100) : 0

  function handleExport() {
    exportCSV(branches.map(b => ({
      'Wing':     b.wing,
      'Division': b.division,
      'Branch':   b.branch,
      'Q1':       getStatus(b.branch, 'Q1'),
      'Q2':       getStatus(b.branch, 'Q2'),
      'Q3':       getStatus(b.branch, 'Q3'),
      'Q4':       getStatus(b.branch, 'Q4'),
      'Quarters Submitted': QUARTERS.filter(q => {
        const st = getStatus(b.branch, q); return st === 'submitted' || st === 'reviewed'
      }).length,
    })), 'DICT-Reporting-Compliance')
  }

  function StatusCell({ status }: { status: ReturnType<typeof getStatus> }) {
    if (status === 'reviewed')  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="w-3 h-3" />Reviewed</span>
    if (status === 'submitted') return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700"><CheckCircle2 className="w-3 h-3" />Submitted</span>
    if (status === 'draft')     return <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600"><Clock className="w-3 h-3" />Draft</span>
    return <span className="text-[10px] text-gray-300">—</span>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className={`border rounded p-3 text-center ${
          complianceRate >= 75 ? 'bg-emerald-50 border-emerald-200' :
          complianceRate >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-2xl font-black ${
            complianceRate >= 75 ? 'text-emerald-700' :
            complianceRate >= 50 ? 'text-amber-700' : 'text-red-700'
          }`}>{complianceRate}%</p>
          <p className={`text-[11px] font-medium ${
            complianceRate >= 75 ? 'text-emerald-600' :
            complianceRate >= 50 ? 'text-amber-600' : 'text-red-600'
          }`}>Overall Compliance</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
          <p className="text-2xl font-black text-blue-700">{submittedCells}</p>
          <p className="text-[11px] text-blue-600 font-medium">Reports Submitted</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
          <p className="text-2xl font-black text-gray-600">{totalCells - submittedCells}</p>
          <p className="text-[11px] text-gray-500 font-medium">Outstanding</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <select value={wingFilter} onChange={e => setWingFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {wings.map(w => <option key={w} value={w}>{w === 'All' ? 'All Wings' : w}</option>)}
        </select>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 text-[11px] whitespace-nowrap">Wing</th>
              <th className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 text-[11px] whitespace-nowrap">Division</th>
              <th className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 text-[11px] whitespace-nowrap">Branch</th>
              {QUARTERS.map(q => (
                <th key={q} className="text-center px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 last:border-r-0 text-[11px] w-28">{q}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map((b, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 text-xs text-gray-500 border-r border-gray-100 max-w-36">{b.wing}</td>
                <td className="px-3 py-2 text-xs text-gray-600 border-r border-gray-100 max-w-40">{b.division}</td>
                <td className="px-3 py-2 text-xs font-semibold text-gray-800 border-r border-gray-100">{b.branch}</td>
                {QUARTERS.map(q => (
                  <td key={q} className="px-3 py-2.5 text-center border-r border-gray-100 last:border-r-0">
                    <StatusCell status={getStatus(b.branch, q)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MESummaryPage() {
  const [tab, setTab] = useState<'annual' | 'submissions' | 'compliance'>('annual')

  const TABS = [
    { key: 'annual'      as const, label: 'Annual KRA View',       icon: TrendingUp },
    { key: 'submissions' as const, label: 'Quarterly Submissions',  icon: FileText   },
    { key: 'compliance'  as const, label: 'Compliance Tracker',     icon: BarChart3  },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-base font-bold text-gray-900">M&amp;E Summary</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Consolidated departmental M&amp;E — Annual KRAs, quarterly submissions, and branch compliance
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold transition-colors ${
              tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'annual'      && <AnnualKRAView />}
      {tab === 'submissions' && <QuarterlySubmissions />}
      {tab === 'compliance'  && <ComplianceTracker />}
    </div>
  )
}
