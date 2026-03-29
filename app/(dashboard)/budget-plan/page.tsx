'use client'

import { useState } from 'react'
import { useBudgetPlan } from '@/lib/budget-plan-context'
import { useAuth } from '@/lib/auth-context'
import type { BudgetPlan, BudgetPlanItem, BudgetPlanStatus } from '@/types'
import { FUNCTIONAL_AREAS } from '@/lib/org-data'
import { exportCSV } from '@/lib/utils'
import {
  Plus, ArrowLeft, Printer, Send, CheckCircle2, FileEdit,
  Trash2, X, Wallet, Eye, AlertCircle, Download,
} from 'lucide-react'

function uid() { return Math.random().toString(36).slice(2, 9) }

function emptyItem(): BudgetPlanItem {
  return { id: uid(), category: '', description: '', estimatedCost: '', utilized: '', justification: '' }
}

const BUDGET_CATEGORIES = [
  'Personnel Emoluments',
  'Goods & Services',
  'Capital Investment',
  'Training & Capacity Building',
  'Travel & Accommodation',
  'ICT Equipment & Infrastructure',
  'Consultancy Services',
  'Operational Expenses',
  'Other',
]

const WINGS = FUNCTIONAL_AREAS.map(fa => ({
  title: fa.title,
  programs: fa.programs.map(p => ({
    title: p.title,
    activities: p.activities.map(a => a.title),
  })),
}))

const STATUS_BADGE: Record<BudgetPlanStatus, string> = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-50 text-blue-700',
  reviewed:  'bg-emerald-50 text-emerald-700',
}
const STATUS_LABEL: Record<BudgetPlanStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', reviewed: 'Reviewed',
}

function parseK(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0
}

