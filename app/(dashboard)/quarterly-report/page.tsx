'use client'

import { useState } from 'react'
import { useQuarterlyReport } from '@/lib/quarterly-report-context'
import { useAuth } from '@/lib/auth-context'
import { useWorkplan } from '@/lib/workplan-context'
import type { QuarterlyReport, QREntry, QRStatus, QuarterLabel, QREntryStatus, AnnualWorkplan } from '@/types'
import { FUNCTIONAL_AREAS } from '@/lib/org-data'
import {
  Plus, ArrowLeft, Printer, Send, CheckCircle2, FileEdit,
  Trash2, X, ClipboardCheck, Eye, AlertCircle,
} from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

function emptyEntry(quarter: QuarterLabel = 'Q1'): QREntry {
  return { id: uid(), quarter, kra: '', program: '', plannedActivity: '', kpi: '', expectedOutcomes: '', approvedBudget: '', expenditure: '', status: 'Not Started', justification: '', officersInCharge: '' }
}

function buildFromWorkplan(wp: AnnualWorkplan, quarters: QuarterLabel[]): QREntry[] {
  const entries: QREntry[] = []
  for (const kra of wp.kras) {
    for (const q of quarters) {
      const kpiStr = kra.kpis.map(k => {
        const target = q === 'Q1' ? k.q1Target : q === 'Q2' ? k.q2Target : q === 'Q3' ? k.q3Target : k.q4Target
        return `${k.name}${target ? ` (Target: ${target} ${k.unit})` : ''}`
      }).join('; ')
      entries.push({
        id: uid(), quarter: q, kra: kra.title,
        program: '',
        plannedActivity: kra.description || '',
        kpi: kpiStr || '',
        expectedOutcomes: '',
        approvedBudget: '', expenditure: '', status: 'Not Started',
        justification: '', officersInCharge: kra.kpis[0]?.responsible || '',
      })
    }
  }
  return entries
}

const QUARTER_OPTIONS: QuarterLabel[] = ['Q1', 'Q2', 'Q3', 'Q4']
const ENTRY_STATUS_OPTIONS: QREntryStatus[] = ['Completed', 'Ongoing', 'Not Started', 'Deferred']

const STATUS_BADGE: Record<QRStatus, string> = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-50 text-blue-700',
  reviewed:  'bg-emerald-50 text-emerald-700',
}
const STATUS_LABEL: Record<QRStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', reviewed: 'Reviewed',
}
const ENTRY_STATUS_COLOR: Record<QREntryStatus, string> = {
  'Completed':   'bg-emerald-50 text-emerald-700',
  'Ongoing':     'bg-blue-50 text-blue-700',
  'Not Started': 'bg-gray-100 text-gray-500',
  'Deferred':    'bg-amber-50 text-amber-700',
}

const WINGS = FUNCTIONAL_AREAS.map(fa => ({
  title: fa.title,
  programs: fa.programs.map(p => ({
    title: p.title,
    activities: p.activities.map(a => a.title),
  })),
}))

