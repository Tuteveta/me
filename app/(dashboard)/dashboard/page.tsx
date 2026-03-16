'use client'

import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import Link from 'next/link'
import {
  Clock, CheckCircle2, XCircle, ArrowRight,
  Send, BadgeCheck, Banknote, ShieldCheck,
  ClipboardList, Target, DollarSign, FolderKanban,
  FileText, TrendingUp, TrendingDown, Minus,
  AlertTriangle, BookOpenCheck,
} from 'lucide-react'
import type { FundingRequest, RequestStage } from '@/types'
import { WORKPLANS, KPIS, PROJECTS, REPORTS } from '@/lib/mock-data/me-data'

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000 ? `K${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `K${(n / 1_000).toFixed(0)}K`
  : `K${n}`

const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a / b) * 100)

const STAGE_META: Record<RequestStage, { label: string; color: string; bg: string }> = {
  pending_em:               { label: 'Awaiting Exec. Manager',       color: 'text-amber-700',   bg: 'bg-amber-50' },
  pending_deputy:           { label: 'Awaiting Deputy Sec.',         color: 'text-purple-700',  bg: 'bg-purple-50' },
  pending_dcs:              { label: 'Awaiting Dir. Corp. Services', color: 'text-teal-700',    bg: 'bg-teal-50' },
  pending_finance:          { label: 'Awaiting Finance',             color: 'text-blue-700',    bg: 'bg-blue-50' },
  pending_acquittal:        { label: 'Acquittal Due',                color: 'text-orange-700',  bg: 'bg-orange-50' },
  pending_acquittal_review: { label: 'Acquittal Under Review',       color: 'text-teal-700',    bg: 'bg-teal-50' },
  closed:                   { label: 'Closed',                       color: 'text-emerald-700', bg: 'bg-emerald-50' },
  rejected:                 { label: 'Rejected',                     color: 'text-red-700',     bg: 'bg-red-50' },
  deferred:                 { label: 'On Hold / Deferred',           color: 'text-yellow-700',  bg: 'bg-yellow-50' },
}

const STAGE_ICON: Record<RequestStage, React.ElementType> = {
  pending_em:               Clock,
  pending_deputy:           Clock,
  pending_dcs:              Clock,
  pending_finance:          Clock,
  pending_acquittal:        BookOpenCheck,
  pending_acquittal_review: BookOpenCheck,
  closed:                   CheckCircle2,
  rejected:                 XCircle,
  deferred:                 Clock,
}

const ROLE_LABELS: Record<string, string> = {
  super:     'Super Admin',
  admin:     'M&E Manager',
  finance:   'Finance Manager',
  executive: 'Executive Manager',
  deputy:    'Deputy Secretary',
  dcs:       'Dir. Corporate Services',
}

/* ── Request row ───────────────────────────────────────────────────────────── */
function RequestRow({ req }: { req: FundingRequest }) {
  const meta = STAGE_META[req.stage]
  const Icon = STAGE_ICON[req.stage]
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      <div className={`p-1.5 rounded ${meta.bg} shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
        <p className="text-xs text-gray-400 mt-0.5">{req.submittedBy} · {req.fiscalYear} · {req.submittedAt}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-800">{fmt(req.amount)}</p>
        <span className={`text-[10px] font-bold uppercase ${meta.color}`}>{meta.label}</span>
      </div>
    </div>
  )
}

