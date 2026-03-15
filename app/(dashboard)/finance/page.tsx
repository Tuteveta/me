'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Banknote, CheckCircle2, XCircle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, FileText, TrendingUp, BarChart3,
  BookOpenCheck, Lock, ClipboardList, ArrowRight, Plus,
} from 'lucide-react'
import type { FundingRequest } from '@/types'
import { useWorkplan } from '@/lib/workplan-context'
import { AttachmentList } from '@/app/(dashboard)/requests/page'

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000 ? `K${(n / 1_000_000).toFixed(2)}M` : `K${(n / 1_000).toFixed(0)}K`

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100)))

/* ── Approval trail ────────────────────────────────────────────────────────── */
function ApprovalTrail({ req }: { req: FundingRequest }) {
  return (
    <div className="flex gap-4 mt-3">
      {[
        { label: 'Exec. Manager',  entry: req.em },
        { label: 'Deputy Sec.',    entry: req.deputy },
        { label: 'Dir. Corp. Svc', entry: req.dcs },
      ].map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-gray-600">{s.label}</p>
            <p className="text-[10px] text-gray-400">{s.entry.by} · {s.entry.at}</p>
            {s.entry.comment && <p className="text-[10px] text-gray-400 italic">&ldquo;{s.entry.comment}&rdquo;</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Pending request card ──────────────────────────────────────────────────── */
function RequestCard({ req, kraOptions, onDecide }: {
  req: FundingRequest
  kraOptions: string[]
  onDecide: (id: string, decision: 'approved' | 'rejected', comment: string, budgetLine: string) => Promise<void>
}) {
  const [open, setOpen]           = useState(false)
  const [comment, setComment]     = useState('')
  const [budgetLine, setBudgetLine] = useState('')
  const [deciding, setDeciding]   = useState(false)

  const decided = req.finance.decision !== 'pending'

  async function handle(decision: 'approved' | 'rejected') {
    if (decision === 'rejected' && !comment.trim()) {
      alert('Please provide a reason for rejection.')
      return
    }
    setDeciding(true)
    await onDecide(req.id, decision, comment, budgetLine)
    setDeciding(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs text-gray-400">{req.submittedBy} · {req.submittedAt} · {req.fiscalYear}</span>
            {!decided && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
                Awaiting Decision
              </span>
            )}
            {req.budgetLine && (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                {req.budgetLine}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm font-black text-gray-900 shrink-0">{fmt(req.amount)}</p>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-gray-100 space-y-3">
          <div className="flex items-start gap-2 bg-gray-50 rounded p-3 mt-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
          </div>

          <AttachmentList attachments={req.attachments ?? []} />

          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Prior Approvals</p>
            <ApprovalTrail req={req} />
          </div>

          {!decided && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {/* Budget line selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Charge to Work Plan Budget Line
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                {kraOptions.length > 0 ? (
                  <select
                    value={budgetLine}
                    onChange={e => setBudgetLine(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Not assigned to a work plan line —</option>
                    {kraOptions.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                    <p className="text-xs text-gray-400">No work plan lines available.</p>
                    <Link href="/workplan" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                      Create Work Plan <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Funding Decision Notes
                  <span className="text-gray-400 font-normal ml-1">(required for rejection)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="State fund availability and any conditions or reasons…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handle('approved')} disabled={deciding}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve Funding
                </button>
                <button onClick={() => handle('rejected')} disabled={deciding}
                  className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60 transition-colors">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          )}

          {decided && (
            <div className={`flex items-start gap-2 rounded p-3 border mt-2 ${
              req.finance.decision === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              {req.finance.decision === 'approved'
                ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              }
              <div>
                <p className="text-xs font-semibold text-gray-700 capitalize">
                  {req.finance.decision} by {req.finance.by} on {req.finance.at}
                </p>
                {req.finance.comment && <p className="text-xs text-gray-600 mt-0.5">{req.finance.comment}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Closed record card ────────────────────────────────────────────────────── */
function ClosedCard({ req }: { req: FundingRequest }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
              <Lock className="w-3 h-3" /> Closed
            </span>
            <span className="text-xs text-gray-400">{req.submittedBy} · {req.fiscalYear}</span>
            {req.budgetLine && (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                {req.budgetLine}
              </span>
            )}
            {req.acquittal && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                <BookOpenCheck className="w-3 h-3" /> Acquittal {req.acquittal.submittedAt}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm font-black text-gray-900 shrink-0">{fmt(req.amount)}</p>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-gray-100 space-y-3">
          <div className="flex items-start gap-2 bg-gray-50 rounded p-3 mt-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
          </div>
          <AttachmentList attachments={req.attachments ?? []} />
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded p-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-700">
                Approved by {req.finance.by} on {req.finance.at}
              </p>
              {req.finance.comment && <p className="text-xs text-gray-600 mt-0.5">{req.finance.comment}</p>}
            </div>
          </div>
          {req.acquittal && (
            <div className="border border-emerald-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-emerald-200">
                <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Acquittal Report · {req.acquittal.submittedAt}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-gray-700 leading-relaxed">{req.acquittal.notes}</p>
                <AttachmentList attachments={req.acquittal.attachments} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function FinancePage() {
  const { user } = useAuth()
  if (user && user.role !== 'finance') redirect('/dashboard')

  const { requests, decide } = useFunding()
  const { workplans } = useWorkplan()

  const inbox    = requests.filter(r => r.stage === 'pending_finance')
  const approved = requests.filter(r => r.finance.decision === 'approved' && r.stage !== 'closed')
  const rejected = requests.filter(r => r.finance.decision === 'rejected')
  const closed   = requests.filter(r => r.stage === 'closed')
  const totalPending  = inbox.reduce((s, r) => s + r.amount, 0)
  const totalApproved = [...approved, ...closed].reduce((s, r) => s + r.amount, 0)
  const totalAcquitted = closed.reduce((s, r) => s + r.amount, 0)

  // Finance's own work plans + KRA budget lines for the dropdown
  const financeWorkplans = workplans  // Finance sees all plans; filter by division if needed
  const kraOptions = financeWorkplans.flatMap(wp =>
    wp.kras.map(k => `${wp.fiscalYear} › ${k.title || 'Untitled KRA'}`)
  )

  // Group approved/closed requests by division (submitter) for allocation overview
  const byDivision = [...approved, ...closed].reduce<Record<string, { amount: number; count: number; acquitted: number }>>((acc, r) => {
    const div = r.programme
    if (!acc[div]) acc[div] = { amount: 0, count: 0, acquitted: 0 }
    acc[div].amount += r.amount
    acc[div].count++
    if (r.stage === 'closed') acc[div].acquitted += r.amount
    return acc
  }, {})

  // Budget utilisation per work plan KRA
  const kraUtilisation = financeWorkplans.flatMap(wp =>
    wp.kras.map(k => {
      const label = `${wp.fiscalYear} › ${k.title || 'Untitled KRA'}`
      const committed = [...approved, ...closed].filter(r => r.budgetLine === label).reduce((s, r) => s + r.amount, 0)
      return { label, budget: wp.budget / Math.max(wp.kras.length, 1), committed }
    })
  )

  async function handleDecide(id: string, decision: 'approved' | 'rejected', comment: string, budgetLine: string) {
    if (!user) return
    await decide(id, 'finance', decision, user.name, comment || undefined, budgetLine || undefined)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Work plan management · Division funding allocation · Acquittal records
          </p>
        </div>
        <Link href="/workplan"
          className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors shrink-0">
          <ClipboardList className="w-3.5 h-3.5" /> My Work Plan
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pending</span>
          </div>
          <p className="text-2xl font-black text-amber-700">{inbox.length}</p>
          <p className="text-xs text-amber-600 mt-0.5">{fmt(totalPending)} awaiting decision</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Committed</span>
          </div>
          <p className="text-2xl font-black text-green-700">{approved.length + closed.length}</p>
          <p className="text-xs text-green-600 mt-0.5">{fmt(totalApproved)} approved</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Acquitted</span>
          </div>
          <p className="text-2xl font-black text-emerald-700">{closed.length}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{fmt(totalAcquitted)} fully closed</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Rejected</span>
          </div>
          <p className="text-2xl font-black text-red-700">{rejected.length}</p>
          <p className="text-xs text-red-600 mt-0.5">{fmt(rejected.reduce((s, r) => s + r.amount, 0))} declined</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Inbox */}
          {inbox.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Awaiting Your Decision</h2>
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {inbox.length} pending
                </span>
              </div>
              {inbox.map(req => (
                <RequestCard key={req.id} req={req} kraOptions={kraOptions} onDecide={handleDecide} />
              ))}
            </div>
          )}

          {/* Approved — awaiting acquittal */}
          {approved.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Approved — Awaiting Acquittal</h2>
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {approved.length}
                </span>
              </div>
              {approved.map(req => (
                <RequestCard key={req.id} req={req} kraOptions={kraOptions} onDecide={handleDecide} />
              ))}
            </div>
          )}

          {/* Acquittal records */}
          {closed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-900">Acquittal Records</h2>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {closed.length}
                </span>
              </div>
              {closed.map(req => <ClosedCard key={req.id} req={req} />)}
            </div>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-700">Rejected</h2>
              {rejected.map(req => (
                <RequestCard key={req.id} req={req} kraOptions={kraOptions} onDecide={handleDecide} />
              ))}
            </div>
          )}

          {inbox.length === 0 && approved.length === 0 && closed.length === 0 && rejected.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">No requests yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Requests appear here once approved by the Executive Manager and Deputy Secretary.
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Work Plan summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Annual Work Plan</h2>
              </div>
              <Link href="/workplan"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {financeWorkplans.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-xs text-gray-400">No work plan yet.</p>
                <Link href="/workplan"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                  <Plus className="w-3 h-3" /> Create Work Plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {financeWorkplans.slice(0, 3).map(wp => (
                  <div key={wp.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{wp.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                        wp.status === 'approved' || wp.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        wp.status === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{wp.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{wp.fiscalYear} · {wp.kras.length} KRAs</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Budget</span>
                        <span className="font-semibold text-gray-700">{fmt(wp.budget)}</span>
                      </div>
                      {wp.kras.slice(0, 3).map((k, i) => (
                        <p key={k.id} className="text-[10px] text-gray-400 truncate">
                          KRA {i + 1}: {k.title || 'Untitled'}
                        </p>
                      ))}
                      {wp.kras.length > 3 && (
                        <p className="text-[10px] text-gray-400">+{wp.kras.length - 3} more KRAs</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Division allocation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Division Allocations</h2>
            </div>

            {Object.keys(byDivision).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">No allocations yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byDivision).map(([div, data]) => (
                  <div key={div}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[65%]">{div}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">{data.count} req.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct(data.acquitted, data.amount)}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 shrink-0">{fmt(data.amount)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {fmt(data.acquitted)} acquitted of {fmt(data.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KRA budget utilisation */}
          {kraUtilisation.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-gray-900">Budget Line Utilisation</h2>
              </div>
              <div className="space-y-3">
                {kraUtilisation.map(k => {
                  const used = pct(k.committed, k.budget)
                  return (
                    <div key={k.label}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[65%]">{k.label}</span>
                        <span className={`text-[10px] font-bold shrink-0 ${used > 90 ? 'text-red-600' : used > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {used}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${used}%`, background: used > 90 ? '#EF4444' : used > 70 ? '#F59E0B' : '#10B981' }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {fmt(k.committed)} of {fmt(k.budget)} allocated
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action alert */}
          {inbox.length > 0 && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Action Required</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {inbox.length} request{inbox.length > 1 ? 's' : ''} totalling{' '}
                  <span className="font-bold">{fmt(totalPending)}</span> await your decision.
                </p>
              </div>
            </div>
          )}

          {/* Overview stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Overview</p>
            {[
              { icon: TrendingUp,    label: 'Total Committed',   value: fmt(totalApproved),    color: 'text-green-600' },
              { icon: BookOpenCheck, label: 'Fully Acquitted',   value: fmt(totalAcquitted),   color: 'text-emerald-600' },
              { icon: BarChart3,     label: 'Requests Handled',  value: `${approved.length + closed.length + rejected.length}`, color: 'text-purple-600' },
              { icon: Banknote,      label: 'Pending Amount',    value: fmt(totalPending),     color: 'text-amber-600' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