function fmtK(n: number): string {
  return `K ${n.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── New Plan Modal ────────────────────────────────────────────────────────────
function NewPlanModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (p: BudgetPlan) => void
}) {
  const { user } = useAuth()
  const [title, setTitle]       = useState('')
  const [year, setYear]         = useState('FY 2025/26')
  const [wing, setWing]         = useState(WINGS[0].title)
  const [division, setDivision] = useState(WINGS[0].programs[0]?.title ?? '')
  const [branch, setBranch]     = useState(WINGS[0].programs[0]?.activities[0] ?? '')
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

  function handleCreate() {
    if (!title.trim()) { setError('Title is required.'); return }
    const plan: BudgetPlan = {
      id: uid(), title: title.trim(), fiscalYear: year, wing, division, branch,
      createdBy: user?.name ?? 'Unknown',
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'draft',
      items: [emptyItem()],
    }
    onCreate(plan)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900">New Budget Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Plan Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. FY 2025/26 Branch Budget Plan"
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
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Create Plan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Item Row ──────────────────────────────────────────────────────────────────
function ItemRow({ item, editing, onChange, onDelete }: {
  item: BudgetPlanItem; editing: boolean
  onChange: (u: BudgetPlanItem) => void; onDelete: () => void
}) {
  function set<K extends keyof BudgetPlanItem>(key: K, val: BudgetPlanItem[K]) {
    onChange({ ...item, [key]: val })
  }
  const cell = "border border-gray-200 rounded px-1.5 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
  const est  = parseK(item.estimatedCost)
  const util = parseK(item.utilized)
  const pct  = est > 0 ? Math.min(Math.round((util / est) * 100), 100) : 0

  if (!editing) {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-3 py-2 text-xs text-gray-800 font-medium">{item.category || <span className="text-gray-300 italic">—</span>}</td>
        <td className="px-3 py-2 text-xs text-gray-700 max-w-60">{item.description || <span className="text-gray-300 italic">—</span>}</td>
        <td className="px-3 py-2 text-xs text-gray-900 font-semibold text-right whitespace-nowrap">
          {item.estimatedCost ? fmtK(est) : '—'}
        </td>
        <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
          {item.utilized ? (
            <div className="space-y-1">
              <span className={`font-semibold ${util > est && est > 0 ? 'text-red-600' : 'text-emerald-700'}`}>{fmtK(util)}</span>
              {est > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{pct}%</span>
                </div>
              )}
            </div>
          ) : '—'}
        </td>
        <td className="px-3 py-2 text-xs text-gray-600 max-w-48">{item.justification || <span className="text-gray-300 italic">—</span>}</td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-blue-100 bg-blue-50/20">
      <td className="px-2 py-1.5 min-w-36">
        <select value={item.category} onChange={e => set('category', e.target.value)} className={cell}>
          <option value="">Select category…</option>
          {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5 min-w-52">
        <textarea value={item.description} onChange={e => set('description', e.target.value)} rows={2}
          placeholder="Description of items / activities"
          className={`${cell} resize-none`} />
      </td>
      <td className="px-2 py-1.5 w-28">
        <input value={item.estimatedCost} onChange={e => set('estimatedCost', e.target.value)} placeholder="K 0" className={cell} />
      </td>
      <td className="px-2 py-1.5 w-28">
        <input value={item.utilized} onChange={e => set('utilized', e.target.value)} placeholder="K 0" className={cell} />
      </td>
      <td className="px-2 py-1.5 min-w-40">
        <textarea value={item.justification} onChange={e => set('justification', e.target.value)} rows={2}
          placeholder="Justification / remarks"
          className={`${cell} resize-none`} />
      </td>
      <td className="px-2 py-1.5">
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Remove row">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

// ── Plan Detail ───────────────────────────────────────────────────────────────
function PlanDetail({ plan, onUpdate, onDelete, onBack, canEdit, canReview }: {
  plan: BudgetPlan; onUpdate: (p: BudgetPlan) => void
  onDelete: (id: string) => void; onBack: () => void
  canEdit: boolean; canReview: boolean
}) {
  const { user } = useAuth()
  const [editing, setEditing]         = useState(false)
  const [draft, setDraft]             = useState<BudgetPlan>(plan)
  const [reviewComment, setReviewComment] = useState(plan.reviewComment ?? '')
  const [showDel, setShowDel]         = useState(false)

  function saveEdits() { onUpdate(draft); setEditing(false) }
  function cancelEdits() { setDraft(plan); setEditing(false) }

  function addItem() {
    setDraft(prev => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function updateItem(id: string, updated: BudgetPlanItem) {
    setDraft(prev => ({ ...prev, items: prev.items.map(x => x.id === id ? updated : x) }))
  }

  function deleteItem(id: string) {
    setDraft(prev => ({ ...prev, items: prev.items.filter(x => x.id !== id) }))
  }

  function submit() {
    const updated: BudgetPlan = { ...draft, status: 'submitted', submittedAt: new Date().toISOString().slice(0, 10) }
    onUpdate(updated); setDraft(updated)
  }

  function markReviewed() {
    const updated: BudgetPlan = {
      ...plan, status: 'reviewed',
      reviewedAt: new Date().toISOString().slice(0, 10),
      reviewedBy: user?.name ?? 'Executive',
      reviewComment: reviewComment.trim() || undefined,
    }
    onUpdate(updated)
  }

  // Totals
  const totalEstimated = draft.items.reduce((s, i) => s + parseK(i.estimatedCost), 0)
  const totalUtilized  = draft.items.reduce((s, i) => s + parseK(i.utilized), 0)
  const variance       = totalEstimated - totalUtilized
  const utilizationPct = totalEstimated > 0 ? Math.min(Math.round((totalUtilized / totalEstimated) * 100), 100) : 0

  const isDraft     = draft.status === 'draft'
  const isSubmitted = plan.status === 'submitted'
  const isReviewed  = plan.status === 'reviewed'

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #bp-print-area, #bp-print-area * { visibility: visible !important; }
          #bp-print-area { position: fixed; inset: 0; padding: 24px; background: white; z-index: 9999; overflow: auto; }
          .bp-print-header { display: block !important; }
        }
        .bp-print-header { display: none; }
      `}</style>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All Plans
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{plan.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{plan.fiscalYear} · {plan.createdBy} · {plan.createdAt}</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[plan.status]}`}>
            {STATUS_LABEL[plan.status]}
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
            <button onClick={() => exportCSV(plan.items.map(i => ({
              'Budget Category': i.category,
              'Description of Items / Activities': i.description,
              'Estimated Cost (K)': i.estimatedCost,
              'Utilized (K)': i.utilized,
              'Justification / Remarks': i.justification,
            })), `${plan.title.replace(/\s+/g, '-')}-Budget-Plan`)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            {canEdit && (
              <button onClick={() => setShowDel(true)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showDel && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs text-red-700 flex-1">Delete this budget plan permanently?</p>
            <button onClick={() => { onDelete(plan.id); onBack() }} className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-red-700 transition-colors">Delete</button>
            <button onClick={() => setShowDel(false)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        )}

        {/* Printable area */}
        <div id="bp-print-area" className="bg-white border border-gray-200 rounded p-6 space-y-6">

          {/* Print letterhead */}
          <div className="bp-print-header text-center pb-4 border-b-2 border-gray-800 space-y-1">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-600">Department of Information &amp; Communications Technology</p>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide">DICT — Budget Plan</h1>
            <p className="text-xs text-gray-500">{plan.fiscalYear}</p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">1.&nbsp;&nbsp;Wing, Division and Branch</h2>
            <div className="border border-gray-300 rounded overflow-hidden max-w-lg">
              <table className="w-full text-xs">
                <tbody>
                  {([['WING', plan.wing], ['DIVISION', plan.division], ['BRANCH', plan.branch]] as [string, string][]).map(([label, val]) => (
                    <tr key={label} className="border-b border-gray-200 last:border-0">
                      <td className="px-4 py-2.5 font-bold text-gray-700 bg-gray-50 w-28 border-r border-gray-200">{label}:</td>
                      <td className="px-4 py-2.5 text-gray-900 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-sm font-bold text-blue-700 mb-3">2.&nbsp;&nbsp;Budget Plan</h2>
            <div className="overflow-x-auto border border-gray-300 rounded">
              <table className="w-full text-xs border-collapse" style={{ minWidth: 720 }}>
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    {['Budget Category', 'Description of Items / Activities', 'Estimated Cost (K)', 'Utilized (K)', 'Justification / Remarks'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-gray-700 font-bold border-r border-gray-200 last:border-r-0 whitespace-nowrap text-[11px]">{h}</th>
                    ))}
                    {editing && <th className="w-10" />}
                  </tr>
                </thead>
                <tbody>
                  {draft.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic text-xs">
                        {editing ? 'Click "Add Item" to add budget items.' : 'No items yet. Click Edit to add budget items.'}
                      </td>
                    </tr>
                  ) : draft.items.map(item => (
                    <ItemRow key={item.id} item={item} editing={editing}
                      onChange={updated => updateItem(item.id, updated)}
                      onDelete={() => deleteItem(item.id)} />
                  ))}
                  {/* Totals row */}
                  {draft.items.length > 0 && (
                    <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold">
                      <td className="px-3 py-2.5 text-xs text-gray-700 font-bold" colSpan={2}>TOTAL</td>
                      <td className="px-3 py-2.5 text-xs text-gray-900 font-black text-right whitespace-nowrap">{fmtK(totalEstimated)}</td>
                      <td className="px-3 py-2.5 text-xs text-right whitespace-nowrap">
                        <span className={`font-black ${totalUtilized > totalEstimated && totalEstimated > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {totalUtilized > 0 ? fmtK(totalUtilized) : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {totalUtilized > 0 && totalEstimated > 0 && (
                          <span className={variance >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                            {variance >= 0 ? `Under by ${fmtK(variance)}` : `Over by ${fmtK(Math.abs(variance))}`}
                          </span>
                        )}
                      </td>
                      {editing && <td />}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {editing && (
              <button onClick={addItem} className="mt-2 flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            )}
          </div>

          {/* Budget summary cards */}
          {totalEstimated > 0 && !editing && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
                <p className="text-[11px] text-blue-600 font-semibold mb-1">Total Estimated Budget</p>
                <p className="text-lg font-black text-blue-800">{fmtK(totalEstimated)}</p>
              </div>
              <div className={`border rounded p-4 text-center ${totalUtilized > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-[11px] font-semibold mb-1 ${totalUtilized > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>Total Utilized</p>
                <p className={`text-lg font-black ${totalUtilized > 0 ? 'text-emerald-800' : 'text-gray-300'}`}>
                  {totalUtilized > 0 ? fmtK(totalUtilized) : 'Not entered'}
                </p>
              </div>
              <div className={`border rounded p-4 text-center ${variance >= 0 ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-[11px] font-semibold mb-1 ${variance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {totalUtilized > 0 ? (variance >= 0 ? 'Remaining Balance' : 'Budget Overrun') : 'Utilization Rate'}
                </p>
                <p className={`text-lg font-black ${variance < 0 ? 'text-red-700' : 'text-gray-600'}`}>
                  {totalUtilized > 0 ? (variance >= 0 ? fmtK(variance) : fmtK(Math.abs(variance))) : `${utilizationPct}%`}
                </p>
              </div>
            </div>
          )}

          {/* Utilization bar */}
          {totalEstimated > 0 && totalUtilized > 0 && !editing && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Budget Utilization</span>
                <span className="font-semibold">{utilizationPct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${utilizationPct > 90 ? 'bg-red-500' : utilizationPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${utilizationPct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>K 0</span>
                <span>{fmtK(totalEstimated)}</span>
              </div>
            </div>
          )}

          {/* Print footer */}
          <div className="bp-print-header flex justify-between pt-4 border-t border-gray-300 text-[10px] text-gray-500">
            <span>Prepared by: {plan.createdBy}</span>
            <span>Submitted: {plan.submittedAt ?? '—'}</span>
            <span>Status: {STATUS_LABEL[plan.status]}</span>
          </div>
        </div>

        {/* Executive review */}
        {canReview && isSubmitted && (
          <div className="bg-white border border-blue-200 rounded p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900">Management Review</h3>
            </div>
            <p className="text-xs text-gray-500">Record comments, observations, and budget recommendations on this Branch budget plan submission.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Review Comment <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                placeholder="Add management observations, corrective guidance, or budget directives…"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <button onClick={markReviewed}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Reviewed
            </button>
          </div>
        )}

        {isReviewed && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded p-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">
                Reviewed by <span className="font-black">{plan.reviewedBy}</span> on {plan.reviewedAt}
              </p>
              {plan.reviewComment && (
                <p className="text-xs text-emerald-700 mt-1 italic leading-relaxed">&ldquo;{plan.reviewComment}&rdquo;</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, onClick }: { plan: BudgetPlan; onClick: () => void }) {
  const totalEstimated = plan.items.reduce((s, i) => s + parseK(i.estimatedCost), 0)
  const totalUtilized  = plan.items.reduce((s, i) => s + parseK(i.utilized), 0)
  const pct = totalEstimated > 0 ? Math.min(Math.round((totalUtilized / totalEstimated) * 100), 100) : 0

  return (
    <button onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded hover:border-blue-300 hover:shadow-sm transition-all p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{plan.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{plan.fiscalYear}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[plan.status]}`}>
          {STATUS_LABEL[plan.status]}
        </span>
      </div>
      <div className="space-y-1 text-[11px] text-gray-500">
        <p><span className="font-semibold text-gray-700 w-14 inline-block">Wing:</span>{plan.wing}</p>
        <p><span className="font-semibold text-gray-700 w-14 inline-block">Division:</span>{plan.division}</p>
        <p><span className="font-semibold text-gray-700 w-14 inline-block">Branch:</span>{plan.branch || '—'}</p>
      </div>
      <div className="pt-1 border-t border-gray-100 space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">{plan.items.length} budget items</span>
          <span className="font-bold text-gray-900">{totalEstimated > 0 ? fmtK(totalEstimated) : 'No budget entered'}</span>
        </div>
        {totalEstimated > 0 && totalUtilized > 0 && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Utilized</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BudgetPlanPage() {
  const { plans, addPlan, updatePlan, deletePlan } = useBudgetPlan()
  const { user } = useAuth()

  const [view, setView]         = useState<'list' | 'detail'>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNew, setShowNew]   = useState(false)
  const [filter, setFilter]     = useState<BudgetPlanStatus | 'all'>('all')

  const isManager  = user?.role === 'admin' || user?.role === 'super'
  const isExecutive = ['executive', 'deputy', 'dcs', 'super'].includes(user?.role ?? '')

  // Branch Managers (admin) only see their own plans (ToR §3.3.2)
  const visiblePlans = (isExecutive && user?.role !== 'admin')
    ? plans
    : plans.filter(p => p.createdBy === user?.name)

  const activePlan = visiblePlans.find(p => p.id === activeId) ?? null

  const filtered = visiblePlans.filter(p => filter === 'all' || p.status === filter)

  const counts = {
    all:       visiblePlans.length,
    draft:     visiblePlans.filter(p => p.status === 'draft').length,
    submitted: visiblePlans.filter(p => p.status === 'submitted').length,
    reviewed:  visiblePlans.filter(p => p.status === 'reviewed').length,
  }

  const pendingReview = visiblePlans.filter(p => p.status === 'submitted').length

  function handleCreate(p: BudgetPlan) {
    addPlan(p); setShowNew(false); setActiveId(p.id); setView('detail')
  }

  if (view === 'detail' && activePlan) {
    return (
      <PlanDetail
        plan={activePlan}
        onUpdate={updatePlan}
        onDelete={deletePlan}
        onBack={() => { setView('list'); setActiveId(null) }}
        canEdit={isManager}
        canReview={isExecutive}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Budget Plan</h1>
          <p className="text-xs text-gray-400 mt-0.5">DICT Branch Budget Planning — Estimated vs Utilized</p>
        </div>
        {isManager && (
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Plan
          </button>
        )}
      </div>

      {isExecutive && pendingReview > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded p-3">
          <Eye className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-800 font-medium">{pendingReview} budget plan{pendingReview > 1 ? 's' : ''} pending management review</p>
          <button onClick={() => setFilter('submitted')} className="ml-auto text-xs text-blue-700 font-semibold hover:underline">View</button>
        </div>
      )}

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

      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded">
          <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">{filter === 'all' ? 'No budget plans yet' : `No ${filter} plans`}</p>
          <p className="text-xs text-gray-400 mt-1">
            {isManager ? 'Click "New Plan" to create your branch budget plan.' : 'No budget plans have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PlanCard key={p.id} plan={p} onClick={() => { setActiveId(p.id); setView('detail') }} />
          ))}
        </div>
      )}

      {showNew && (
        <NewPlanModal onClose={() => setShowNew(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
