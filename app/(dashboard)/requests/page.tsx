'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFunding } from '@/lib/funding-context'
import { redirect } from 'next/navigation'
import {
  PlusCircle, Clock, XCircle, ChevronDown, ChevronUp,
  ArrowRight, AlertTriangle, FileText, Paperclip, Upload, X,
  FileImage, FileSpreadsheet, File, BookOpenCheck, Lock,
} from 'lucide-react'
import type { FundingRequest, RequestStage, RequestAttachment } from '@/types'

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
  pending_em:         { label: 'Awaiting Exec. Manager',       color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  pending_deputy:     { label: 'Awaiting Deputy Sec.',         color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  pending_dcs:        { label: 'Awaiting Dir. Corp. Services', color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200' },
  pending_finance:    { label: 'Awaiting Finance',             color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  pending_acquittal:  { label: 'Submit Acquittal Report',      color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200' },
  closed:             { label: 'Closed',                       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected:           { label: 'Rejected',                     color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
}

const STAGE_ICON: Record<RequestStage, React.ElementType> = {
  pending_em:        Clock,
  pending_deputy:    Clock,
  pending_dcs:       Clock,
  pending_finance:   Clock,
  pending_acquittal: BookOpenCheck,
  closed:            Lock,
  rejected:          XCircle,
}

const PROGRAMMES = [
  'National Fibre Backbone Expansion',
  'eGovernment Portal v3.0',
  'Rural Connectivity Program',
  'Cybersecurity Framework Implementation',
  'Digital Literacy Campaign',
  'ICT Capacity Building',
  'Digital Transformation Initiative',
]

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip'

/* ── Attachment chip ───────────────────────────────────────────────────────── */
export function AttachmentList({ attachments }: { attachments: RequestAttachment[] }) {
  if (!attachments.length) return null
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Paperclip className="w-3 h-3" /> Attachments ({attachments.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a, i) => {
          const Icon = fileIcon(a.type)
          return (
            <a
              key={i}
              href={a.url}
              download={a.name}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded px-2.5 py-1.5 transition-colors group"
            >
              <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
              <span className="text-xs text-gray-700 group-hover:text-blue-700 max-w-40 truncate">{a.name}</span>
              <span className="text-[10px] text-gray-400">{fmtBytes(a.size)}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

/* ── Tracker bar ───────────────────────────────────────────────────────────── */
function TrackerBar({ req }: { req: FundingRequest }) {
  const steps = [
    { key: 'em',        label: 'Exec. Manager', entry: req.em },
    { key: 'deputy',    label: 'Deputy Sec.',   entry: req.deputy },
    { key: 'dcs',       label: 'Dir. Corp.',    entry: req.dcs },
    { key: 'finance',   label: 'Finance',       entry: req.finance },
    {
      key: 'acquittal',
      label: 'Acquittal',
      entry: req.acquittal
        ? { decision: 'approved' as const, at: req.acquittal.submittedAt }
        : { decision: 'pending' as const },
    },
  ] as const

  return (
    <div className="flex items-center gap-0 mt-4">
      {steps.map((s, i) => {
        const done     = s.entry.decision === 'approved'
        const rejected = s.entry.decision === 'rejected'
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                done     ? 'bg-green-500 border-green-500 text-white' :
                rejected ? 'bg-red-500 border-red-500 text-white' :
                           'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? '✓' : rejected ? '✗' : i + 1}
              </div>
              <p className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                done ? 'text-green-600' : rejected ? 'text-red-600' : 'text-gray-400'
              }`}>{s.label}</p>
              {'by' in s.entry && s.entry.by && (
                <p className="text-[9px] text-gray-400 text-center">{s.entry.by}</p>
              )}
              {s.entry.at && <p className="text-[9px] text-gray-400 text-center">{s.entry.at}</p>}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── File upload zone (reusable) ───────────────────────────────────────────── */
function FileUploadZone({
  files, onAdd, onRemove,
}: {
  files: RequestAttachment[]
  onAdd: (files: RequestAttachment[]) => void
  onRemove: (i: number) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function processFiles(raw: FileList | null) {
    if (!raw) return
    onAdd(Array.from(raw).map(f => ({
      name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f),
    })))
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

/* ── Acquittal submission form ─────────────────────────────────────────────── */
function AcquittalForm({ req, onSubmit }: {
  req: FundingRequest
  onSubmit: (notes: string, attachments: RequestAttachment[]) => Promise<void>
}) {
  const [notes, setNotes]   = useState('')
  const [files, setFiles]   = useState<RequestAttachment[]>([])
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')

  async function handle(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!notes.trim()) { setError('Please provide acquittal notes describing the use of funds.'); return }
    setBusy(true)
    await onSubmit(notes, files)
    setBusy(false)
  }

  function removeFile(i: number) {
    setFiles(prev => { URL.revokeObjectURL(prev[i].url); return prev.filter((_, idx) => idx !== i) })
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
          onRemove={removeFile}
        />
      </div>

      <button
        onClick={handle}
        disabled={busy}
        className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-emerald-700 disabled:opacity-60 transition-colors"
      >
        {busy ? 'Submitting…' : <>Submit Acquittal <ArrowRight className="w-3.5 h-3.5" /></>}
      </button>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function RequestsPage() {
  const { user } = useAuth()
  if (user && user.role !== 'admin') redirect('/dashboard')

  const { requests, submit, submitAcquittal } = useFunding()
  const myRequests = requests.filter(r => r.submittedBy === user?.name)

  const [showForm, setShowForm]     = useState(false)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [form, setForm]             = useState({ programme: '', description: '', amount: '', fiscalYear: 'FY 2024/25' })
  const [files, setFiles]           = useState<RequestAttachment[]>([])
  const [submitting, setSubmitting] = useState(false)

  /* ── Submit new request ── */
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    await submit({
      programme:   form.programme,
      description: form.description,
      amount:      parseFloat(form.amount),
      fiscalYear:  form.fiscalYear,
      submittedBy: user.name,
      attachments: files,
    })
    setForm({ programme: '', description: '', amount: '', fiscalYear: 'FY 2024/25' })
    setFiles([])
    setShowForm(false)
    setSubmitting(false)
  }

  function cancelForm() {
    files.forEach(f => URL.revokeObjectURL(f.url))
    setFiles([])
    setShowForm(false)
  }

  function removeFile(i: number) {
    setFiles(prev => { URL.revokeObjectURL(prev[i].url); return prev.filter((_, idx) => idx !== i) })
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
          { label: 'In Progress',       count: inProgress.length - pendingAcq, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Acquittal Due',     count: pendingAcq,                     cls: 'bg-orange-50 text-orange-700 border-orange-200' },
          { label: 'Closed',            count: closedCount,                    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Rejected',          count: myRequests.filter(r => r.stage === 'rejected').length, cls: 'bg-red-50 text-red-700 border-red-200' },
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
          <h2 className="text-sm font-bold text-gray-900 mb-4">New Funding Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Programme</label>
                <select
                  required
                  value={form.programme}
                  onChange={e => setForm(f => ({ ...f, programme: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a programme…</option>
                  {PROGRAMMES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (PGK)</label>
                <input
                  type="number" required min={1} placeholder="e.g. 500000"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fiscal Year</label>
                <select
                  value={form.fiscalYear}
                  onChange={e => setForm(f => ({ ...f, fiscalYear: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>FY 2024/25</option>
                  <option>FY 2025/26</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Justification</label>
                <textarea
                  required rows={3}
                  placeholder="Describe why this funding is needed…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
                  onRemove={removeFile}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit" disabled={submitting}
                className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Submitting…' : <> Submit for Approval <ArrowRight className="w-3.5 h-3.5" /></>}
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
                      <span className="text-xs text-gray-400">{req.fiscalYear} · Submitted {req.submittedAt}</span>
                      {req.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                          <Paperclip className="w-3 h-3" />
                          {req.attachments.length} file{req.attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900 shrink-0">{fmt(req.amount)}</p>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  }
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 border-t border-gray-100">
                    {/* Justification */}
                    <div className="flex items-start gap-2 bg-gray-50 rounded p-3 mt-3">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
                    </div>

                    <AttachmentList attachments={req.attachments ?? []} />

                    <TrackerBar req={req} />

                    {/* Finance response */}
                    {req.finance.comment && (
                      <div className={`mt-3 flex items-start gap-2 rounded p-3 border ${
                        req.stage === 'rejected' && req.finance.decision === 'rejected'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                          req.finance.decision === 'rejected' ? 'text-red-600' : 'text-green-600'
                        }`} />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">Finance Response</p>
                          <p className="text-xs text-gray-600 mt-0.5">{req.finance.comment}</p>
                        </div>
                      </div>
                    )}

                    {/* Acquittal form — shown when finance approved */}
                    {req.stage === 'pending_acquittal' && (
                      <AcquittalForm
                        req={req}
                        onSubmit={(notes, attachments) => handleAcquittal(req.id, notes, attachments)}
                      />
                    )}

                    {/* Closed — show submitted acquittal */}
                    {req.stage === 'closed' && req.acquittal && (
                      <div className="mt-3 border-t border-gray-100 pt-4">
                        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded p-3">
                          <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-emerald-800">
                              Request Closed · Acquittal submitted {req.acquittal.submittedAt}
                            </p>
                            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">{req.acquittal.notes}</p>
                            <AttachmentList attachments={req.acquittal.attachments} />
                          </div>
                        </div>
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
