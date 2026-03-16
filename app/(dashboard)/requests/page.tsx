'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import { useWorkplan } from '@/lib/workplan-context'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  PlusCircle, Clock, XCircle, ChevronDown, ChevronUp,
  ArrowRight, FileText, Paperclip, Upload, X,
  FileImage, FileSpreadsheet, File, BookOpenCheck, Lock, ClipboardList,
  Tag, ChevronRight,
} from 'lucide-react'
import type { FundingRequest, RequestStage, RequestAttachment, RequestType } from '@/types'
import { REQUEST_TYPE_CFG } from '@/types'
import { uploadFile, sanitiseFilename, getSignedUrl } from '@/lib/storage'

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000 ? `K${(n / 1_000_000).toFixed(2)}M` : `K${(n / 1_000).toFixed(0)}K`

const fmtBytes = (b: number) =>
  b >= 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${(b / 1_024).toFixed(0)} KB`

function fileIcon(type: string) {
  if (type.startsWith('image/'))                        return FileImage
  if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet
  if (type.includes('pdf'))                             return FileText
  return File
}

const STAGE_META: Record<RequestStage, { label: string; color: string; bg: string; border: string }> = {
  pending_em:               { label: 'Awaiting Executive',           color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  pending_deputy:           { label: 'Awaiting Deputy Sec.',         color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  pending_dcs:              { label: 'Awaiting Director',            color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200' },
  pending_finance:          { label: 'Awaiting Finance',             color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  pending_acquittal:        { label: 'Submit Acquittal Report',      color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200' },
  pending_acquittal_review: { label: 'Acquittal Under Review',       color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200' },
  closed:                   { label: 'Closed',                       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected:                 { label: 'Rejected',                     color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  deferred:                 { label: 'On Hold / Deferred',           color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-200' },
}

const STAGE_ICON: Record<RequestStage, React.ElementType> = {
  pending_em:               Clock,
  pending_deputy:           Clock,
  pending_dcs:              Clock,
  pending_finance:          Clock,
  pending_acquittal:        BookOpenCheck,
  pending_acquittal_review: BookOpenCheck,
  closed:                   Lock,
  rejected:                 XCircle,
  deferred:                 Clock,
}

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip'

/* ── Single attachment link — fetches a pre-signed S3 URL on mount ─────────── */
function AttachmentLink({ attachment }: { attachment: RequestAttachment }) {
  const [href, setHref] = useState<string | null>(null)
  const Icon = fileIcon(attachment.type)

  useEffect(() => {
    const url = attachment.url
    if (!url) { setHref('#'); return }
    // Already a full HTTP URL (legacy blob or external) — use as-is
    if (url.startsWith('http') || url.startsWith('blob:')) { setHref(url); return }
    // S3 key — exchange for a pre-signed URL
    getSignedUrl(url).then(setHref).catch(() => setHref('#'))
  }, [attachment.url])

  return (
    <a
      href={href ?? '#'}
      download={attachment.name}
      target="_blank"
      rel="noreferrer"
      onClick={!href ? (e) => e.preventDefault() : undefined}
      className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded px-2.5 py-1.5 transition-colors group"
    >
      <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
      <span className="text-xs text-gray-700 group-hover:text-blue-700 max-w-40 truncate">{attachment.name}</span>
      <span className="text-[10px] text-gray-400">{fmtBytes(attachment.size)}</span>
    </a>
  )
}

/* ── Attachment list (exported — used by approvals and finance pages) ───────── */
export function AttachmentList({ attachments }: { attachments: RequestAttachment[] }) {
  if (!attachments.length) return null
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Paperclip className="w-3 h-3" /> Attachments ({attachments.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a, i) => (
          <AttachmentLink key={i} attachment={a} />
        ))}
      </div>
    </div>
  )
}

/* ── Tracker bar ───────────────────────────────────────────────────────────── */
function TrackerBar({ req }: { req: FundingRequest }) {
  const cfg = REQUEST_TYPE_CFG[req.requestType ?? 'funding']
  const stepKeys: Array<'em' | 'deputy' | 'dcs' | 'finance' | 'acquittal'> = [
    ...cfg.steps,
    ...(cfg.requiresFunding ? ['acquittal' as const] : []),
  ]
  const STEP_LABELS: Record<string, string> = {
    em: 'Executive', deputy: 'Deputy', dcs: 'Director',
    finance: 'Finance', acquittal: 'Acquittal',
  }
  return (
    <div className="flex items-center gap-0 mt-4">
      {stepKeys.map((key, i) => {
        const entry = key === 'acquittal'
          ? (req.acquittal ? { decision: 'approved' as const, at: req.acquittal.submittedAt, by: undefined } : { decision: 'pending' as const, at: undefined, by: undefined })
          : req[key as 'em' | 'deputy' | 'dcs' | 'finance']
        const done     = entry.decision === 'approved'
        const rejected = entry.decision === 'rejected'
        return (
          <div key={key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                done ? 'bg-green-500 border-green-500 text-white' :
                rejected ? 'bg-red-500 border-red-500 text-white' :
                'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? '✓' : rejected ? '✗' : i + 1}
              </div>
              <p className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                done ? 'text-green-600' : rejected ? 'text-red-600' : 'text-gray-400'
              }`}>{STEP_LABELS[key]}</p>
              {'by' in entry && entry.by && <p className="text-[9px] text-gray-400 text-center">{entry.by}</p>}
              {entry.at && <p className="text-[9px] text-gray-400 text-center">{entry.at}</p>}
            </div>
            {i < stepKeys.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Request source metadata card ─────────────────────────────────────────── */
export function RequestMeta({ req }: { req: FundingRequest }) {
  const rows: Array<[string, string | undefined]> = [
    ['Type',       REQUEST_TYPE_CFG[req.requestType ?? 'funding'].label],
    ['Division',   req.division],
    ['Workplan',   req.workplanTitle],
    ['KRA',        req.kraTitle],
    ['Fiscal Year', req.fiscalYear],
    ['Submitted',  req.submittedAt],
    ['By',         req.submittedBy],
    ...(req.budgetLine ? [['Budget Line', req.budgetLine] as [string, string]] : []),
  ]
  const visible = rows.filter(([, v]) => v)
  if (!visible.length) return null
  return (
    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Request Details</p>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
        {visible.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
            <dd className="text-xs text-gray-800 font-medium mt-0.5 break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ── Audit trail — chronological log of all approver decisions ─────────────── */
export function AuditTrail({ req }: { req: FundingRequest }) {
  const STEP_LABELS: Record<string, string> = {
    em: 'Executive', deputy: 'Deputy', dcs: 'Director', finance: 'Finance Manager',
  }
  const DECISION_STYLE: Record<string, string> = {
    approved: 'bg-green-50 border-green-200 text-green-800',
    rejected: 'bg-red-50 border-red-200 text-red-800',
    deferred: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    pending:  'bg-gray-50 border-gray-200 text-gray-500',
  }
  const entries: Array<{ step: string; label: string; entry: { decision: string; by?: string; at?: string; comment?: string } }> = [
    { step: 'em',      label: STEP_LABELS.em,      entry: req.em      },
    { step: 'deputy',  label: STEP_LABELS.deputy,  entry: req.deputy  },
    { step: 'dcs',     label: STEP_LABELS.dcs,     entry: req.dcs     },
    { step: 'finance', label: STEP_LABELS.finance, entry: req.finance },
  ]
  const active = entries.filter(e => e.entry.decision !== 'pending')
  if (!active.length) return null

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Approval Audit Trail</p>
      <div className="space-y-2">
        {active.map(({ step, label, entry }) => (
          <div key={step} className={`rounded-lg border px-3 py-2.5 ${DECISION_STYLE[entry.decision] ?? DECISION_STYLE.pending}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold">{label}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">{entry.decision}</span>
            </div>
            {(entry.by || entry.at) && (
              <p className="text-[10px] mt-0.5 opacity-70">{[entry.by, entry.at].filter(Boolean).join(' · ')}</p>
            )}
            {entry.comment && (
              <p className="text-xs mt-1 leading-relaxed opacity-90">{entry.comment}</p>
            )}
          </div>
        ))}
        {/* Acquittal entry if submitted */}
        {req.acquittal && (
          <div className="rounded-lg border px-3 py-2.5 bg-emerald-50 border-emerald-200 text-emerald-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold">Acquittal</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">Submitted</span>
            </div>
            <p className="text-[10px] mt-0.5 opacity-70">{req.acquittal.submittedAt}</p>
            {req.acquittal.notes && <p className="text-xs mt-1 leading-relaxed opacity-90">{req.acquittal.notes}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── File upload zone — works with raw File objects ────────────────────────── */
function FileUploadZone({
  files, onAdd, onRemove,
}: {
  files: File[]
  onAdd: (files: File[]) => void
  onRemove: (i: number) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function processFiles(raw: FileList | null) {
    if (!raw) return
    onAdd(Array.from(raw))
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-lg px-4 py-5 text-center transition-colors ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
        <p className="text-sm text-gray-600 font-medium">
          Drag &amp; drop files, or <span className="text-blue-600">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">PDF, Word, Excel, images — up to 20 MB each</p>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="sr-only"
          onChange={e => processFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => {
            const Icon = fileIcon(f.type)
            return (
              <li key={i} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                <span className="text-[10px] text-gray-400 shrink-0">{fmtBytes(f.size)}</span>
                <button type="button" onClick={() => onRemove(i)}
                  className="p-0.5 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ── Upload helper — uploads File[] to S3 under a given prefix ─────────────── */
async function uploadFiles(files: File[], prefix: string): Promise<RequestAttachment[]> {
  return Promise.all(
    files.map(async (f) => {
      const key = `${prefix}/${Date.now()}-${sanitiseFilename(f.name)}`
      await uploadFile(f, key)
      return { name: f.name, size: f.size, type: f.type, url: key } as RequestAttachment
    })
  )
}

/* ── Acquittal submission form ─────────────────────────────────────────────── */
function AcquittalForm({ req, onSubmit }: {
  req: FundingRequest
  onSubmit: (notes: string, attachments: RequestAttachment[]) => Promise<void>
}) {
  const [notes, setNotes]   = useState('')
  const [files, setFiles]   = useState<File[]>([])
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')

  async function handle(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!notes.trim()) { setError('Please provide acquittal notes describing the use of funds.'); return }
    setBusy(true)
    const attachments = await uploadFiles(files, `acquittals/${req.id}`)
    await onSubmit(notes, attachments)
    setBusy(false)
  }

  return (
    <div className="mt-3 border-t border-orange-100 pt-4 space-y-3">
      <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded p-3">
        <BookOpenCheck className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-orange-800">Acquittal Report Required</p>
          <p className="text-xs text-orange-700 mt-0.5">
            Finance approved <span className="font-semibold">{fmt(req.amount)}</span> for <span className="font-semibold">{req.programme}</span>.
            Submit your acquittal report with supporting documents to close this request.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Acquittal Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Describe how the funds were used, outcomes achieved, and any variances from the approved amount…"
          value={notes}
          onChange={e => { setNotes(e.target.value); setError('') }}
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Supporting Documents (receipts, invoices, reports)
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <FileUploadZone
          files={files}
          onAdd={added => setFiles(prev => [...prev, ...added])}
          onRemove={i => setFiles(prev => prev.filter((_, idx) => idx !== i))}
        />
      </div>

      <button
        onClick={handle}
        disabled={busy}
        className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-emerald-700 disabled:opacity-60 transition-colors"
      >
        {busy ? 'Uploading & Submitting…' : <>Submit Acquittal <ArrowRight className="w-3.5 h-3.5" /></>}
      </button>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function RequestsPage() {
  const { user } = useAuth()
  if (!user) redirect('/dashboard')

  const { requests, submit, submitAcquittal } = useFunding()
  const { workplans } = useWorkplan()
  const myRequests = requests.filter(r => r.submittedBy === user?.name)

  const [showForm, setShowForm]     = useState(false)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [requestType, setRequestType] = useState<RequestType>('funding')
  const [wpId, setWpId]             = useState('')
  const [kraId, setKraId]           = useState('')
  const [programme, setProgramme]   = useState('')
  const [fiscalYear, setFiscalYear] = useState('FY 2025/26')
  const [description, setDescription] = useState('')
  const [amount, setAmount]         = useState('')
  const [files, setFiles]           = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const typeCfg = REQUEST_TYPE_CFG[requestType]

  const selectedWp  = workplans.find(w => w.id === wpId) ?? null
  const selectedKra = selectedWp?.kras.find(k => k.id === kraId) ?? null

  function handleWpChange(id: string) {
    setWpId(id)
    setKraId('')
    setDescription('')
  }

  function handleKraChange(id: string) {
    setKraId(id)
    const kra = selectedWp?.kras.find(k => k.id === id)
    if (kra?.description) setDescription(kra.description)
  }

  /* ── Submit new request ── */
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!user) return
    if (typeCfg.requiresFunding && (!selectedWp || !selectedKra)) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const uploadPrefix = `funding-requests/${crypto.randomUUID()}`
      const attachments = await uploadFiles(files, uploadPrefix)
      await submit({
        programme:     typeCfg.requiresFunding ? (selectedKra?.title ?? '') : programme,
        description,
        amount:        typeCfg.requiresFunding ? parseFloat(amount) : 0,
        fiscalYear:    typeCfg.requiresFunding ? (selectedWp?.fiscalYear ?? fiscalYear) : fiscalYear,
        submittedBy:   user.name,
        division:      user.division,
        workplanId:    typeCfg.requiresFunding ? selectedWp?.id : undefined,
        workplanTitle: typeCfg.requiresFunding ? selectedWp?.title : undefined,
        kraId:         typeCfg.requiresFunding ? selectedKra?.id : undefined,
        kraTitle:      typeCfg.requiresFunding ? selectedKra?.title : undefined,
        attachments,
        requestType,
      })
      setWpId(''); setKraId(''); setDescription(''); setAmount('')
      setProgramme(''); setFiscalYear('FY 2025/26')
      setFiles([])
      setRequestType('funding')
      setShowForm(false)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function cancelForm() {
    setWpId(''); setKraId(''); setDescription(''); setAmount('')
    setProgramme(''); setFiscalYear('FY 2025/26')
    setFiles([])
    setRequestType('funding')
    setShowForm(false)
  }

  async function handleAcquittal(id: string, notes: string, attachments: RequestAttachment[]) {
    await submitAcquittal(id, {
      notes,
      attachments,
      submittedAt: new Date().toISOString().slice(0, 10),
    })
  }

  const inProgress  = myRequests.filter(r => !['closed', 'rejected'].includes(r.stage))
  const closedCount = myRequests.filter(r => r.stage === 'closed').length
  const pendingAcq  = myRequests.filter(r => r.stage === 'pending_acquittal').length

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Funding Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submit and track programme funding approvals</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'In Progress',   count: inProgress.length - pendingAcq, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Acquittal Due', count: pendingAcq,                     cls: 'bg-orange-50 text-orange-700 border-orange-200' },
          { label: 'Closed',        count: closedCount,                    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Rejected',      count: myRequests.filter(r => r.stage === 'rejected').length, cls: 'bg-red-50 text-red-700 border-red-200' },
        ].map(p => (
          <span key={p.label} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${p.cls}`}>
            {p.count} {p.label}
          </span>
        ))}
      </div>

      {/* Acquittal due banner */}
      {pendingAcq > 0 && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <BookOpenCheck className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-orange-800">
              {pendingAcq} acquittal report{pendingAcq > 1 ? 's' : ''} due
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Finance has approved your request{pendingAcq > 1 ? 's' : ''}. Submit the acquittal report with receipts and invoices to close the request.
            </p>
          </div>
        </div>
      )}

      {/* ── Submission form ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-blue-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-1">New {REQUEST_TYPE_CFG[requestType].label}</h2>
          <p className="text-xs text-gray-400 mb-4">Select the request type and complete the relevant fields below.</p>

          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Request type picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Request Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(REQUEST_TYPE_CFG) as RequestType[]).map(rt => {
                  const cfg = REQUEST_TYPE_CFG[rt]
                  const active = requestType === rt
                  return (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => { setRequestType(rt); setWpId(''); setKraId(''); setDescription('') }}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        active
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Tag className={`w-3 h-3 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className={`text-xs font-bold ${active ? 'text-blue-700' : 'text-gray-700'}`}>{cfg.label}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">{cfg.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Workplan + KRA — only for funding types */}
              {typeCfg.requiresFunding && (
                <>
                  {workplans.length === 0 && (
                    <div className="sm:col-span-2 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <ClipboardList className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-800">No workplans found</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          You need an annual workplan before submitting a funding request.{' '}
                          <Link href="/workplan" className="font-semibold underline">Create one now →</Link>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Annual Workplan <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={wpId}
                      onChange={e => handleWpChange(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a workplan…</option>
                      {workplans.map(wp => (
                        <option key={wp.id} value={wp.id}>
                          {wp.title} · {wp.fiscalYear} ({wp.status})
                        </option>
                      ))}
                    </select>
                    {selectedWp && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        {selectedWp.division} · Budget: PGK {selectedWp.budget.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Key Result Area (KRA) <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={kraId}
                      disabled={!selectedWp}
                      onChange={e => handleKraChange(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{selectedWp ? 'Select a KRA…' : '— select a workplan first —'}</option>
                      {selectedWp?.kras.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.title || 'Untitled KRA'}{k.weight ? ` (${k.weight}%)` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedKra?.description && (
                      <p className="text-[11px] text-gray-400 mt-1 italic">{selectedKra.description}</p>
                    )}
                  </div>
                </>
              )}

              {/* Free-text programme/subject — for non-funding types */}
              {!typeCfg.requiresFunding && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Subject / Programme <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Leave — John Smith, IT Equipment Request…"
                    value={programme}
                    onChange={e => setProgramme(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Fiscal year — read-only from workplan if funding, editable otherwise */}
              {typeCfg.requiresFunding && selectedWp ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fiscal Year</label>
                  <div className="border border-gray-200 bg-gray-50 rounded px-3 py-2.5 text-sm text-gray-500">
                    {selectedWp.fiscalYear}
                  </div>
                </div>
              ) : !typeCfg.requiresFunding ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fiscal Year</label>
                  <input
                    type="text"
                    value={fiscalYear}
                    onChange={e => setFiscalYear(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : null}

              {/* Amount — only for funding types */}
              {typeCfg.requiresFunding && (
                <div className={selectedWp ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Amount Requested (PGK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" required min={1} placeholder="e.g. 500000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {typeCfg.requiresFunding ? 'Justification' : 'Description / Details'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required rows={3}
                  placeholder={typeCfg.requiresFunding
                    ? 'Describe why this funding is needed and how it aligns with the KRA…'
                    : 'Provide details about this request…'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Supporting Documents <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <FileUploadZone
                  files={files}
                  onAdd={added => setFiles(prev => [...prev, ...added])}
                  onRemove={i => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                />
              </div>

              {/* Approval chain preview */}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">Approval Chain</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {typeCfg.steps.map((step, i) => {
                    const labels: Record<string, string> = {
                      em: 'Executive', deputy: 'Deputy', dcs: 'Director', finance: 'Finance Manager',
                    }
                    return (
                      <div key={step} className="flex items-center gap-1">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-1 rounded">
                          {labels[step]}
                        </span>
                        {(i < typeCfg.steps.length - 1 || typeCfg.requiresFunding) && (
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                    )
                  })}
                  {typeCfg.requiresFunding && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded">Acquittal</span>
                  )}
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded">Closed</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || (typeCfg.requiresFunding && (!selectedWp || !selectedKra))}
                className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Uploading & Submitting…' : <>Submit {REQUEST_TYPE_CFG[requestType].label} <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
              <button
                type="button" onClick={cancelForm}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Requests list ───────────────────────────────────────────────────── */}
      {myRequests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No requests yet</p>
          <p className="text-xs mt-1">Click &quot;New Request&quot; to submit your first funding request.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myRequests.map(req => {
            const meta   = STAGE_META[req.stage]
            const Icon   = STAGE_ICON[req.stage]
            const isOpen = expanded === req.id

            return (
              <div key={req.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : req.id)}
                  className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{req.programme}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${meta.bg} ${meta.color} ${meta.border}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        <Tag className="w-2.5 h-2.5" />
                        {REQUEST_TYPE_CFG[req.requestType ?? 'funding'].label}
                      </span>
                      <span className="text-xs text-gray-400">{req.fiscalYear} · Submitted {req.submittedAt}</span>
                      {req.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                          <Paperclip className="w-3 h-3" />
                          {req.attachments.length} file{req.attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {req.amount > 0 && <p className="text-sm font-black text-gray-900 shrink-0">{fmt(req.amount)}</p>}
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  }
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 border-t border-gray-100">
                    {/* Description */}
                    <div className="flex items-start gap-2 bg-gray-50 rounded p-3 mt-3">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
                    </div>

                    {/* Source metadata */}
                    <RequestMeta req={req} />

                    <AttachmentList attachments={req.attachments ?? []} />

                    <TrackerBar req={req} />

                    {/* Full audit trail */}
                    <AuditTrail req={req} />

                    {/* Acquittal form — shown when finance approved */}
                    {req.stage === 'pending_acquittal' && (
                      <AcquittalForm
                        req={req}
                        onSubmit={(notes, attachments) => handleAcquittal(req.id, notes, attachments)}
                      />
                    )}

                    {/* Closed — show submitted acquittal attachments */}
                    {req.stage === 'closed' && (req.acquittal?.attachments?.length ?? 0) > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Acquittal Attachments</p>
                        <AttachmentList attachments={req.acquittal?.attachments ?? []} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
