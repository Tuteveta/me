'use client'

import { getDashboardStats, KPI_TREND, BUDGET_BY_PROGRAM, PROJECT_STATUS_PIE, PROJECTS, REPORTS } from '@/lib/mock-data/me-data'
import KPICard from '@/components/shared/KPICard'
import D3LineChart from '@/components/shared/D3LineChart'
import D3BarChart from '@/components/shared/D3BarChart'
import D3DonutChart from '@/components/shared/D3DonutChart'
import {
  FolderKanban, Target, DollarSign, FileText,
  AlertTriangle, CheckCircle, Clock, Users,
} from 'lucide-react'

function fmt(n: number) {
  if (n >= 1_000_000) return `K${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `K${(n / 1_000).toFixed(0)}K`
  return `K${n}`
}

function PanelHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-4 pt-3 pb-2 border-b border-gray-100">
      <h3 className="text-xs font-semibold text-gray-600">{title}</h3>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function OverviewPage() {
  const stats = getDashboardStats()

  const kpiTrendSeries = [{
    name: 'KPIs on Track (%)',
    color: '#3B82F6',
    data: KPI_TREND.map(p => ({ x: p.month, y: p.value })),
  }]

  const budgetGroups = BUDGET_BY_PROGRAM.map(b => ({
    label: b.program,
    values: [
      { name: 'Budget', value: b.budget / 1_000_000, color: '#E5E7EB' },
      { name: 'Spent',  value: b.spent  / 1_000_000, color: '#3B82F6' },
    ],
  }))

  const recentProjects = PROJECTS.slice(0, 5)
  const recentReports  = REPORTS.slice(0, 5)

  const STATUS_BADGE: Record<string, string> = {
    active:    'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    delayed:   'bg-red-50 text-red-700',
    'on-hold': 'bg-gray-100 text-gray-500',
    planned:   'bg-purple-50 text-purple-700',
  }
  const REPORT_BADGE: Record<string, string> = {
    approved:  'bg-emerald-50 text-emerald-700',
    submitted: 'bg-blue-50 text-blue-700',
    pending:   'bg-amber-50 text-amber-700',
    overdue:   'bg-red-50 text-red-700',
  }

  return (
    <div className="space-y-4">

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Active Projects"
          value={stats.activeProjects}
          sub={`/ ${stats.totalProjects} total`}
          icon={FolderKanban}
          color="#3B82F6"
          status="neutral"
          trend="up"
          trendLabel="2 new this quarter"
        />
        <KPICard
          label="KPIs On Track"
          value={`${stats.kpisOnTrack}/${stats.kpisOnTrack + stats.kpisAtRisk + stats.kpisOffTrack}`}
          icon={Target}
          color="#10B981"
          status={stats.kpisOffTrack > 2 ? 'warning' : 'good'}
          trend={stats.kpisOffTrack > 2 ? 'down' : 'up'}
          trendLabel={`${stats.kpisOffTrack} off-track`}
        />
        <KPICard
          label="Budget Utilised"
          value={`${Math.round((stats.totalSpent / stats.totalBudget) * 100)}%`}
          sub={`of ${fmt(stats.totalBudget)}`}
          icon={DollarSign}
          color="#D97706"
          status="neutral"
          trend="up"
          trendLabel={fmt(stats.totalSpent) + ' spent'}
        />
        <KPICard
          label="Reports Overdue"
          value={stats.reportsOverdue}
          icon={FileText}
          color={stats.reportsOverdue > 0 ? '#EF4444' : '#10B981'}
          status={stats.reportsOverdue > 0 ? 'danger' : 'good'}
          trend={stats.reportsOverdue > 0 ? 'down' : 'stable'}
          trendLabel={`${stats.reportsThisQuarter} submitted`}
        />
      </div>

      {/* ── Row 2: Charts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* KPI Trend line chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm">
          <PanelHeader title="KPI Performance Trend" sub="% of KPIs on track — last 12 months" />
          <div className="p-4">
            <D3LineChart series={kpiTrendSeries} height={180} yLabel="%" />
          </div>
        </div>

        {/* Project Status donut */}
        <div className="bg-white border border-gray-200 rounded-sm">
          <PanelHeader title="Project Status" sub="Current distribution" />
          <div className="p-4 flex items-center justify-center">
            <D3DonutChart
              data={PROJECT_STATUS_PIE}
              size={140}
              centerValue={stats.totalProjects}
              centerLabel="Projects"
            />
          </div>
        </div>
      </div>

      {/* ── Row 3: Budget chart ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <PanelHeader title="Budget vs Actual Spend by Programme" sub="Values in PGK millions" />
        <div className="p-4">
          <D3BarChart
            groups={budgetGroups}
            height={200}
            yLabel="PGK M"
            formatValue={v => `${v.toFixed(0)}M`}
          />
        </div>
      </div>

      {/* ── Row 4: Tables ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Recent Projects */}
        <div className="bg-white border border-gray-200 rounded-sm">
          <PanelHeader title="Recent Projects" sub="Top 5 by activity" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-gray-400 font-medium">Project</th>
                  <th className="text-left px-4 py-2 text-gray-400 font-medium">Program</th>
                  <th className="text-right px-4 py-2 text-gray-400 font-medium">Progress</th>
                  <th className="text-right px-4 py-2 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900 max-w-[160px] truncate">{p.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{p.program.split(' ')[0]}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${p.completion}%` }}
                          />
                        </div>
                        <span className="text-gray-600 w-8 text-right">{p.completion}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_BADGE[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white border border-gray-200 rounded-sm">
          <PanelHeader title="Recent Reports" sub="Latest submissions" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-gray-400 font-medium">Report</th>
                  <th className="text-left px-4 py-2 text-gray-400 font-medium">Type</th>
                  <th className="text-right px-4 py-2 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900 max-w-[200px] truncate">{r.title}</td>
                    <td className="px-4 py-2.5 text-gray-500 capitalize whitespace-nowrap">{r.type}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${REPORT_BADGE[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, label: 'Completed Projects', value: stats.completedProjects, color: '#10B981' },
          { icon: AlertTriangle, label: 'Delayed Projects', value: stats.delayedProjects, color: '#EF4444' },
          { icon: Users, label: 'Beneficiaries Reached', value: stats.beneficiariesReached.toLocaleString(), color: '#8B5CF6' },
          { icon: Clock, label: 'Total Budget (PGK)', value: fmt(stats.totalBudget), color: '#D97706' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-sm p-4 flex items-center gap-3">
            <div className="p-2 rounded" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">{s.label}</p>
              <p className="text-sm font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
