'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import { redirect } from 'next/navigation'
import {
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, FileText, AlertTriangle,
} from 'lucide-react'
import type { FundingRequest } from '@/types'
import { AttachmentList } from '@/app/(dashboard)/requests/page'

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000 ? `K${(n / 1_000_000).toFixed(2)}M` : `K${(n / 1_000).toFixed(0)}K`

function TrackerBar({ req, highlightStage }: { req: FundingRequest; highlightStage: 'em' | 'deputy' }) {
  const steps = [
    { key: 'em' as const,      label: 'Exec. Manager', entry: req.em },
    { key: 'deputy' as const,  label: 'Deputy Sec.',   entry: req.deputy },
    { key: 'finance' as const, label: 'Finance',        entry: req.finance },
  ]
  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((s, i) => {
        const done     = s.entry.decision === 'approved'
        const rejected = s.entry.decision === 'rejected'
        const isActive = s.key === highlightStage && s.entry.decision === 'pending'
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                done     ? 'bg-green-500 border-green-500 text-white' :
                rejected ? 'bg-red-500 border-red-500 text-white' :
                isActive ? 'bg-blue-600 border-blue-600 text-white' :
                           'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? '✓' : rejected ? '✗' : i + 1}
              </div>
              <p className={`text-[10px] mt-1 font-medium text-center ${
                done ? 'text-green-600' : rejected ? 'text-red-500' : isActive ? 'text-blue-700 font-bold' : 'text-gray-400'
              }`}>{s.label}</p>
            </div>
            {i < steps.length - 1 && (
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
  req, stage, onDecide,
}: {
  req: FundingRequest
  stage: 'em' | 'deputy'
  onDecide: (id: string, decision: 'approved' | 'rejected', comment: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [deciding, setDeciding] = useState(false)

  async function handle(decision: 'approved' | 'rejected') {
    setDeciding(true)
    await new Promise(r => setTimeout(r, 300))
    onDecide(req.id, decision, comment)
    setDeciding(false)
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
            <span className="text-xs text-gray-400">{req.submittedBy} · {req.submittedAt}</span>
            <span className="text-xs text-gray-400">{req.fiscalYear}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-black text-gray-900">{fmt(req.amount)}</p>
        </div>
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

          <TrackerBar req={req} highlightStage={stage} />

          <AttachmentList attachments={req.attachments ?? []} />

          {/* Prior comment from EM (shown to Deputy) */}
          {stage === 'deputy' && req.em.comment && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-blue-700">Exec. Manager Note</p>
                <p className="text-xs text-blue-600 mt-0.5">{req.em.comment}</p>
              </div>
            </div>
          )}

          {!alreadyDecided && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Comment <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a note for the next approver…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handle('approved')}
                  disabled={deciding}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => handle('rejected')}
                  disabled={deciding}
                  className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function ApprovalsPage() {
  const { user } = useAuth()
  if (user && user.role !== 'executive' && user.role !== 'deputy') redirect('/dashboard')

  const { requests, decide } = useFunding()
  const stage = user?.role === 'executive' ? 'em' : 'deputy'
  const stageFilter = stage === 'em' ? 'pending_em' : 'pending_deputy'

  const pending  = requests.filter(r => r.stage === stageFilter)
  const decided  = requests.filter(r => r[stage].decision !== 'pending')

  function handleDecide(id: string, decision: 'approved' | 'rejected', comment: string) {
    if (!user) return
    decide(id, stage, decision, user.name, comment || undefined)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900">
          {stage === 'em' ? 'Executive Manager' : 'Deputy Secretary'} — Approvals
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {stage === 'em'
            ? 'Review funding requests submitted by the M&E Manager'
            : 'Review requests endorsed by the Executive Manager'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <p className="text-xl font-black text-amber-700">{pending.length}</p>
          <p className="text-[11px] text-amber-600">Pending</p>
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
            <RequestCard key={req.id} req={req} stage={stage} onDecide={handleDecide} />
          ))}
        </div>
      )}

      {pending.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">All caught up</p>
          <p className="text-xs text-gray-400 mt-1">No requests pending your approval.</p>
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