/* ── RAG dot ───────────────────────────────────────────────────────────────── */
function Rag({ status }: { status: 'green' | 'amber' | 'red' }) {
  const cls = status === 'green' ? 'bg-emerald-500' : status === 'amber' ? 'bg-amber-400' : 'bg-red-500'
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls} shrink-0`} />
}

/* ── Mini stat card ────────────────────────────────────────────────────────── */
function MiniStat({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; href?: string
}) {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {href && <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400" />}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href} className="group">{inner}</Link> : inner
}

/* ── Section header ────────────────────────────────────────────────────────── */
function SectionHead({
  icon: Icon, title, desc, href, linkLabel, color, badge,
}: {
  icon: React.ElementType; title: string; desc: string
  href?: string; linkLabel?: string; color: string; badge?: number
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            {title}
            {badge !== undefined && badge > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: color }}>
                {badge}
              </span>
            )}
          </h2>
          <p className="text-[11px] text-gray-400">{desc}</p>
        </div>
      </div>
      {href && linkLabel && (
        <Link href={href} className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

/* ── Empty panel ───────────────────────────────────────────────────────────── */
function EmptyPanel({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-gray-500 font-medium">{message}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ── M&E Monitoring Dashboard (admin / super)                              ── */
/* ═══════════════════════════════════════════════════════════════════════════ */
function MEDashboard({ requests }: { requests: FundingRequest[] }) {
  /* ── Derived stats ── */
  const wpTotal    = WORKPLANS.length
  const wpApproved = WORKPLANS.filter(w => w.status === 'approved' || w.status === 'active').length
  const wpPending  = WORKPLANS.filter(w => w.status === 'submitted').length
  const wpDraft    = WORKPLANS.filter(w => w.status === 'draft').length

  const kpiTotal    = KPIS.length
  const kpiOnTrack  = KPIS.filter(k => k.status === 'on-track' || k.status === 'exceeded').length
  const kpiAtRisk   = KPIS.filter(k => k.status === 'at-risk').length
  const kpiOffTrack = KPIS.filter(k => k.status === 'off-track').length

  const projTotal    = PROJECTS.length
  const projActive   = PROJECTS.filter(p => p.status === 'active').length
  const projDelayed  = PROJECTS.filter(p => p.status === 'delayed').length
  const projDone     = PROJECTS.filter(p => p.status === 'completed').length
  const totalBudget  = PROJECTS.reduce((s, p) => s + p.budget, 0)
  const totalSpent   = PROJECTS.reduce((s, p) => s + p.spent, 0)
  const burnRate     = pct(totalSpent, totalBudget)

  const rptTotal    = REPORTS.length
  const rptApproved = REPORTS.filter(r => r.status === 'approved').length
  const rptOverdue  = REPORTS.filter(r => r.status === 'overdue').length
  const rptPending  = REPORTS.filter(r => r.status === 'pending' || r.status === 'submitted').length

  const reqPending = requests.filter(r => !['closed', 'rejected'].includes(r.stage)).length
  const reqAcq     = requests.filter(r => r.stage === 'pending_acquittal').length

  /* ── KPI RAG overall ── */
  const kpiRag: 'green' | 'amber' | 'red' =
    kpiTotal === 0 ? 'green' :
    kpiOffTrack > 0 ? 'red' :
    kpiAtRisk > 0   ? 'amber' : 'green'

  return (
    <div className="p-5 space-y-6">

      {/* ── Top 5 stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MiniStat
          icon={ClipboardList} label="Annual Work Plans"
          value={wpTotal} sub={`${wpApproved} approved · ${wpPending} pending`}
          color="#3B82F6" href="/workplan"
        />
        <MiniStat
          icon={Target} label="KPI Indicators"
          value={kpiTotal} sub={`${kpiOnTrack} on-track · ${kpiAtRisk} at-risk`}
          color="#10B981" href="/kpi"
        />
        <MiniStat
          icon={DollarSign} label="Budget Performance"
          value={totalBudget > 0 ? `${burnRate}%` : '—'}
          sub={totalBudget > 0 ? `${fmt(totalSpent)} of ${fmt(totalBudget)} spent` : 'No budget data yet'}
          color="#D97706"
        />
        <MiniStat
          icon={FolderKanban} label="Project Health"
          value={projTotal} sub={`${projActive} active · ${projDelayed} delayed`}
          color="#8B5CF6" href="/projects"
        />
        <MiniStat
          icon={FileText} label="Reports"
          value={rptTotal} sub={`${rptApproved} approved · ${rptOverdue} overdue`}
          color="#CE1126" href="/reports"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── 1. KPI Performance ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead
            icon={Target} color="#10B981"
            title="KPI Performance" desc="Target vs Actual — Red / Amber / Green status"
            href="/kpi" linkLabel="View All KPIs"
            badge={kpiAtRisk + kpiOffTrack}
          />
          {kpiTotal === 0 ? (
            <EmptyPanel message="No KPIs defined yet" sub="Add indicators from the KPI Monitoring page." />
          ) : (
            <div className="space-y-2">
              {/* RAG summary row */}
              <div className="flex gap-3 mb-3">
                {[
                  { label: 'On Track', count: kpiOnTrack,  bg: 'bg-emerald-50',  text: 'text-emerald-700' },
                  { label: 'At Risk',  count: kpiAtRisk,   bg: 'bg-amber-50',    text: 'text-amber-700' },
                  { label: 'Off Track',count: kpiOffTrack, bg: 'bg-red-50',      text: 'text-red-700' },
                ].map(s => (
                  <div key={s.label} className={`flex-1 ${s.bg} rounded-lg p-2.5 text-center`}>
                    <p className={`text-lg font-black ${s.text}`}>{s.count}</p>
                    <p className={`text-[10px] font-semibold ${s.text}`}>{s.label}</p>
                  </div>
                ))}
              </div>
              {/* KPI rows */}
              {KPIS.slice(0, 5).map(k => {
                const progress = pct(k.actual, k.target)
                const rag: 'green' | 'amber' | 'red' =
                  k.status === 'off-track' ? 'red' : k.status === 'at-risk' ? 'amber' : 'green'
                const TrendIcon = k.trend === 'up' ? TrendingUp : k.trend === 'down' ? TrendingDown : Minus
                return (
                  <div key={k.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <Rag status={rag} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{k.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: `${progress}%`, background: rag === 'red' ? '#EF4444' : rag === 'amber' ? '#F59E0B' : '#10B981' }} />
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0">{k.actual}/{k.target} {k.unit}</span>
                      </div>
                    </div>
                    <TrendIcon className={`w-3.5 h-3.5 shrink-0 ${k.trend === 'up' ? 'text-emerald-500' : k.trend === 'down' ? 'text-red-400' : 'text-gray-300'}`} />
                  </div>
                )
              })}
              {KPIS.length > 5 && (
                <Link href="/kpi" className="block text-center text-xs text-blue-600 hover:text-blue-800 font-medium pt-1">
                  +{KPIS.length - 5} more indicators
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Budget Performance ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead
            icon={DollarSign} color="#D97706"
            title="Budget Performance" desc="Allocated vs Spent — Burn rate and variance"
          />
          {projTotal === 0 ? (
            <EmptyPanel message="No budget data yet" sub="Budget figures will appear once projects are added." />
          ) : (
            <div className="space-y-4">
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Allocated',  value: fmt(totalBudget), color: 'text-blue-700',   bg: 'bg-blue-50' },
                  { label: 'Spent',      value: fmt(totalSpent),  color: 'text-amber-700',  bg: 'bg-amber-50' },
                  { label: 'Burn Rate',  value: `${burnRate}%`,   color: burnRate > 80 ? 'text-red-700' : burnRate > 60 ? 'text-amber-700' : 'text-emerald-700', bg: burnRate > 80 ? 'bg-red-50' : burnRate > 60 ? 'bg-amber-50' : 'bg-emerald-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                    <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                    <p className={`text-[10px] font-semibold ${s.color} opacity-80`}>{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Per-project bars */}
              {PROJECTS.slice(0, 5).map(p => {
                const bp = pct(p.spent, p.budget)
                const over = bp > 100
                return (
                  <div key={p.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[60%]">{p.name}</span>
                      <span className={`text-[10px] font-bold ${over ? 'text-red-600' : 'text-gray-400'}`}>
                        {bp}% · {fmt(p.spent)}/{fmt(p.budget)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(bp, 100)}%`, background: over ? '#EF4444' : bp > 80 ? '#F59E0B' : '#3B82F6' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── 3. Project Health ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead
            icon={FolderKanban} color="#8B5CF6"
            title="Project Health" desc="On-track vs Delayed — Risk level overview"
            href="/projects" linkLabel="View All Projects"
            badge={projDelayed}
          />
          {projTotal === 0 ? (
            <EmptyPanel message="No projects yet" sub="Projects will appear here once added to the system." />
          ) : (
            <div className="space-y-3">
              {/* Status breakdown */}
              <div className="grid grid-cols-4 gap-2 mb-1">
                {[
                  { label: 'Active',    count: projActive,  color: '#3B82F6' },
                  { label: 'On Hold',   count: PROJECTS.filter(p => p.status === 'on-hold').length, color: '#9CA3AF' },
                  { label: 'Delayed',   count: projDelayed, color: '#EF4444' },
                  { label: 'Completed', count: projDone,    color: '#10B981' },
                ].map(s => (
                  <div key={s.label} className="text-center py-2 rounded-lg bg-gray-50">
                    <p className="text-lg font-black" style={{ color: s.color }}>{s.count}</p>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Project rows */}
              {PROJECTS.slice(0, 5).map(p => {
                const rag: 'red' | 'amber' | 'green' =
                  p.status === 'delayed' ? 'red' : p.status === 'on-hold' ? 'amber' : 'green'
                return (
                  <div key={p.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                    <Rag status={rag} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.program} · {p.endDate}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-700">{p.completion}%</p>
                      <p className="text-[10px] text-gray-400">complete</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── 4. Annual Work Plans ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead
            icon={ClipboardList} color="#3B82F6"
            title="Annual Work Plans" desc="Submitted vs Approved — Alignment to strategy"
            href="/workplan" linkLabel="View Workplans"
          />
          {wpTotal === 0 ? (
            <EmptyPanel message="No work plans submitted yet" sub="Create and submit an annual work plan to begin tracking." />
          ) : (
            <div className="space-y-3">
              {/* Summary bar */}
              <div className="flex gap-2 mb-1">
                {[
                  { label: 'Approved', count: wpApproved, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  { label: 'Submitted', count: wpPending,  bg: 'bg-blue-50',    text: 'text-blue-700' },
                  { label: 'Draft',     count: wpDraft,    bg: 'bg-gray-100',   text: 'text-gray-600' },
                ].map(s => (
                  <div key={s.label} className={`flex-1 ${s.bg} rounded-lg px-3 py-2`}>
                    <p className={`text-lg font-black ${s.text}`}>{s.count}</p>
                    <p className={`text-[10px] font-semibold ${s.text} opacity-80`}>{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Workplan rows */}
              {WORKPLANS.slice(0, 5).map(w => {
                const rag: 'green' | 'amber' | 'red' =
                  w.status === 'approved' || w.status === 'active' ? 'green' :
                  w.status === 'submitted' ? 'amber' : 'red'
                return (
                  <div key={w.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                    <Rag status={rag} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{w.title}</p>
                      <p className="text-[10px] text-gray-400">{w.fiscalYear} · {w.division}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      w.status === 'approved' || w.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      w.status === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>{w.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── 5. Quarterly Reports ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <SectionHead
          icon={FileText} color="#CE1126"
          title="Quarterly Reports" desc="Auto-generated performance summaries · FY 2024/25"
          href="/reports" linkLabel="View All Reports"
          badge={rptOverdue}
        />
        {rptTotal === 0 ? (
          <EmptyPanel message="No reports generated yet" sub="Quarterly performance reports will appear here automatically once data is available." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-150">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Report</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-semibold hidden sm:table-cell">Program</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Type</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-semibold hidden md:table-cell">Due</th>
                  <th className="text-center px-4 py-2.5 text-gray-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS.slice(0, 6).map(r => {
                  const overdue = r.status === 'overdue'
                  const badge =
                    r.status === 'approved'  ? 'bg-emerald-50 text-emerald-700' :
                    r.status === 'submitted' ? 'bg-blue-50 text-blue-700' :
                    r.status === 'pending'   ? 'bg-amber-50 text-amber-700' :
                                               'bg-red-50 text-red-700'
                  return (
                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-2.5 font-medium text-gray-800 max-w-45 truncate">{r.title}</td>
                      <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{r.program}</td>
                      <td className="px-4 py-2.5 text-gray-500 capitalize">{r.type}</td>
                      <td className={`px-4 py-2.5 hidden md:table-cell ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>{r.dueDate}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${badge}`}>{r.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Funding Requests Inbox (all roles) ── */}
      <FundingInbox
        requests={requests}
        role="admin"
        title="My Funding Requests"
        desc="Requests you have submitted and their current status"
        icon={Send}
        color="#D97706"
        link="/requests"
        linkLabel="Manage Requests"
        badge={reqAcq > 0 ? reqAcq : reqPending}
        badgeLabel={reqAcq > 0 ? `${reqAcq} acquittal due` : undefined}
      />

    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ── Funding Inbox (shared for all roles)                                  ── */
/* ═══════════════════════════════════════════════════════════════════════════ */
function FundingInbox({
  requests, role, title, desc, icon: Icon, color, link, linkLabel, badge, badgeLabel,
}: {
  requests: FundingRequest[]; role: string; title: string; desc: string
  icon: React.ElementType; color: string; link: string; linkLabel: string
  badge?: number; badgeLabel?: string
}) {
  const closed  = requests.filter(r => r.stage === 'closed' || r.stage === 'rejected')
  const active  = requests.filter(r => !['closed', 'rejected'].includes(r.stage))

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${color}18` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              {title}
              {badge !== undefined && badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: color }}>
                  {badgeLabel ?? badge}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
        </div>
        <Link href={link}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {active.length === 0 && closed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <CheckCircle2 className="w-8 h-8 mb-2 text-green-400" />
          <p className="text-sm font-medium text-gray-600">All clear</p>
          <p className="text-xs mt-1">No pending items require your attention.</p>
          {role === 'admin' && (
            <Link href="/requests"
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
              Submit a funding request <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="divide-y divide-gray-50">
              {active.map(req => <RequestRow key={req.id} req={req} />)}
            </div>
          )}
          {closed.length > 0 && (
            <>
              <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Completed</p>
              </div>
              <div className="divide-y divide-gray-50">
                {closed.slice(0, 3).map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ── Approvals Inbox (executive / deputy)                                  ── */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ApprovalsInbox({ requests, role }: { requests: FundingRequest[]; role: string }) {
  const items = requests.filter(r =>
    role === 'executive' ? r.stage === 'pending_em' : r.stage === 'pending_deputy'
  )
  return (
    <FundingInbox
      requests={items}
      role={role}
      title={role === 'executive' ? 'Pending Your Approval' : 'Pending Your Endorsement'}
      desc={role === 'executive'
        ? 'Funding requests from the M&E Manager awaiting your decision'
        : 'Requests approved by the Executive Manager awaiting your sign-off'}
      icon={BadgeCheck}
      color={role === 'executive' ? '#7C3AED' : '#4F46E5'}
      link="/approvals"
      linkLabel="Go to Approvals"
      badge={items.length}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ── Page ──────────────────────────────────────────────────────────────── ── */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function OverviewPage() {
  const { user } = useAuth()
  const { requests } = useFunding()
  if (!user) return null

  const myRequests = user.role === 'admin'
    ? requests.filter(r => r.submittedBy === user.name)
    : requests

  const now = new Date().toLocaleDateString('en-PG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  /* ── Role-specific CTA in banner ── */
  const bannerLink =
    user.role === 'admin'     ? { href: '/requests',  label: 'New Funding Request' } :
    user.role === 'executive' ? { href: '/approvals', label: 'Review Approvals' } :
    user.role === 'deputy'    ? { href: '/approvals', label: 'Review Approvals' } :
    user.role === 'finance'   ? { href: '/finance',   label: 'Finance Dashboard' } :
    null

  /* ── Alert: acquittal due ── */
  const acquittalDue = user.role === 'admin'
    ? myRequests.filter(r => r.stage === 'pending_acquittal').length
    : 0

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Welcome banner ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">{now}</p>
            <h1 className="text-xl font-black text-gray-900">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ROLE_LABELS[user.role]} · {user.division}
            </p>
          </div>
          {bannerLink && (
            <Link
              href={bannerLink.href}
              className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors shrink-0"
            >
              {bannerLink.label} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Acquittal alert */}
        {acquittalDue > 0 && (
          <div className="flex items-center gap-2.5 mt-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-800 font-medium">
              <span className="font-bold">{acquittalDue} acquittal report{acquittalDue > 1 ? 's' : ''} due.</span>{' '}
              Finance has approved your request{acquittalDue > 1 ? 's' : ''} — submit the acquittal to close.
            </p>
            <Link href="/requests" className="ml-auto text-xs text-orange-700 font-semibold hover:underline shrink-0">
              Submit now →
            </Link>
          </div>
        )}
      </div>

      {/* ── Role-specific content ── */}
      {(user.role === 'admin' || user.role === 'super') ? (
        <MEDashboard requests={myRequests} />
      ) : (
        <div className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: myRequests.length,                                                   color: '#3B82F6' },
              { label: 'In Progress',    value: myRequests.filter(r => !['closed','rejected'].includes(r.stage)).length, color: '#D97706' },
              { label: 'Closed',         value: myRequests.filter(r => r.stage === 'closed').length,                 color: '#10B981' },
              { label: 'Rejected',       value: myRequests.filter(r => r.stage === 'rejected').length,               color: '#EF4444' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-3xl font-black mt-2" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Role inbox */}
          {(user.role === 'executive' || user.role === 'deputy') ? (
            <ApprovalsInbox requests={requests} role={user.role} />
          ) : (
            <FundingInbox
              requests={myRequests}
              role={user.role}
              title="Pending Funding Decision"
              desc="Requests cleared by both Executive Manager and Deputy Secretary"
              icon={Banknote}
              color="#10B981"
              link="/finance"
              linkLabel="Go to Finance"
              badge={myRequests.filter(r => r.stage === 'pending_finance').length}
            />
          )}

          {/* Completed */}
          {(() => {
            const done = myRequests.filter(r => r.stage === 'closed' || r.stage === 'rejected')
            if (!done.length) return null
            return (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">Completed Requests</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Requests that have been fully resolved</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {done.map(req => <RequestRow key={req.id} req={req} />)}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