// ── New Report Modal ──────────────────────────────────────────────────────────
function NewReportModal({ onClose, onCreate, workplans }: {
  onClose: () => void
  onCreate: (r: QuarterlyReport) => void
  workplans: AnnualWorkplan[]
}) {
  const { user } = useAuth()
  const [title, setTitle]       = useState('')
  const [year, setYear]         = useState('FY 2025/26')
  const [wing, setWing]         = useState(WINGS[0].title)
  const [division, setDivision] = useState(WINGS[0].programs[0]?.title ?? '')
  const [branch, setBranch]     = useState(WINGS[0].programs[0]?.activities[0] ?? '')
  const [linkWp, setLinkWp]     = useState(false)
  const [wpId, setWpId]         = useState('')
  const [quarters, setQuarters] = useState<QuarterLabel[]>(['Q1', 'Q2', 'Q3', 'Q4'])
  const [error, setError]       = useState('')

  const wingData    = WINGS.find(w => w.title === wing) ?? WINGS[0]
  const divPrograms = wingData.programs
  const divData     = divPrograms.find(p => p.title === division) ?? divPrograms[0]
  const activities  = divData?.activities ?? []

  function handleWingChange(w: string) {
    setWing(w)
    const wd = WINGS.find(x => x.title === w) ?? WINGS[0]
    setDivision(wd.programs[0]?.title ?? '')
    setBranch(wd.programs[0]?.activities[0] ?? '')
  }

  function handleDivChange(d: string) {
    setDivision(d)
    const dd = wingData.programs.find(p => p.title === d)
    setBranch(dd?.activities[0] ?? '')
  }

  function toggleQ(q: QuarterLabel) {
    setQuarters(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q].sort())
  }

  function handleCreate() {
    if (!title.trim()) { setError('Report title is required.'); return }
    if (linkWp && !wpId) { setError('Please select a workplan to link.'); return }
    const selectedWp = workplans.find(w => w.id === wpId)
    const entries = linkWp && selectedWp
      ? buildFromWorkplan(selectedWp, quarters)
      : quarters.map(q => emptyEntry(q))
    const report: QuarterlyReport = {
      id: uid(), title: title.trim(), fiscalYear: year, wing, division, branch,
      createdBy: user?.name ?? 'Unknown',
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'draft',
      workplanId: selectedWp?.id, workplanTitle: selectedWp?.title,
      entries: entries.length ? entries : [emptyEntry('Q1')],
    }
    onCreate(report)
  }

  const selectedWpKras = workplans.find(w => w.id === wpId)?.kras.length ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900">New Quarterly Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Report Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q1 2025 Quarterly Performance Report"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fiscal Year</label>
            <input value={year} onChange={e => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Wing</label>
            <select value={wing} onChange={e => handleWingChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {WINGS.map(w => <option key={w.title} value={w.title}>{w.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Division</label>
            <select value={division} onChange={e => handleDivChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {divPrograms.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
            {activities.length > 0 ? (
              <select value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {activities.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            ) : (
              <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Enter branch name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Include Quarters</label>
            <div className="flex gap-2">
              {QUARTER_OPTIONS.map(q => (
                <button key={q} type="button" onClick={() => toggleQ(q)}
                  className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors ${
                    quarters.includes(q) ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}>{q}</button>
              ))}
            </div>
          </div>
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={linkWp} onChange={e => setLinkWp(e.target.checked)} className="accent-blue-700" />
              <span className="text-xs font-semibold text-gray-700">Auto-populate from Annual Workplan</span>
            </label>
            {linkWp && (
              <div className="space-y-1.5 pt-1">
                {workplans.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No workplans found. Create one in Annual Workplan first.</p>
                ) : (
                  <select value={wpId} onChange={e => setWpId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select a workplan…</option>
                    {workplans.map(wp => <option key={wp.id} value={wp.id}>{wp.title} ({wp.fiscalYear})</option>)}
                  </select>
                )}
                {wpId && <p className="text-xs text-blue-600">Will generate {selectedWpKras} KRA × {quarters.length} quarter = {selectedWpKras * quarters.length} rows</p>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Create Report
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Entry Row ─────────────────────────────────────────────────────────────────
function EntryRow({ entry, editing, onChange, onDelete }: {
  entry: QREntry; editing: boolean
  onChange: (u: QREntry) => void; onDelete: () => void
}) {
  function set<K extends keyof QREntry>(key: K, val: QREntry[K]) { onChange({ ...entry, [key]: val }) }
  const cell = "border border-gray-200 rounded px-1.5 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"

  if (!editing) {
    const dash = <span className="text-gray-300 italic">—</span>
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-3 py-2 text-xs font-bold text-blue-700 whitespace-nowrap">{entry.quarter}</td>
        <td className="px-3 py-2 text-xs text-gray-800 max-w-32">{entry.kra || dash}</td>
        <td className="px-3 py-2 text-xs text-gray-700 max-w-40">{entry.plannedActivity || dash}</td>
        <td className="px-3 py-2 text-xs text-gray-700 max-w-32">{entry.program || dash}</td>
        <td className="px-3 py-2 text-xs text-gray-700 max-w-40">{entry.kpi || dash}</td>
        <td className="px-3 py-2 text-xs text-gray-700 max-w-40">{entry.expectedOutcomes || dash}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-right whitespace-nowrap">{entry.approvedBudget || '—'}</td>
        <td className="px-3 py-2 text-xs text-gray-700 text-right whitespace-nowrap">{entry.expenditure || '—'}</td>
        <td className="px-3 py-2 text-xs whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ENTRY_STATUS_COLOR[entry.status]}`}>{entry.status}</span>
        </td>
        <td className="px-3 py-2 text-xs text-gray-600 max-w-40">{entry.justification || dash}</td>
        <td className="px-3 py-2 text-xs text-gray-700 max-w-32">{entry.officersInCharge || dash}</td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-blue-100 bg-blue-50/20">
      <td className="px-2 py-1.5 w-20">
        <select value={entry.quarter} onChange={e => set('quarter', e.target.value as QuarterLabel)} className={cell}>
          {QUARTER_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5 min-w-32"><input value={entry.kra} onChange={e => set('kra', e.target.value)} placeholder="KRA title" className={cell} /></td>
      <td className="px-2 py-1.5 min-w-40"><textarea value={entry.plannedActivity} onChange={e => set('plannedActivity', e.target.value)} rows={2} placeholder="Planned activity" className={`${cell} resize-none`} /></td>
      <td className="px-2 py-1.5 min-w-32"><input value={entry.program} onChange={e => set('program', e.target.value)} placeholder="Program / Project" className={cell} /></td>
      <td className="px-2 py-1.5 min-w-40"><textarea value={entry.kpi} onChange={e => set('kpi', e.target.value)} rows={2} placeholder="KPI name / target" className={`${cell} resize-none`} /></td>
      <td className="px-2 py-1.5 min-w-40"><textarea value={entry.expectedOutcomes} onChange={e => set('expectedOutcomes', e.target.value)} rows={2} placeholder="Expected outcomes" className={`${cell} resize-none`} /></td>
      <td className="px-2 py-1.5 w-24"><input value={entry.approvedBudget} onChange={e => set('approvedBudget', e.target.value)} placeholder="K 0" className={cell} /></td>
      <td className="px-2 py-1.5 w-24"><input value={entry.expenditure} onChange={e => set('expenditure', e.target.value)} placeholder="K 0" className={cell} /></td>
      <td className="px-2 py-1.5 w-28">
        <select value={entry.status} onChange={e => set('status', e.target.value as QREntryStatus)} className={cell}>
          {ENTRY_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5 min-w-40"><textarea value={entry.justification} onChange={e => set('justification', e.target.value)} rows={2} placeholder="Remarks / justification" className={`${cell} resize-none`} /></td>
      <td className="px-2 py-1.5 min-w-32"><input value={entry.officersInCharge} onChange={e => set('officersInCharge', e.target.value)} placeholder="Officer names" className={cell} /></td>
      <td className="px-2 py-1.5">
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Remove row">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

// ── Report Detail ─────────────────────────────────────────────────────────────
function ReportDetail({ report, onUpdate, onDelete, onBack, canEdit, canReview }: {
  report: QuarterlyReport; onUpdate: (r: QuarterlyReport) => void
  onDelete: (id: string) => void; onBack: () => void
  canEdit: boolean; canReview: boolean
}) {
  const { user } = useAuth()
  const [editing, setEditing]         = useState(false)
  const [draft, setDraft]             = useState<QuarterlyReport>(report)
  const [reviewComment, setReviewComment] = useState(report.reviewComment ?? '')
  const [showDel, setShowDel]         = useState(false)

  function saveEdits() { onUpdate(draft); setEditing(false) }
  function cancelEdits() { setDraft(report); setEditing(false) }

  function addRow() {
    const lastQ = draft.entries[draft.entries.length - 1]?.quarter ?? 'Q1'
    setDraft(prev => ({ ...prev, entries: [...prev.entries, emptyEntry(lastQ)] }))
  }

  function updateEntry(id: string, updated: QREntry) {
    setDraft(prev => ({ ...prev, entries: prev.entries.map(e => e.id === id ? updated : e) }))
  }

  function deleteEntry(id: string) {
    setDraft(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }))
  }

  function submit() {
    const updated: QuarterlyReport = { ...draft, status: 'submitted', submittedAt: new Date().toISOString().slice(0, 10) }
    onUpdate(updated); setDraft(updated)
  }

  function markReviewed() {
    const updated: QuarterlyReport = {
      ...report, status: 'reviewed',
      reviewedAt: new Date().toISOString().slice(0, 10),
      reviewedBy: user?.name ?? 'Executive',
      reviewComment: reviewComment.trim() || undefined,
    }
    onUpdate(updated)
  }

  const isDraft     = draft.status === 'draft'
  const isSubmitted = report.status === 'submitted'
  const isReviewed  = report.status === 'reviewed'

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #qr-print-area, #qr-print-area * { visibility: visible !important; }
          #qr-print-area { position: fixed; inset: 0; padding: 24px; background: white; z-index: 9999; overflow: auto; }
          .qr-print-header { display: block !important; }
        }
        .qr-print-header { display: none; }
      `}</style>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All Reports
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{report.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{report.fiscalYear} · {report.createdBy} · {report.createdAt}</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[report.status]}`}>
            {STATUS_LABEL[report.status]}
          </span>
          <div className="flex items-center gap-2">
            {canEdit && isDraft && !editing && (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                <FileEdit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {editing && <>
              <button onClick={cancelEdits} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={saveEdits} className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-blue-800 transition-colors">
                Save Changes
              </button>
            </>}
            {canEdit && isDraft && !editing && (
              <button onClick={submit} className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-blue-800 transition-colors">
                <Send className="w-3.5 h-3.5" /> Submit
              </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            {canEdit && (
              <button onClick={() => setShowDel(true)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete report">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showDel && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs text-red-700 flex-1">Delete this report permanently? This cannot be undone.</p>
            <button onClick={() => { onDelete(report.id); onBack() }} className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-red-700 transition-colors">Delete</button>
            <button onClick={() => setShowDel(false)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        )}

        {/* Printable area */}
        <div id="qr-print-area" className="bg-white border border-gray-200 rounded p-6 space-y-6">

          {/* Print-only letterhead */}
          <div className="qr-print-header text-center pb-4 border-b-2 border-gray-800 space-y-1">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-600">Department of Information &amp; Communications Technology</p>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide">DICT — Quarterly Reporting Template</h1>
            <p className="text-xs text-gray-500">{report.fiscalYear}</p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">1.&nbsp;&nbsp;Wing, Division and Branch</h2>
            <div className="border border-gray-300 rounded overflow-hidden max-w-lg">
              <table className="w-full text-xs">
                <tbody>
                  {([['WING', report.wing], ['DIVISION', report.division], ['BRANCH', report.branch]] as [string, string][]).map(([label, val]) => (
                    <tr key={label} className="border-b border-gray-200 last:border-0">
                      <td className="px-4 py-2.5 font-bold text-gray-700 bg-gray-50 w-28 border-r border-gray-200">{label}:</td>
                      <td className="px-4 py-2.5 text-gray-900 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {report.workplanTitle && (
              <p className="text-[11px] text-gray-400 mt-2">Linked workplan: <span className="font-medium text-gray-600">{report.workplanTitle}</span></p>
            )}
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">2.&nbsp;&nbsp;Quarterly Priorities and Outcomes</h2>
            <div className="overflow-x-auto border border-gray-300 rounded">
              <table className="w-full text-xs border-collapse" style={{ minWidth: 960 }}>
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    {['Quarter', 'KRA', 'Program / Project', 'Description of Key Activities', 'KPIs', 'Expected Outcomes', 'Approved Budget (K)', 'Quarter Expenditure', 'Status', 'Justification / Remarks', 'Officers in Charge'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 last:border-r-0 whitespace-nowrap text-[11px]">{h}</th>
                    ))}
                    {editing && <th className="w-10" />}
                  </tr>
                </thead>
                <tbody>
                  {draft.entries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-gray-400 italic text-xs">
                        {editing ? 'Click "Add Row" below to add activities.' : 'No entries. Click Edit to add activities.'}
                      </td>
                    </tr>
                  ) : draft.entries.map(entry => (
                    <EntryRow key={entry.id} entry={entry} editing={editing}
                      onChange={updated => updateEntry(entry.id, updated)}
                      onDelete={() => deleteEntry(entry.id)} />
                  ))}
                </tbody>
              </table>
            </div>
            {editing && (
              <button onClick={addRow} className="mt-2 flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            )}
          </div>

          {/* Print footer */}
          <div className="qr-print-header flex justify-between pt-4 border-t border-gray-300 text-[10px] text-gray-500">
            <span>Prepared by: {report.createdBy}</span>
            <span>Submitted: {report.submittedAt ?? '—'}</span>
            <span>Status: {STATUS_LABEL[report.status]}</span>
            {report.reviewedBy && <span>Reviewed by: {report.reviewedBy}</span>}
          </div>
        </div>

        {/* Executive review */}
        {canReview && isSubmitted && (
          <div className="bg-white border border-blue-200 rounded p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900">Executive Review</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Review Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                placeholder="Add review comments, recommendations or directives for the reporting officer…"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <button onClick={markReviewed}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Reviewed
            </button>
          </div>
        )}

        {/* Reviewed badge */}
        {isReviewed && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded p-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">
                Reviewed by <span className="font-black">{report.reviewedBy}</span> on {report.reviewedAt}
              </p>
              {report.reviewComment && (
                <p className="text-xs text-emerald-700 mt-1 italic leading-relaxed">&ldquo;{report.reviewComment}&rdquo;</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Report Card ───────────────────────────────────────────────────────────────
function ReportCard({ report, onClick }: { report: QuarterlyReport; onClick: () => void }) {
  const completed = report.entries.filter(e => e.status === 'Completed').length
  const total     = report.entries.length
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <button onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded hover:border-blue-300 hover:shadow-sm transition-all p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate leading-tight">{report.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{report.fiscalYear}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[report.status]}`}>
          {STATUS_LABEL[report.status]}
        </span>
      </div>
      <div className="space-y-1 text-[11px] text-gray-500">
        <p><span className="font-semibold text-gray-700 w-14 inline-block">Wing:</span>{report.wing}</p>
        <p><span className="font-semibold text-gray-700 w-14 inline-block">Division:</span>{report.division}</p>
        <p><span className="font-semibold text-gray-700 w-14 inline-block">Branch:</span>{report.branch || '—'}</p>
      </div>
      {total > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>{completed}/{total} activities completed</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
        <span>By {report.createdBy}</span>
        <span>{report.submittedAt ?? report.createdAt}</span>
      </div>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function QuarterlyReportPage() {
  const { reports, addReport, updateReport, deleteReport } = useQuarterlyReport()
  const { user } = useAuth()
  const { workplans } = useWorkplan()

  const [view, setView]         = useState<'list' | 'detail'>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNew, setShowNew]   = useState(false)
  const [filter, setFilter]     = useState<QRStatus | 'all'>('all')

  const isManager  = user?.role === 'admin' || user?.role === 'super'
  const isExecutive = ['executive', 'deputy', 'dcs', 'super'].includes(user?.role ?? '')

  // Branch Managers (admin) only see their own reports (ToR §3.3.2)
  const visibleReports = (isExecutive && user?.role !== 'admin')
    ? reports
    : reports.filter(r => r.createdBy === user?.name)

  const activeReport = visibleReports.find(r => r.id === activeId) ?? null

  const filtered = visibleReports.filter(r => filter === 'all' || r.status === filter)

  const counts = {
    all:       visibleReports.length,
    draft:     visibleReports.filter(r => r.status === 'draft').length,
    submitted: visibleReports.filter(r => r.status === 'submitted').length,
    reviewed:  visibleReports.filter(r => r.status === 'reviewed').length,
  }

  // Pending review count for executives
  const pendingReview = visibleReports.filter(r => r.status === 'submitted').length

  function handleCreate(r: QuarterlyReport) {
    addReport(r); setShowNew(false); setActiveId(r.id); setView('detail')
  }

  if (view === 'detail' && activeReport) {
    return (
      <ReportDetail
        report={activeReport}
        onUpdate={updateReport}
        onDelete={deleteReport}
        onBack={() => { setView('list'); setActiveId(null) }}
        canEdit={isManager}
        canReview={isExecutive}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Quarterly Reports</h1>
          <p className="text-xs text-gray-400 mt-0.5">DICT M&amp;E Quarterly Performance Reporting Template</p>
        </div>
        {isManager && (
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Report
          </button>
        )}
      </div>

      {/* Executive notice */}
      {isExecutive && pendingReview > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded p-3">
          <Eye className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-800 font-medium">
            {pendingReview} report{pendingReview > 1 ? 's' : ''} pending your review
          </p>
          <button onClick={() => setFilter('submitted')} className="ml-auto text-xs text-blue-700 font-semibold hover:underline">
            View
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: 'all' as const,       label: 'Total',     cls: 'bg-white border-gray-200 text-gray-700' },
          { key: 'draft' as const,     label: 'Draft',     cls: 'bg-gray-50 border-gray-200 text-gray-600' },
          { key: 'submitted' as const, label: 'Submitted', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
          { key: 'reviewed' as const,  label: 'Reviewed',  cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ]).map(({ key, label, cls }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`border rounded p-3 text-center transition-all hover:border-blue-300 ${cls} ${filter === key ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
            <p className="text-2xl font-black">{counts[key]}</p>
            <p className="text-[11px] font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Reports grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded">
          <ClipboardCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {filter === 'all' ? 'No reports yet' : `No ${filter} reports`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isManager ? 'Click "New Report" to create your first quarterly report.' : 'No reports have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <ReportCard key={r.id} report={r} onClick={() => { setActiveId(r.id); setView('detail') }} />
          ))}
        </div>
      )}

      {showNew && (
        <NewReportModal onClose={() => setShowNew(false)} onCreate={handleCreate} workplans={workplans} />
      )}
    </div>
  )
}
