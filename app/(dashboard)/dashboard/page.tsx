'use client'

import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import { useWorkplan } from '@/lib/workplan-context'
import { useTeam } from '@/lib/team-context'
import Link from 'next/link'
import {
  Clock, CheckCircle2, XCircle, ArrowRight,
  Send, BadgeCheck, Banknote, ShieldCheck,
  ClipboardList, Target, DollarSign, FolderKanban,
  FileText, TrendingUp, TrendingDown, Minus,
  AlertTriangle, BookOpenCheck, Users, Settings,
  Network, BookMarked, PieChart, BarChart3,
  Briefcase, UserCheck, Lock, PauseCircle,
  Building2, Globe, Activity, UserCircle,
} from 'lucide-react'
import type { FundingRequest, RequestStage } from '@/types'
import { WORKPLANS, KPIS, PROJECTS, REPORTS } from '@/lib/mock-data/me-data'
import { FUNCTIONAL_AREAS } from '@/lib/org-data'

/* ─────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
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
  officer:   'Officer',
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Shared micro-components                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; color: string; href?: string
}) {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:border-blue-200 transition-colors h-full">
      <div className="flex items-center justify-between">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {href && <ArrowRight className="w-3.5 h-3.5 text-gray-300" />}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href} className="group block">{inner}</Link> : inner
}

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
        <Link href={href} className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0">
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

function Rag({ status }: { status: 'green' | 'amber' | 'red' }) {
  const cls = status === 'green' ? 'bg-emerald-500' : status === 'amber' ? 'bg-amber-400' : 'bg-red-500'
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls} shrink-0`} />
}

function EmptyPanel({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-gray-500 font-medium">{message}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

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

function QuickLink({ icon: Icon, label, href, color }: { icon: React.ElementType; label: string; href: string; color: string }) {
  return (
    <Link href={href}
      className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors group">
      <div className="p-1.5 rounded" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{label}</span>
      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-blue-400 ml-auto" />
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 1. SUPER ADMIN Dashboard                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function SuperDashboard({ requests, workplans }: { requests: FundingRequest[]; workplans: ReturnType<typeof useWorkplan>['workplans'] }) {
  const totalReqs    = requests.length
  const inProgress   = requests.filter(r => !['closed','rejected'].includes(r.stage)).length
  const closed       = requests.filter(r => r.stage === 'closed').length
  const rejected     = requests.filter(r => r.stage === 'rejected').length
  const totalWPs     = workplans.length
  const totalFAs     = FUNCTIONAL_AREAS.length
  const totalPrograms = FUNCTIONAL_AREAS.reduce((s, fa) => s + fa.programs.length, 0)

  // Pipeline stage counts
  const pipelineStages: { stage: RequestStage; label: string; color: string }[] = [
    { stage: 'pending_em',     label: 'Exec. Manager',    color: '#D97706' },
    { stage: 'pending_deputy', label: 'Deputy Sec.',       color: '#7C3AED' },
    { stage: 'pending_dcs',    label: 'Dir. Corp. Svc',    color: '#0D9488' },
    { stage: 'pending_finance', label: 'Finance',          color: '#2563EB' },
    { stage: 'pending_acquittal', label: 'Acquittal Due',  color: '#EA580C' },
  ]

  return (
    <div className="p-5 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={ClipboardList} label="Funding Requests" value={totalReqs}   sub={`${inProgress} in progress`}  color="#3B82F6" />
        <StatCard icon={Clock}         label="In Progress"       value={inProgress}  sub="Awaiting action"             color="#D97706" />
        <StatCard icon={CheckCircle2}  label="Closed"            value={closed}      sub="Fully acquitted"             color="#10B981" />
        <StatCard icon={XCircle}       label="Rejected"          value={rejected}    sub="Declined requests"           color="#EF4444" />
        <StatCard icon={ClipboardList} label="Work Plans"        value={totalWPs}    sub="Across all divisions"        color="#8B5CF6" href="/workplan" />
        <StatCard icon={Network}       label="Functional Areas"  value={totalFAs}    sub={`${totalPrograms} programs`} color="#06B6D4" href="/organisation" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Approval Pipeline */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead icon={BarChart3} color="#3B82F6"
            title="Approval Pipeline" desc="Live status of all funding requests across approval stages" />
          {totalReqs === 0 ? (
            <EmptyPanel message="No requests in the system yet" sub="Requests will appear here once submitted by M&E Managers." />
          ) : (
            <div className="space-y-3">
              {pipelineStages.map(s => {
                const count = requests.filter(r => r.stage === s.stage).length
                const barPct = totalReqs > 0 ? pct(count, totalReqs) : 0
                return (
                  <div key={s.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">{s.label}</span>
                      <span className="text-xs font-black" style={{ color: s.color }}>{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: s.color }} />
                    </div>
                  </div>
                )
              })}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                {[
                  { label: 'Closed', count: closed, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                  { label: 'Rejected', count: rejected, color: 'text-red-700', bg: 'bg-red-50' },
                  { label: 'Deferred', count: requests.filter(r => r.stage === 'deferred').length, color: 'text-yellow-700', bg: 'bg-yellow-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-lg p-2.5 text-center`}>
                    <p className={`text-lg font-black ${s.color}`}>{s.count}</p>
                    <p className={`text-[10px] font-semibold ${s.color}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="space-y-2">
              <QuickLink icon={Users}       label="User Management"   href="/users"           color="#3B82F6" />
              <QuickLink icon={Network}     label="Organisation"       href="/organisation"    color="#7C3AED" />
              <QuickLink icon={BookMarked}  label="Corporate Plan"     href="/corporate-plan"  color="#10B981" />
              <QuickLink icon={PieChart}    label="Expenditure Budget" href="/budget"          color="#D97706" />
              <QuickLink icon={ClipboardList} label="Annual Workplan"  href="/workplan"        color="#06B6D4" />
              <QuickLink icon={Settings}    label="Settings"           href="/settings"        color="#9CA3AF" />
            </div>
          </div>
        </div>
      </div>

      {/* All recent requests */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">All Funding Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">System-wide — all divisions and programs</p>
          </div>
        </div>
        {requests.length === 0 ? (
          <EmptyPanel message="No requests yet" sub="Requests appear here once submitted." />
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.slice(0, 8).map(req => <RequestRow key={req.id} req={req} />)}
            {requests.length > 8 && (
              <div className="px-5 py-3 text-center text-xs text-gray-400">
                +{requests.length - 8} more requests
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 2. M&E MANAGER (admin) Dashboard                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function MEDashboard({ requests }: { requests: FundingRequest[] }) {
  const wpTotal    = WORKPLANS.length
  const wpApproved = WORKPLANS.filter(w => w.status === 'approved' || w.status === 'active').length
  const wpPending  = WORKPLANS.filter(w => w.status === 'submitted').length
  const wpDraft    = WORKPLANS.filter(w => w.status === 'draft').length

  const kpiTotal    = KPIS.length
  const kpiOnTrack  = KPIS.filter(k => k.status === 'on-track' || k.status === 'exceeded').length
  const kpiAtRisk   = KPIS.filter(k => k.status === 'at-risk').length
  const kpiOffTrack = KPIS.filter(k => k.status === 'off-track').length

  const projTotal   = PROJECTS.length
  const projActive  = PROJECTS.filter(p => p.status === 'active').length
  const projDelayed = PROJECTS.filter(p => p.status === 'delayed').length
  const projDone    = PROJECTS.filter(p => p.status === 'completed').length
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0)
  const totalSpent  = PROJECTS.reduce((s, p) => s + p.spent, 0)
  const burnRate    = pct(totalSpent, totalBudget)

  const rptTotal   = REPORTS.length
  const rptApproved = REPORTS.filter(r => r.status === 'approved').length
  const rptOverdue  = REPORTS.filter(r => r.status === 'overdue').length

  const reqPending = requests.filter(r => !['closed', 'rejected'].includes(r.stage)).length
  const reqAcq     = requests.filter(r => r.stage === 'pending_acquittal').length

  return (
    <div className="p-5 space-y-6">

      {/* Top 5 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={ClipboardList} label="Annual Work Plans"  value={wpTotal}   sub={`${wpApproved} approved · ${wpPending} pending`} color="#3B82F6" href="/workplan" />
        <StatCard icon={Target}        label="KPI Indicators"     value={kpiTotal}  sub={`${kpiOnTrack} on-track · ${kpiAtRisk} at-risk`} color="#10B981" href="/kpi" />
        <StatCard icon={DollarSign}    label="Budget Performance" value={totalBudget > 0 ? `${burnRate}%` : '—'}
          sub={totalBudget > 0 ? `${fmt(totalSpent)} of ${fmt(totalBudget)} spent` : 'No budget data yet'} color="#D97706" />
        <StatCard icon={FolderKanban}  label="Project Health"     value={projTotal} sub={`${projActive} active · ${projDelayed} delayed`} color="#8B5CF6" href="/projects" />
        <StatCard icon={FileText}      label="Reports"            value={rptTotal}  sub={`${rptApproved} approved · ${rptOverdue} overdue`} color="#CE1126" href="/reports" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* KPI Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead icon={Target} color="#10B981"
            title="KPI Performance" desc="Target vs Actual — Red / Amber / Green"
            href="/kpi" linkLabel="View All KPIs" badge={kpiAtRisk + kpiOffTrack} />
          {kpiTotal === 0 ? (
            <EmptyPanel message="No KPIs defined yet" sub="Add indicators from the KPI Monitoring page." />
          ) : (
            <div className="space-y-2">
              <div className="flex gap-3 mb-3">
                {[
                  { label: 'On Track',  count: kpiOnTrack,  bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  { label: 'At Risk',   count: kpiAtRisk,   bg: 'bg-amber-50',   text: 'text-amber-700' },
                  { label: 'Off Track', count: kpiOffTrack, bg: 'bg-red-50',     text: 'text-red-700' },
                ].map(s => (
                  <div key={s.label} className={`flex-1 ${s.bg} rounded-lg p-2.5 text-center`}>
                    <p className={`text-lg font-black ${s.text}`}>{s.count}</p>
                    <p className={`text-[10px] font-semibold ${s.text}`}>{s.label}</p>
                  </div>
                ))}
              </div>
              {KPIS.slice(0, 5).map(k => {
                const progress = pct(k.actual, k.target)
                const rag: 'green' | 'amber' | 'red' = k.status === 'off-track' ? 'red' : k.status === 'at-risk' ? 'amber' : 'green'
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
            </div>
          )}
        </div>

        {/* Annual Work Plans */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <SectionHead icon={ClipboardList} color="#3B82F6"
            title="Annual Work Plans" desc="Submitted vs Approved — Alignment to strategy"
            href="/workplan" linkLabel="View Workplans" />
          {wpTotal === 0 ? (
            <EmptyPanel message="No work plans submitted yet" sub="Create and submit an annual work plan to begin tracking." />
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2 mb-1">
                {[
                  { label: 'Approved',  count: wpApproved, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  { label: 'Submitted', count: wpPending,  bg: 'bg-blue-50',    text: 'text-blue-700' },
                  { label: 'Draft',     count: wpDraft,    bg: 'bg-gray-100',   text: 'text-gray-600' },
                ].map(s => (
                  <div key={s.label} className={`flex-1 ${s.bg} rounded-lg px-3 py-2`}>
                    <p className={`text-lg font-black ${s.text}`}>{s.count}</p>
                    <p className={`text-[10px] font-semibold ${s.text} opacity-80`}>{s.label}</p>
                  </div>
                ))}
              </div>
              {WORKPLANS.slice(0, 5).map(w => (
                <div key={w.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <Rag status={w.status === 'approved' || w.status === 'active' ? 'green' : w.status === 'submitted' ? 'amber' : 'red'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{w.title}</p>
                    <p className="text-[10px] text-gray-400">{w.fiscalYear} · {w.division}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    w.status === 'approved' || w.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    w.status === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>{w.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Funding Requests */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><Send className="w-4 h-4 text-amber-600" /></div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                My Funding Requests
                {reqAcq > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-orange-500">{reqAcq} acquittal due</span>}
                {reqAcq === 0 && reqPending > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-amber-600">{reqPending}</span>}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Requests you submitted and their current approval status</p>
            </div>
          </div>
          <Link href="/requests" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {requests.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <p className="text-sm font-medium text-gray-600">No requests yet</p>
            <Link href="/requests" className="mt-1 flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-800">
              Submit a funding request <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.slice(0, 6).map(req => <RequestRow key={req.id} req={req} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 3. FINANCE MANAGER Dashboard                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function FinanceDashboard({ requests, workplans }: { requests: FundingRequest[]; workplans: ReturnType<typeof useWorkplan>['workplans'] }) {
  const inbox           = requests.filter(r => r.stage === 'pending_finance')
  const acquittalReview = requests.filter(r => r.stage === 'pending_acquittal_review')
  const approved        = requests.filter(r => r.finance.decision === 'approved' && r.stage !== 'closed' && r.stage !== 'pending_acquittal_review')
  const closed          = requests.filter(r => r.stage === 'closed')
  const rejected        = requests.filter(r => r.finance.decision === 'rejected')
  const deferred        = requests.filter(r => r.stage === 'deferred')

  const totalPending  = inbox.reduce((s, r) => s + r.amount, 0)
  const totalApproved = [...approved, ...closed, ...acquittalReview].reduce((s, r) => s + r.amount, 0)
  const totalAcquitted = closed.reduce((s, r) => s + r.amount, 0)
  const actionNeeded  = inbox.length + acquittalReview.length

  return (
    <div className="p-5 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock}        label="Awaiting Decision" value={actionNeeded}
          sub={fmt(totalPending) + ' pending'} color="#D97706" href="/finance" />
        <StatCard icon={CheckCircle2} label="Committed"         value={approved.length + closed.length + acquittalReview.length}
          sub={fmt(totalApproved) + ' approved'} color="#10B981" />
        <StatCard icon={Lock}         label="Acquitted & Closed" value={closed.length}
          sub={fmt(totalAcquitted) + ' closed'} color="#059669" />
        <StatCard icon={XCircle}      label="Rejected"           value={rejected.length}
          sub="Declined requests" color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Finance Inbox */}
        <div className="lg:col-span-2 space-y-5">

          {/* Pending finance decisions */}
          <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100"><Banknote className="w-4 h-4 text-amber-700" /></div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Awaiting Your Decision
                    {inbox.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-amber-600">{inbox.length}</span>}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Funding requests cleared by the full approval chain</p>
                </div>
              </div>
              <Link href="/finance" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Finance Desk <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {inbox.length === 0 ? (
              <EmptyPanel message="No pending finance decisions" sub="Requests will appear here once approved by the full chain." />
            ) : (
              <div className="divide-y divide-gray-50">
                {inbox.map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            )}
          </div>

          {/* Acquittal review */}
          {acquittalReview.length > 0 && (
            <div className="bg-white border border-teal-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-teal-100 bg-teal-50/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-100"><BookOpenCheck className="w-4 h-4 text-teal-700" /></div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      Acquittal Review Required
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-teal-600">{acquittalReview.length}</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">M&E Manager has submitted acquittal reports for your sign-off</p>
                  </div>
                </div>
                <Link href="/finance" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                  Review <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {acquittalReview.map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            </div>
          )}

          {/* Deferred */}
          {deferred.length > 0 && (
            <div className="bg-white border border-yellow-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-yellow-100 bg-yellow-50/40 flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-yellow-600" />
                <h2 className="text-sm font-bold text-gray-900">On Hold / Deferred</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-yellow-800 bg-yellow-100">{deferred.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {deferred.map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Work Plan */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Annual Work Plans</h2>
              </div>
              <Link href="/workplan" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {workplans.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">No work plans yet.</p>
            ) : (
              <div className="space-y-2">
                {workplans.slice(0, 3).map(wp => (
                  <div key={wp.id} className="border border-gray-100 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{wp.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                        wp.status === 'approved' || wp.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        wp.status === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{wp.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{wp.fiscalYear} · {wp.kras.length} KRAs</p>
                    <p className="text-[10px] font-semibold text-emerald-700 mt-1">Budget: {fmt(wp.budget)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Links</p>
            <div className="space-y-2">
              <QuickLink icon={Banknote}  label="Finance Desk"        href="/finance"  color="#10B981" />
              <QuickLink icon={PieChart}  label="Expenditure Budget"  href="/budget"   color="#D97706" />
              <QuickLink icon={ClipboardList} label="Annual Workplan" href="/workplan" color="#3B82F6" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Portfolio Overview</p>
            {[
              { label: 'Total Committed', value: fmt(totalApproved),  color: 'text-green-600' },
              { label: 'Fully Acquitted', value: fmt(totalAcquitted), color: 'text-emerald-600' },
              { label: 'Pending Amount',  value: fmt(totalPending),   color: 'text-amber-600' },
              { label: 'Rejected Total',  value: rejected.reduce((s, r) => s + r.amount, 0) > 0 ? fmt(rejected.reduce((s, r) => s + r.amount, 0)) : '—', color: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4. EXECUTIVE MANAGER Dashboard                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function ExecutiveDashboard({ requests, userName }: { requests: FundingRequest[]; userName: string }) {
  const myInbox    = requests.filter(r => r.stage === 'pending_em')
  const inProgress = requests.filter(r => !['closed','rejected','pending_em'].includes(r.stage))
  const closed     = requests.filter(r => r.stage === 'closed')
  const rejected   = requests.filter(r => r.stage === 'rejected')
  const deferred   = requests.filter(r => r.stage === 'deferred')

  // Corporate Plan priorities at a glance
  const priorities = [
    { title: 'Digital Government Delivery', prog: 68, color: '#3B82F6' },
    { title: 'ICT Infrastructure & Connectivity', prog: 55, color: '#10B981' },
    { title: 'Cyber Security & Data Governance', prog: 72, color: '#CE1126' },
    { title: 'Policy, Legislation & Standards', prog: 48, color: '#8B5CF6' },
    { title: 'Institutional Capacity & Human Capital', prog: 61, color: '#D97706' },
  ]

  return (
    <div className="p-5 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BadgeCheck}   label="Awaiting My Approval" value={myInbox.length}
          sub={myInbox.length > 0 ? 'Action required' : 'Inbox clear'} color="#7C3AED" href="/approvals" />
        <StatCard icon={Clock}        label="In Pipeline"           value={inProgress.length}
          sub="Moving through approvals" color="#D97706" />
        <StatCard icon={CheckCircle2} label="Closed Requests"       value={closed.length}
          sub="Fully acquitted" color="#10B981" />
        <StatCard icon={XCircle}      label="Rejected"              value={rejected.length}
          sub="Declined" color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Approvals Inbox */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100 bg-purple-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-100"><BadgeCheck className="w-4 h-4 text-purple-700" /></div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Pending Your Approval
                    {myInbox.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-purple-600">{myInbox.length}</span>}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Funding requests from M&E Manager awaiting your decision</p>
                </div>
              </div>
              <Link href="/approvals" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Go to Approvals <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {myInbox.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <p className="text-sm font-medium text-gray-600">Inbox clear</p>
                <p className="text-xs text-gray-400">No requests awaiting your approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myInbox.map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            )}
          </div>

          {/* In-progress pipeline overview */}
          {inProgress.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Requests in Pipeline</h2>
                <p className="text-xs text-gray-400 mt-0.5">Previously approved by you — moving through Deputy, DCS, Finance</p>
              </div>
              <div className="divide-y divide-gray-50">
                {inProgress.slice(0, 5).map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Corporate Plan progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Corporate Plan</h2>
              </div>
              <Link href="/corporate-plan" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {priorities.map(p => (
                <div key={p.title}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] text-gray-600 font-medium truncate max-w-[75%]">{p.title}</span>
                    <span className="text-[10px] font-black shrink-0" style={{ color: p.color }}>{p.prog}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.prog}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Links</p>
            <div className="space-y-2">
              <QuickLink icon={BadgeCheck}  label="Approvals"          href="/approvals"       color="#7C3AED" />
              <QuickLink icon={Network}     label="Organisation"        href="/organisation"    color="#3B82F6" />
              <QuickLink icon={BookMarked}  label="Corporate Plan"      href="/corporate-plan"  color="#10B981" />
              <QuickLink icon={PieChart}    label="Expenditure Budget"  href="/budget"          color="#D97706" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 5. DEPUTY SECRETARY Dashboard                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function DeputyDashboard({ requests }: { requests: FundingRequest[] }) {
  const myInbox    = requests.filter(r => r.stage === 'pending_deputy')
  const totalReqs  = requests.length
  const inProgress = requests.filter(r => !['closed','rejected'].includes(r.stage)).length
  const closed     = requests.filter(r => r.stage === 'closed').length
  const totalValue = requests.reduce((s, r) => s + r.amount, 0)
  const committedValue = requests.filter(r => r.stage === 'closed' || r.finance.decision === 'approved').reduce((s, r) => s + r.amount, 0)

  // Stage breakdown
  const stages: { stage: RequestStage; label: string; color: string }[] = [
    { stage: 'pending_em',      label: 'Exec. Manager', color: '#D97706' },
    { stage: 'pending_deputy',  label: 'Deputy Sec.',   color: '#7C3AED' },
    { stage: 'pending_dcs',     label: 'Dir. Corp. Svc',color: '#0D9488' },
    { stage: 'pending_finance', label: 'Finance',       color: '#2563EB' },
    { stage: 'closed',          label: 'Closed',        color: '#10B981' },
    { stage: 'rejected',        label: 'Rejected',      color: '#EF4444' },
  ]

  const priorities = [
    { title: 'Digital Govt Delivery', prog: 68, color: '#3B82F6' },
    { title: 'ICT Infrastructure',    prog: 55, color: '#10B981' },
    { title: 'Cyber Security',        prog: 72, color: '#CE1126' },
    { title: 'Policy & Standards',    prog: 48, color: '#8B5CF6' },
    { title: 'Capacity Building',     prog: 61, color: '#D97706' },
  ]

  return (
    <div className="p-5 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BadgeCheck}   label="Awaiting My Endorsement" value={myInbox.length}
          sub={myInbox.length > 0 ? 'Action required' : 'All clear'} color="#4F46E5" href="/approvals" />
        <StatCard icon={BarChart3}    label="Total Requests"           value={totalReqs}
          sub={`${inProgress} in progress`} color="#3B82F6" />
        <StatCard icon={CheckCircle2} label="Fully Closed"             value={closed}
          sub="Acquitted and closed" color="#10B981" />
        <StatCard icon={DollarSign}   label="Value Committed"          value={totalValue > 0 ? fmt(committedValue) : '—'}
          sub={totalValue > 0 ? `of ${fmt(totalValue)} total` : 'No data yet'} color="#D97706" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-5">

          {/* Endorsement inbox */}
          <div className="bg-white border border-indigo-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-100 bg-indigo-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-100"><BadgeCheck className="w-4 h-4 text-indigo-700" /></div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Pending Your Endorsement
                    {myInbox.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-indigo-600">{myInbox.length}</span>}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Requests approved by Executive Manager — awaiting your sign-off</p>
                </div>
              </div>
              <Link href="/approvals" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Go to Approvals <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {myInbox.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <p className="text-sm font-medium text-gray-600">No pending endorsements</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myInbox.map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            )}
          </div>

          {/* Full pipeline breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <SectionHead icon={BarChart3} color="#4F46E5"
              title="Full Funding Pipeline" desc="System-wide request status across all approval stages" />
            {totalReqs === 0 ? (
              <EmptyPanel message="No requests in the system" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stages.map(s => {
                  const count = requests.filter(r => r.stage === s.stage).length
                  return (
                    <div key={s.stage} className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                      <p className="text-xl font-black" style={{ color: s.color }}>{count}</p>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Functional Areas overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Functional Areas</h2>
              </div>
              <Link href="/organisation" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {FUNCTIONAL_AREAS.map(fa => (
                <div key={fa.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${fa.color} border ${fa.borderColor}`}>
                  <Building2 className={`w-3.5 h-3.5 ${fa.textColor} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold ${fa.textColor} truncate`}>{fa.shortTitle}</p>
                    <p className="text-[10px] text-gray-500">{fa.programs.length} programs · {fa.head}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corporate Plan */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Strategic Progress</h2>
              </div>
              <Link href="/corporate-plan" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {priorities.map(p => (
                <div key={p.title}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-gray-600 truncate max-w-[75%]">{p.title}</span>
                    <span className="text-[10px] font-black" style={{ color: p.color }}>{p.prog}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.prog}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 6. DIRECTOR CORPORATE SERVICES Dashboard                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function DCSDashboard({ requests }: { requests: FundingRequest[] }) {
  const myInbox    = requests.filter(r => r.stage === 'pending_dcs')
  const inProgress = requests.filter(r => !['closed','rejected'].includes(r.stage)).length
  const closed     = requests.filter(r => r.stage === 'closed').length
  const rejected   = requests.filter(r => r.stage === 'rejected').length

  // Corporate services metrics (static — sourced from org structure)
  const csArea = FUNCTIONAL_AREAS.find(fa => fa.id === 'corporate')
  const csPrograms = csArea?.programs ?? []

  const hrMetrics = [
    { label: 'Total Positions',       value: 45, color: '#3B82F6' },
    { label: 'Positions Filled',      value: 35, color: '#10B981' },
    { label: 'Vacancies',             value: 10, color: '#EF4444' },
    { label: 'Staff Trained (YTD)',   value: 55, color: '#D97706' },
  ]

  return (
    <div className="p-5 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BadgeCheck}   label="Awaiting My Approval" value={myInbox.length}
          sub={myInbox.length > 0 ? 'Action required' : 'All clear'} color="#0D9488" href="/approvals" />
        <StatCard icon={Clock}        label="In Progress"           value={inProgress}
          sub="Across pipeline" color="#D97706" />
        <StatCard icon={CheckCircle2} label="Closed"                value={closed}
          sub="Fully resolved" color="#10B981" />
        <StatCard icon={Briefcase}    label="Corporate Programs"    value={csPrograms.length}
          sub="HR · Finance · IT" color="#8B5CF6" href="/organisation" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-5">

          {/* DCS Approval inbox */}
          <div className="bg-white border border-teal-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-teal-100 bg-teal-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-100"><BadgeCheck className="w-4 h-4 text-teal-700" /></div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Pending Your Approval
                    {myInbox.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-teal-600">{myInbox.length}</span>}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Requests endorsed by Deputy Secretary — require your sign-off before Finance</p>
                </div>
              </div>
              <Link href="/approvals" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Go to Approvals <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {myInbox.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <p className="text-sm font-medium text-gray-600">No pending approvals</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myInbox.map(req => <RequestRow key={req.id} req={req} />)}
              </div>
            )}
          </div>

          {/* Corporate Services Programs */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <SectionHead icon={Briefcase} color="#8B5CF6"
              title="Corporate Services Programs" desc="HR · Finance & Admin · Information Technology"
              href="/organisation" linkLabel="View Org Structure" />
            {csPrograms.length === 0 ? (
              <EmptyPanel message="No programs defined" />
            ) : (
              <div className="space-y-3">
                {csPrograms.map(prog => (
                  <div key={prog.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-800">{prog.title}</p>
                      <span className="text-[10px] text-gray-400">{prog.activities.length} activities</span>
                    </div>
                    <div className="space-y-1">
                      {prog.activities.map((act, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Activity className="w-3 h-3 text-gray-300 shrink-0" />
                          <span className="text-[11px] text-gray-600">{act.title}</span>
                          {act.manager && <span className="text-[10px] text-gray-400 ml-auto">{act.manager}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* HR Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">HR Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {hrMetrics.map(m => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Staff filled</span>
                <span className="font-semibold text-emerald-600">{Math.round((35/45)*100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((35/45)*100)}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Links</p>
            <div className="space-y-2">
              <QuickLink icon={BadgeCheck}  label="Approvals"          href="/approvals"       color="#0D9488" />
              <QuickLink icon={Network}     label="Organisation"        href="/organisation"    color="#3B82F6" />
              <QuickLink icon={PieChart}    label="Expenditure Budget"  href="/budget"          color="#D97706" />
              <QuickLink icon={BookMarked}  label="Corporate Plan"      href="/corporate-plan"  color="#8B5CF6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* 7. OFFICER Dashboard                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
function OfficerDashboard({ userName }: { userName: string }) {
  const { officers, tasksByOfficer } = useTeam()

  const myRecord = officers.find(o => o.name === userName)
  const myTasks  = myRecord ? tasksByOfficer(myRecord.id) : []

  const total     = myTasks.length
  const pending   = myTasks.filter(t => t.status === 'pending').length
  const inProg    = myTasks.filter(t => t.status === 'in_progress').length
  const completed = myTasks.filter(t => t.status === 'completed').length
  const overdue   = myTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length
  const compPct   = total > 0 ? Math.round((completed / total) * 100) : 0

  const recent = [...myTasks]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const PRIORITY_DOT: Record<string, string> = {
    low: 'bg-gray-400', medium: 'bg-blue-500', high: 'bg-amber-500', urgent: 'bg-red-500',
  }

  return (
    <div className="p-5 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ClipboardList} label="Total Tasks"  value={total}     color="#3B82F6" href="/my-tasks" />
        <StatCard icon={Activity}      label="In Progress"  value={inProg}    color="#D97706" href="/my-tasks" />
        <StatCard icon={CheckCircle2}  label="Completed"    value={completed} color="#10B981" href="/my-tasks" />
        <StatCard icon={AlertTriangle} label="Overdue"      value={overdue}   sub={overdue > 0 ? 'Action needed' : 'All clear'} color="#EF4444" href="/my-tasks" />
      </div>

      {/* Completion bar */}
      {total > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-gray-800">Overall Task Completion</span>
            </div>
            <span className="text-sm font-black text-emerald-600">{compPct}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${compPct}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-gray-400">
            <span>{completed} completed</span>
            <span>{inProg} in progress</span>
            <span>{pending} pending</span>
            {overdue > 0 && <span className="text-red-600 font-semibold">{overdue} overdue</span>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Task list */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50"><ClipboardList className="w-4 h-4 text-blue-700" /></div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">My Active Tasks</h2>
                <p className="text-xs text-gray-400">Sorted by due date</p>
              </div>
            </div>
            <Link href="/my-tasks" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyPanel message="No tasks assigned yet" sub="Your manager will assign tasks to you." />
          ) : (
            <ul>
              {recent.map(t => {
                const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed'
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Due {t.dueDate} · by {t.assignedBy}
                        {isOverdue && <span className="ml-1 text-red-600 font-semibold">· Overdue</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-black text-gray-700">{t.progress}%</div>
                      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Links</p>
            <div className="space-y-2">
              <QuickLink icon={ClipboardList} label="My Tasks"        href="/my-tasks"        color="#3B82F6" />
              <QuickLink icon={UserCircle}    label="My Profile"      href="/profile"         color="#8B5CF6" />
              <QuickLink icon={Network}       label="Organisation"    href="/organisation"    color="#D97706" />
              <QuickLink icon={BookMarked}    label="Corporate Plan"  href="/corporate-plan"  color="#10B981" />
            </div>
          </div>
          {myRecord && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">My Details</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div><span className="font-semibold text-gray-900">Position:</span> {myRecord.position}</div>
                <div><span className="font-semibold text-gray-900">Division:</span> {myRecord.division}</div>
                {myRecord.program && <div><span className="font-semibold text-gray-900">Program:</span> {myRecord.program}</div>}
                <div><span className="font-semibold text-gray-900">Reporting to:</span> {myRecord.createdBy}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Page — routes to the correct role dashboard                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function OverviewPage() {
  const { user } = useAuth()
  const { requests } = useFunding()
  const { workplans } = useWorkplan()
  if (!user) return null

  const myRequests = user.role === 'admin'
    ? requests.filter(r => r.submittedBy === user.name)
    : requests

  const now = new Date().toLocaleDateString('en-PG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  /* Per-role banner CTA */
  const bannerLink =
    user.role === 'admin'     ? { href: '/requests',  label: 'New Funding Request' } :
    user.role === 'executive' ? { href: '/approvals', label: 'Review Approvals'    } :
    user.role === 'deputy'    ? { href: '/approvals', label: 'Review Endorsements' } :
    user.role === 'dcs'       ? { href: '/approvals', label: 'Review Approvals'    } :
    user.role === 'finance'   ? { href: '/finance',   label: 'Finance Desk'        } :
    user.role === 'super'     ? { href: '/users',     label: 'User Management'     } :
    user.role === 'officer'   ? { href: '/my-tasks',  label: 'View My Tasks'       } :
    null

  /* Alert: acquittal due (admin only) */
  const acquittalDue = user.role === 'admin'
    ? myRequests.filter(r => r.stage === 'pending_acquittal').length
    : 0

  /* Action badges per role */
  const actionBadge =
    user.role === 'executive' ? requests.filter(r => r.stage === 'pending_em').length :
    user.role === 'deputy'    ? requests.filter(r => r.stage === 'pending_deputy').length :
    user.role === 'dcs'       ? requests.filter(r => r.stage === 'pending_dcs').length :
    user.role === 'finance'   ? requests.filter(r => r.stage === 'pending_finance' || r.stage === 'pending_acquittal_review').length :
    0

  return (
    <div className="flex flex-col min-h-full">

      {/* Welcome banner */}
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
          <div className="flex items-center gap-2 shrink-0">
            {actionBadge > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-white bg-red-500 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" /> {actionBadge} action{actionBadge > 1 ? 's' : ''} required
              </span>
            )}
            {bannerLink && (
              <Link href={bannerLink.href}
                className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
                {bannerLink.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
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

      {/* Role-specific dashboard body */}
      {user.role === 'super'     && <SuperDashboard    requests={requests}   workplans={workplans} />}
      {user.role === 'admin'     && <MEDashboard        requests={myRequests} />}
      {user.role === 'finance'   && <FinanceDashboard   requests={requests}   workplans={workplans} />}
      {user.role === 'executive' && <ExecutiveDashboard requests={requests}   userName={user.name} />}
      {user.role === 'deputy'    && <DeputyDashboard    requests={requests} />}
      {user.role === 'dcs'       && <DCSDashboard       requests={requests} />}
      {user.role === 'officer'   && <OfficerDashboard   userName={user.name} />}
    </div>
  )
}
