'use client'

import { useState } from 'react'
import { useWorkplan } from '@/lib/workplan-context'
import { useAuth } from '@/lib/auth-context'
import type { AnnualWorkplan, KRA, WorkplanKPI, WorkplanStatus } from '@/types'
import { DICT_DIVISIONS } from '@/lib/org-data'
import { PRIORITIES } from '@/lib/corporate-plan-data'
import {
  Plus, ChevronDown, ChevronRight, Trash2, Save,
  CheckCircle, Clock, FileEdit, Send, X, ClipboardList,
  BookMarked, CheckCircle2,
} from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<WorkplanStatus, { label: string; badge: string }> = {
  draft:     { label: 'Draft',     badge: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', badge: 'bg-blue-50 text-blue-700' },
  approved:  { label: 'Approved',  badge: 'bg-emerald-50 text-emerald-700' },
  active:    { label: 'Active',    badge: 'bg-amber-50 text-amber-700' },
}


function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyKPI(): WorkplanKPI {
  return { id: uid(), name: '', unit: '', baseline: '', q1Target: '', q2Target: '', q3Target: '', q4Target: '', annualTarget: '', responsible: '', method: '' }
}

function emptyKRA(): KRA {
  return { id: uid(), title: '', description: '', weight: 0, kpis: [emptyKPI()] }
}

// ── New Workplan Modal ─────────────────────────────────────────────────────────
function NewWorkplanModal({
  onClose, onCreate, createdBy,
}: {
  onClose: () => void
  onCreate: (wp: AnnualWorkplan) => void
  createdBy: string
}) {
  const [title, setTitle]         = useState('')
  const [year, setYear]           = useState('FY 2025/26')
  const [period, setPeriod]       = useState('Jul 2025 – Jun 2026')
  const [division, setDivision]   = useState(DICT_DIVISIONS[0])
  const [budget, setBudget]       = useState('')
  const [objective, setObjective] = useState('')
  const [spId, setSpId]           = useState('')   // selected strategic priority id
  const [error, setError]         = useState('')

  const selectedSP = PRIORITIES.find(p => p.id === spId) ?? null

  // When a strategic priority is selected, auto-fill the objective field
  function handleSelectSP(id: string) {
    setSpId(id)
    const sp = PRIORITIES.find(p => p.id === id)
    if (sp && !objective.trim()) {
      setObjective(sp.description)
    }
  }

  // Build KRAs from the selected strategic priority's objectives
  function buildKRAsFromSP(): KRA[] {
    if (!selectedSP) return [emptyKRA()]
    return selectedSP.objectives.map(obj => ({
      id: uid(),
      title: obj.title,
      description: obj.description,
      weight: Math.round(100 / selectedSP.objectives.length),
      kpis: obj.kpis.map(k => ({
        id: uid(),
        name: k.name,
        unit: '',
        baseline: k.baseline,
        q1Target: '',
        q2Target: '',
        q3Target: '',
        q4Target: '',
        annualTarget: k.target,
        responsible: '',
        method: '',
      })),
    }))
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Workplan title is required.'); return }
    const wp: AnnualWorkplan = {
      id: uid(),
      title: title.trim(),
      fiscalYear: year,
      period,
      division,
      objective,
      budget: parseFloat(budget.replace(/,/g, '')) || 0,
      createdBy,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      kras: buildKRAsFromSP(),
      strategicPriorityId: selectedSP?.id,
      strategicPriorityTitle: selectedSP?.title,
    }
    onCreate(wp)
    onClose()
  }

  const inputCls = 'w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[11px] font-semibold text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-xl shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-900">New Annual Workplan</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Create a new M&amp;E workplan aligned to the Corporate Plan</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>
          )}

          {/* ── Corporate Plan Alignment ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-blue-700 shrink-0" />
              <p className="text-xs font-bold text-blue-800">Corporate Plan Alignment</p>
            </div>
            <div>
              <label className={labelCls}>
                Strategic Priority <span className="text-red-500">*</span>
                <span className="ml-1 text-[10px] font-normal text-gray-400">— KRAs and KPIs will be pre-filled from the selected priority</span>
              </label>
              <select
                className={`${inputCls} border-blue-300 focus:ring-blue-600`}
                value={spId}
                onChange={e => handleSelectSP(e.target.value)}
                required
              >
                <option value="">— Select a Strategic Priority —</option>
                {PRIORITIES.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.priority} · {sp.title}</option>
                ))}
              </select>
            </div>

            {/* Preview of what will be pre-populated */}
            {selectedSP && (
              <div className="bg-white border border-blue-100 rounded p-3 space-y-2">
                <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
                  Will pre-populate {selectedSP.objectives.length} KRA{selectedSP.objectives.length !== 1 ? 's' : ''}
                </p>
                {selectedSP.objectives.map((obj, i) => (
                  <div key={obj.id} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
                      style={{ background: selectedSP.color }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800">{obj.title}</p>
                      <p className="text-[10px] text-gray-400">
                        {obj.kpis.length} KPI{obj.kpis.length !== 1 ? 's' : ''}: {obj.kpis.map(k => k.name).join(' · ')}
                      </p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Workplan Details ── */}
          <div>
            <label className={labelCls}>Workplan Title <span className="text-red-500">*</span></label>
            <input className={inputCls} placeholder="e.g. Annual M&E Workplan 2025/26" value={title}
              onChange={e => { setTitle(e.target.value); setError('') }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fiscal Year</label>
              <input className={inputCls} placeholder="FY 2025/26" value={year} onChange={e => setYear(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Period</label>
              <input className={inputCls} placeholder="Jul 2025 – Jun 2026" value={period} onChange={e => setPeriod(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Division</label>
              <select className={inputCls} value={division} onChange={e => setDivision(e.target.value)}>
                {DICT_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Total Budget (PGK)</label>
              <input type="number" min={0} className={inputCls} placeholder="0.00" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Objective / Purpose</label>
            <textarea rows={2} className={`${inputCls} resize-none`}
              placeholder="Describe the overall objective of this workplan"
              value={objective} onChange={e => setObjective(e.target.value)} />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Create Workplan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── KPI Row ───────────────────────────────────────────────────────────────────
function KPIRow({
  kpi, index, readOnly, onChange, onDelete,
}: {
  kpi: WorkplanKPI; index: number; readOnly: boolean
  onChange: (k: WorkplanKPI) => void; onDelete: () => void
}) {
  function f(field: keyof WorkplanKPI, val: string) {
    onChange({ ...kpi, [field]: val })
  }

  const cell = 'border border-gray-200 rounded px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white'
  const ro   = 'text-xs text-gray-700 px-2 py-1.5'

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 align-top">
      <td className="px-3 py-2 text-[10px] text-gray-400 text-center w-7">{index + 1}</td>
      <td className="px-2 py-2 min-w-45">
        {readOnly ? <span className={ro}>{kpi.name}</span>
          : <input className={cell} value={kpi.name} placeholder="KPI name" onChange={e => f('name', e.target.value)} />}
      </td>
      <td className="px-2 py-2 w-16">
        {readOnly ? <span className={ro}>{kpi.unit}</span>
          : <input className={cell} value={kpi.unit} placeholder="Unit" onChange={e => f('unit', e.target.value)} />}
      </td>
      <td className="px-2 py-2 w-20">
        {readOnly ? <span className={ro}>{kpi.baseline}</span>
          : <input className={cell} value={kpi.baseline} placeholder="0" onChange={e => f('baseline', e.target.value)} />}
      </td>
      {(['q1Target','q2Target','q3Target','q4Target'] as const).map(q => (
        <td key={q} className="px-2 py-2 w-16">
          {readOnly ? <span className={ro}>{kpi[q]}</span>
            : <input className={cell} value={kpi[q]} placeholder="0" onChange={e => f(q, e.target.value)} />}
        </td>
      ))}
      <td className="px-2 py-2 w-20 font-semibold">
        {readOnly ? <span className={`${ro} text-blue-700 font-bold`}>{kpi.annualTarget}</span>
          : <input className={`${cell} border-blue-300`} value={kpi.annualTarget} placeholder="0" onChange={e => f('annualTarget', e.target.value)} />}
      </td>
      <td className="px-2 py-2 min-w-30">
        {readOnly ? <span className={ro}>{kpi.responsible}</span>
          : <input className={cell} value={kpi.responsible} placeholder="Officer name" onChange={e => f('responsible', e.target.value)} />}
      </td>
      <td className="px-2 py-2 min-w-35">
        {readOnly ? <span className={ro}>{kpi.method}</span>
          : <input className={cell} value={kpi.method} placeholder="Measurement method" onChange={e => f('method', e.target.value)} />}
      </td>
      {!readOnly && (
        <td className="px-2 py-2 w-8">
          <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors mt-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      )}
    </tr>
  )
}

// ── KRA Section ───────────────────────────────────────────────────────────────
const KRA_COLORS = ['#3B82F6','#10B981','#D97706','#8B5CF6','#CE1126']

function KRASection({
  kra, index, readOnly, onChange, onDelete,
}: {
  kra: KRA; index: number; readOnly: boolean
  onChange: (k: KRA) => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  const color = KRA_COLORS[index % KRA_COLORS.length]

  function updateKPI(i: number, updated: WorkplanKPI) {
    const kpis = [...kra.kpis]; kpis[i] = updated; onChange({ ...kra, kpis })
  }

  function deleteKPI(i: number) {
    onChange({ ...kra, kpis: kra.kpis.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      {/* KRA header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-gray-50/60 transition-colors"
        style={{ borderLeft: `3px solid ${color}` }}
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black shrink-0"
          style={{ background: color }}>
          {index + 1}
        </div>

        {readOnly ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{kra.title || 'Untitled KRA'}</p>
            {kra.description && <p className="text-xs text-gray-400 truncate">{kra.description}</p>}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
            <input
              className="border border-gray-200 rounded px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={kra.title} placeholder="KRA Title"
              onClick={e => e.stopPropagation()}
              onChange={e => onChange({ ...kra, title: e.target.value })}
            />
            <input
              className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={kra.description} placeholder="Description (optional)"
              onClick={e => e.stopPropagation()}
              onChange={e => onChange({ ...kra, description: e.target.value })}
            />
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">Weight</span>
            {readOnly ? (
              <span className="text-sm font-black" style={{ color }}>{kra.weight}%</span>
            ) : (
              <>
                <input
                  type="number" min={0} max={100}
                  className="w-14 border border-gray-200 rounded px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                  value={kra.weight} placeholder="0"
                  onClick={e => e.stopPropagation()}
                  onChange={e => onChange({ ...kra, weight: Number(e.target.value) })}
                />
                <span className="text-[10px] text-gray-400">%</span>
              </>
            )}
          </div>

          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {kra.kpis.length} KPI{kra.kpis.length !== 1 ? 's' : ''}
          </span>

          {!readOnly && (
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {open
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* KPI table */}
      {open && (
        <div className="border-t border-gray-100 overflow-x-auto">
          <table className="w-full text-xs min-w-225">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-gray-400 font-medium w-7">#</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">KPI Name</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Unit</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Baseline</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Q1</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Q2</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Q3</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Q4</th>
                <th className="px-2 py-2 text-left text-blue-600 font-semibold">Annual Target</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Responsible</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Measurement Method</th>
                {!readOnly && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {kra.kpis.map((kpi, i) => (
                <KPIRow
                  key={kpi.id} kpi={kpi} index={i} readOnly={readOnly}
                  onChange={updated => updateKPI(i, updated)}
                  onDelete={() => deleteKPI(i)}
                />
              ))}
            </tbody>
          </table>

          {!readOnly && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/40">
              <button
                onClick={() => onChange({ ...kra, kpis: [...kra.kpis, emptyKPI()] })}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add KPI
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkplanPage() {
  const { user } = useAuth()
  const { workplans, addWorkplan, updateWorkplan, deleteWorkplan } = useWorkplan()
  const [activeId, setActiveId]     = useState<string | null>(null)
  const [editing, setEditing]       = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [saved, setSaved]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const active = workplans.find(w => w.id === activeId) ?? workplans[0] ?? null

  function updateActive(wp: AnnualWorkplan) {
    updateWorkplan(wp)
  }

  function updateKRA(i: number, kra: KRA) {
    if (!active) return
    const kras = [...active.kras]; kras[i] = kra
    updateActive({ ...active, kras })
  }

  function deleteKRA(i: number) {
    if (!active) return
    updateActive({ ...active, kras: active.kras.filter((_, idx) => idx !== i) })
  }

  function handleSave() {
    // Explicitly persist the current workplan state — don't rely solely on
    // per-keystroke updates in case any were lost due to batching.
    if (active) updateWorkplan(active)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleSubmit() {
    if (!active) return
    updateActive({ ...active, status: 'submitted' })
    setEditing(false)
  }

  function handleCreate(wp: AnnualWorkplan) {
    addWorkplan(wp)
    setActiveId(wp.id)
    setEditing(true)
  }

  function handleDelete() {
    if (!active) return
    deleteWorkplan(active.id)
    setActiveId(null)
    setEditing(false)
    setConfirmDelete(false)
  }

  const totalWeight = active?.kras.reduce((s, k) => s + k.weight, 0) ?? 0

  return (
    <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 min-h-full">

      {showModal && (
        <NewWorkplanModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          createdBy={user?.name ?? 'Unknown'}
        />
      )}

      {/* ── Left panel: workplan list ──────────────────────────────────────── */}
      <div className="w-full md:w-64 md:shrink-0 flex flex-col gap-3">

        {/* Panel header */}
        <div className="bg-white border border-gray-200 rounded-sm px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-900">Workplans</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{workplans.length} plan{workplans.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>

        {/* List */}
        <div className="space-y-1.5">
          {workplans.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-sm px-4 py-6 text-center">
              <p className="text-xs text-gray-400">No workplans yet.</p>
              <button onClick={() => setShowModal(true)}
                className="mt-2 text-[11px] text-blue-600 font-medium hover:underline">
                Create the first one
              </button>
            </div>
          )}
          {workplans.map(wp => {
            const cfg = STATUS_CFG[wp.status]
            const isActive = activeId === wp.id
            return (
              <button
                key={wp.id}
                onClick={() => { setActiveId(wp.id); setEditing(false); setConfirmDelete(false) }}
                className={`w-full text-left px-4 py-3 rounded-sm border transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50/60'
                }`}
              >
                <p className="text-xs font-bold text-gray-900 leading-tight truncate">{wp.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{wp.fiscalYear}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{wp.division} · {wp.kras.length} KRA{wp.kras.length !== 1 ? 's' : ''}</p>
                {wp.strategicPriorityTitle && (
                  <p className="text-[9px] text-blue-600 font-semibold mt-0.5 truncate">
                    {wp.strategicPriorityTitle}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right panel: workplan detail ───────────────────────────────────── */}
      {active ? (
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Page header card */}
          <div className="bg-white border border-gray-200 rounded-sm px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-base font-bold text-gray-900 truncate">{active.title}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_CFG[active.status].badge}`}>
                    {STATUS_CFG[active.status].label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                  <span>{active.fiscalYear}{active.period ? ` · ${active.period}` : ''}</span>
                  <span>{active.division}</span>
                  <span>By {active.createdBy} · {active.createdAt}</span>
                  {active.approvedBy && <span className="text-emerald-600 font-medium">Approved by {active.approvedBy}</span>}
                </div>
                {/* Budget + stats row */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1 text-xs">
                    <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Budget</span>
                    <span className="font-black text-emerald-700">
                      PGK {active.budget > 0 ? active.budget.toLocaleString() : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-500">
                    <span>{active.kras.length} KRAs</span>
                    <span className="text-gray-300">·</span>
                    <span>{active.kras.reduce((s, k) => s + k.kpis.length, 0)} KPIs</span>
                  </div>
                  {/* Weight indicator */}
                  <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border ${
                    totalWeight === 100
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}>
                    <span className="font-bold">Weight: {totalWeight}%</span>
                    {totalWeight !== 100 && <span className="text-[10px]">(ideally 100%)</span>}
                  </div>
                </div>
                {/* Corporate Plan alignment badge */}
                {active.strategicPriorityTitle && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <BookMarked className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="text-[10px] text-blue-700 font-semibold">
                      Aligned to Corporate Plan: {active.strategicPriorityTitle}
                    </span>
                  </div>
                )}
                {active.objective && (
                  <p className="text-[11px] text-gray-500 leading-snug mt-2 italic">{active.objective}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved
                  </span>
                )}

                {/* Delete button — always visible, requires confirmation */}
                {!editing && !confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}

                {confirmDelete && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-1.5">
                    <span className="text-xs text-red-700 font-medium">Delete this workplan?</span>
                    <button
                      onClick={handleDelete}
                      className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded transition-colors"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {active.status === 'draft' && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5" /> Edit
                  </button>
                )}

                {editing && (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 text-xs bg-blue-700 text-white px-3 py-1.5 rounded hover:bg-blue-800 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Draft
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Approval
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

                {active.status === 'submitted' && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
                    <Clock className="w-3.5 h-3.5" /> Awaiting approval
                  </span>
                )}

                {active.status === 'approved' && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded">
                    <CheckCircle className="w-3.5 h-3.5" /> Approved
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KRA list */}
          {active.kras.length > 0 ? (
            <div className="space-y-2">
              {active.kras.map((kra, i) => (
                <KRASection
                  key={kra.id} kra={kra} index={i} readOnly={!editing}
                  onChange={updated => updateKRA(i, updated)}
                  onDelete={() => deleteKRA(i)}
                />
              ))}
            </div>
          ) : (
            !editing && (
              <div className="bg-white border border-gray-200 rounded-sm py-10 text-center">
                <p className="text-sm text-gray-400">No Key Result Areas defined.</p>
                {active.status === 'draft' && (
                  <button onClick={() => setEditing(true)}
                    className="mt-2 text-xs text-blue-600 font-medium hover:underline">
                    Click Edit to add KRAs
                  </button>
                )}
              </div>
            )
          )}

          {/* Add KRA button */}
          {editing && (
            <button
              onClick={() => updateActive({ ...active, kras: [...active.kras, emptyKRA()] })}
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-sm py-4 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white"
            >
              <Plus className="w-4 h-4" />
              Add Key Result Area (KRA)
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 bg-white border border-gray-200 rounded-sm flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">No workplan selected</p>
            <p className="text-xs text-gray-400 mt-0.5">Select a workplan from the list or create a new one.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Workplan
          </button>
        </div>
      )}
    </div>
  )
}
