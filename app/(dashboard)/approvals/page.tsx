'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import { redirect } from 'next/navigation'
import {
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, FileText,
  RefreshCw, PauseCircle, PlayCircle,
} from 'lucide-react'
import type { FundingRequest, RequestStage } from '@/types'
import { REQUEST_TYPE_CFG } from '@/types'
import { AttachmentList, RequestMeta, AuditTrail } from '@/app/(dashboard)/requests/page'

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000 ? `K${(n / 1_000_000).toFixed(2)}M` : `K${(n / 1_000).toFixed(0)}K`

function TrackerBar({ req, highlightStage }: { req: FundingRequest; highlightStage: 'em' | 'deputy' | 'dcs' }) {
  const cfg = REQUEST_TYPE_CFG[req.requestType ?? 'funding']
  const STEP_LABELS: Record<string, string> = {
    em: 'Executive', deputy: 'Deputy', dcs: 'Director', finance: 'Secretary',
  }
  const stepKeys = cfg.steps
  return (
    <div className="flex items-center gap-0 mt-3">
      {stepKeys.map((key, i) => {
        const entry    = req[key as 'em' | 'deputy' | 'dcs' | 'finance']
        const done     = entry.decision === 'approved'
        const rejected = entry.decision === 'rejected'
        const deferred = entry.decision === 'deferred'
        const isActive = key === highlightStage && entry.decision === 'pending'
        return (
          <div key={key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                done     ? 'bg-green-500 border-green-500 text-white' :
                rejected ? 'bg-red-500 border-red-500 text-white' :
                deferred ? 'bg-yellow-400 border-yellow-400 text-white' :
                isActive ? 'bg-blue-600 border-blue-600 text-white' :
                           'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? '✓' : rejected ? '✗' : deferred ? '⏸' : i + 1}
              </div>
              <p className={`text-[10px] mt-1 font-medium text-center ${
                done ? 'text-green-600' : rejected ? 'text-red-500' : deferred ? 'text-yellow-700' : isActive ? 'text-blue-700 font-bold' : 'text-gray-400'
              }`}>{STEP_LABELS[key]}</p>
            </div>
            {i < stepKeys.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Decision card ─────────────────────────────────────────────────────────── */
function RequestCard({
  req, stage, onDecide, onDefer,
}: {
  req: FundingRequest
  stage: 'em' | 'deputy' | 'dcs'
  onDecide: (id: string, decision: 'approved' | 'rejected', comment: string) => Promise<void>
  onDefer: (id: string, reason: string) => Promise<void>
}) {
  const [open, setOpen]         = useState(false)
  const [comment, setComment]   = useState('')
  const [deciding, setDeciding] = useState(false)
  const [showDefer, setShowDefer] = useState(false)
  const [deferReason, setDeferReason] = useState('')
  const [deferring, setDeferring] = useState(false)
  const [deferError, setDeferError] = useState('')

  async function handle(decision: 'approved' | 'rejected') {
    setDeciding(true)
    await onDecide(req.id, decision, comment)
    setDeciding(false)
  }

  async function handleDefer() {
    if (!deferReason.trim()) { setDeferError('Please provide a reason for deferring.'); return }
    setDeferring(true)
    await onDefer(req.id, deferReason)
    setDeferring(false)
  }

  const alreadyDecided = req[stage].decision !== 'pending'

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
              {REQUEST_TYPE_CFG[req.requestType ?? 'funding'].label}
            </span>
            <span className="text-xs text-gray-400">{req.submittedBy}{req.division ? ` · ${req.division}` : ''} · {req.submittedAt}</span>
            <span className="text-xs text-gray-400">{req.fiscalYear}</span>
          </div>
        </div>
        {req.amount > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-black text-gray-900">{fmt(req.amount)}</p>
          </div>
        )}
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-gray-100 space-y-3">
          {/* Description */}
          <div className="flex items-start gap-2 bg-gray-50 rounded p-3 mt-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
          </div>

          <RequestMeta req={req} />

          <TrackerBar req={req} highlightStage={stage} />

          <AttachmentList attachments={req.attachments ?? []} />

          <AuditTrail req={req} />

          {!alreadyDecided && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Comment <span className="text-gray-400 font-normal">(optional — passed to next approver)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a note for the next approver…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handle('approved')}
                  disabled={deciding || deferring}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => handle('rejected')}
                  disabled={deciding || deferring}
                  className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => { setShowDefer(v => !v); setDeferError('') }}
                  disabled={deciding || deferring}
                  className="flex items-center gap-1.5 bg-yellow-500 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-60 transition-colors"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  Defer / Hold
                </button>
              </div>

              {showDefer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-yellow-800">Defer this request</p>
                  <p className="text-[11px] text-yellow-700">The request will be placed on hold. The M&amp;E Manager will be notified. Provide a reason below.</p>
                  {deferError && <p className="text-xs text-red-600">{deferError}</p>}
                  <textarea
                    rows={2}
                    placeholder="Reason for deferring (e.g. pending budget confirmation, missing documentation)…"
                    value={deferReason}
                    onChange={e => { setDeferReason(e.target.value); setDeferError('') }}
                    className="w-full border border-yellow-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none bg-white"
                  />
                  <button
                    onClick={handleDefer}
                    disabled={deferring}
                    className="flex items-center gap-1.5 bg-yellow-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-60 transition-colors"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    {deferring ? 'Deferring…' : 'Confirm Defer'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Deferred card ─────────────────────────────────────────────────────────── */
function DeferredCard({
  req, stage, onResume,
}: {
  req: FundingRequest
  stage: 'em' | 'deputy' | 'dcs'
  onResume: (id: string) => Promise<void>
}) {
  const [resuming, setResuming] = useState(false)
  const entry = req[stage]

  async function handle() {
    setResuming(true)
    await onResume(req.id)
    setResuming(false)
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-start gap-3">
      <PauseCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
        <p className="text-xs text-gray-500 mt-0.5">{req.submittedBy} · {fmt(req.amount)} · {req.fiscalYear}</p>
        {entry.comment && (
          <p className="text-xs text-yellow-800 mt-1 italic">&ldquo;{entry.comment}&rdquo;</p>
        )}
        <p className="text-[10px] text-yellow-600 mt-1">Deferred by {entry.by} on {entry.at}</p>
      </div>
      <button
        onClick={handle}
        disabled={resuming}
        className="shrink-0 flex items-center gap-1.5 bg-white border border-yellow-300 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-yellow-100 disabled:opacity-60 transition-colors"
      >
        <PlayCircle className="w-3.5 h-3.5" />
        {resuming ? 'Resuming…' : 'Resume'}
      </button>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function ApprovalsPage() {
  const { user } = useAuth()
  if (user && user.role !== 'executive' && user.role !== 'deputy' && user.role !== 'dcs') redirect('/dashboard')

  const { requests, decide, defer, resumeDeferred, reload, isLoading } = useFunding()
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const stage = user?.role === 'executive' ? 'em' : user?.role === 'dcs' ? 'dcs' : 'deputy'
  const stageFilter = stage === 'em' ? 'pending_em' : stage === 'dcs' ? 'pending_dcs' : 'pending_deputy'

  const pending  = requests.filter(r => r.stage === stageFilter)
  const deferred = requests.filter(r => r.stage === 'deferred' && r[stage].decision === 'deferred')
  const decided  = requests.filter(r => r[stage].decision === 'approved' || r[stage].decision === 'rejected')

  async function handleDecide(id: string, decision: 'approved' | 'rejected', comment: string) {
    if (!user) return
    setError(null)
    try {
      const req = requests.find(r => r.id === id)
      await decide(id, stage, decision, user.name, comment || undefined, undefined, req?.requestType)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save decision. Please try again.')
    }
  }

  async function handleDefer(id: string, reason: string) {
    if (!user) return
    setError(null)
    try {
      await defer(id, stage, user.name, reason, stageFilter as RequestStage)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to defer request. Please try again.')
    }
  }

  async function handleResume(id: string) {
    setError(null)
    try {
      await resumeDeferred(id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to resume request. Please try again.')
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    setError(null)
    await reload()
    setRefreshing(false)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            {stage === 'em' ? 'Executive' : stage === 'deputy' ? 'Deputy' : 'Director'} — Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stage === 'em'
              ? 'Review funding requests submitted by Managers'
              : stage === 'deputy'
              ? 'Review requests endorsed by the Executive'
              : 'Review requests endorsed by the Deputy before Secretary allocation'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-xl font-black text-amber-700">{pending.length}</p>
          <p className="text-[11px] text-amber-600">Pending</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <PauseCircle className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
          <p className="text-xl font-black text-yellow-700">{deferred.length}</p>
          <p className="text-[11px] text-yellow-600">Deferred</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-black text-green-700">{decided.filter(r => r[stage].decision === 'approved').length}</p>
          <p className="text-[11px] text-green-600">Approved</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <XCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
          <p className="text-xl font-black text-red-700">{decided.filter(r => r[stage].decision === 'rejected').length}</p>
          <p className="text-[11px] text-red-600">Rejected</p>
        </div>
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            Pending Your Approval
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </h2>
          {pending.map(req => (
            <RequestCard key={req.id} req={req} stage={stage} onDecide={handleDecide} onDefer={handleDefer} />
          ))}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading requests…</p>
        </div>
      )}

      {!isLoading && pending.length === 0 && deferred.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">All caught up</p>
          <p className="text-xs text-gray-400 mt-1">No requests pending your approval.</p>
        </div>
      )}

      {/* Deferred */}
      {deferred.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-yellow-700 flex items-center gap-2">
            <PauseCircle className="w-4 h-4" />
            Deferred / On Hold
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{deferred.length}</span>
          </h2>
          {deferred.map(req => (
            <DeferredCard key={req.id} req={req} stage={stage} onResume={handleResume} />
          ))}
        </div>
      )}

      {/* History */}
      {decided.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-700">Decision History</h2>
          {decided.map(req => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
              {req[stage].decision === 'approved'
                ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
                <p className="text-xs text-gray-400">{req[stage].at} · {req[stage].comment || 'No comment'}</p>
              </div>
              <p className="text-sm font-bold text-gray-700 shrink-0">{fmt(req.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
