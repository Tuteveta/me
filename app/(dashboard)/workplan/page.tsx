'use client'

import { useState } from 'react'
import { WORKPLANS } from '@/lib/mock-data/me-data'
import type { AnnualWorkplan, KRA, WorkplanKPI, WorkplanStatus } from '@/types'
import {
  Plus, ChevronDown, ChevronRight, Trash2, Save,
  CheckCircle, Clock, FileEdit, Send, X,
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
      <td className="px-2 py-2 min-w-[180px]">
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
      <td className="px-2 py-2 min-w-[120px]">
        {readOnly ? <span className={ro}>{kpi.responsible}</span>
          : <input className={cell} value={kpi.responsible} placeholder="Officer name" onChange={e => f('responsible', e.target.value)} />}
      </td>
      <td className="px-2 py-2 min-w-[140px]">
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
function KRASection({
  kra, index, readOnly, onChange, onDelete,
}: {
  kra: KRA; index: number; readOnly: boolean
  onChange: (k: KRA) => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  const totalWeight = kra.weight

  function updateKPI(i: number, updated: WorkplanKPI) {
    const kpis = [...kra.kpis]
    kpis[i] = updated
    onChange({ ...kra, kpis })
  }

  function deleteKPI(i: number) {
    onChange({ ...kra, kpis: kra.kpis.filter((_, idx) => idx !== i) })
  }

  function addKPI() {
    onChange({ ...kra, kpis: [...kra.kpis, emptyKPI()] })
  }

  const COLORS = ['#3B82F6','#10B981','#D97706','#8B5CF6','#CE1126']
  const color  = COLORS[index % COLORS.length]

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden">
      {/* KRA header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
          style={{ background: color }}>
          {index + 1}
        </div>

        {readOnly ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{kra.title || 'Untitled KRA'}</p>
            {kra.description && <p className="text-xs text-gray-400 truncate">{kra.description}</p>}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
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

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Weight */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">Weight</span>
            {readOnly ? (
              <span className="text-sm font-black" style={{ color }}>{totalWeight}%</span>
            ) : (
              <input
                type="number" min={0} max={100}
                className="w-14 border border-gray-200 rounded px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={kra.weight} placeholder="0"
                onClick={e => e.stopPropagation()}
                onChange={e => onChange({ ...kra, weight: Number(e.target.value) })}
              />
            )}
            {!readOnly && <span className="text-[10px] text-gray-400">%</span>}
          </div>

          <span className="text-[10px] text-gray-400">{kra.kpis.length} KPI{kra.kpis.length !== 1 ? 's' : ''}</span>

          {!readOnly && (
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* KPI table */}
      {open && (
        <div className="border-t border-gray-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
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
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                onClick={addKPI}
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
  const [workplans, setWorkplans] = useState<AnnualWorkplan[]>(WORKPLANS)
  const [activeId, setActiveId]   = useState<string | null>(workplans[0]?.id ?? null)
  const [editing, setEditing]     = useState(false)
  const [showNew, setShowNew]     = useState(false)
  const [saved, setSaved]         = useState(false)

  // New workplan form state
  const [newTitle, setNewTitle]       = useState('')
  const [newYear, setNewYear]         = useState('FY 2025/26')
  const [newPeriod, setNewPeriod]     = useState('Jul 2025 – Jun 2026')
  const [newDiv, setNewDiv]           = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [newBudget, setNewBudget]     = useState('')

  const active = workplans.find(w => w.id === activeId) ?? null

  function updateActive(wp: AnnualWorkplan) {
    setWorkplans(prev => prev.map(w => w.id === wp.id ? wp : w))
  }

  function updateKRA(i: number, kra: KRA) {
    if (!active) return
    const kras = [...active.kras]
    kras[i] = kra
    updateActive({ ...active, kras })
  }

  function deleteKRA(i: number) {
    if (!active) return
    updateActive({ ...active, kras: active.kras.filter((_, idx) => idx !== i) })
  }

  function addKRA() {
    if (!active) return
    updateActive({ ...active, kras: [...active.kras, emptyKRA()] })
  }

  function handleSave() {
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleSubmit() {
    if (!active) return
    updateActive({ ...active, status: 'submitted' })
    setEditing(false)
  }

  function createWorkplan() {
    if (!newTitle.trim()) return
    const wp: AnnualWorkplan = {
      id: uid(),
      title: newTitle,
      fiscalYear: newYear,
      period: newPeriod,
      division: newDiv || 'M&E Division',
      objective: newObjective,
      budget: parseFloat(newBudget.replace(/,/g, '')) || 0,
      createdBy: 'Mary Kila',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      kras: [emptyKRA()],
    }
    setWorkplans(prev => [wp, ...prev])
    setActiveId(wp.id)
    setEditing(true)
    setShowNew(false)
    setNewTitle('')
    setNewObjective('')
    setNewBudget('')
  }

  const totalWeight = active?.kras.reduce((s, k) => s + k.weight, 0) ?? 0

  return (
    <div className="flex gap-4 h-full min-h-0">

      {/* ── Left panel: workplan list ──────────────────────────────────────── */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Workplans</p>
          <button
            onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>

        {/* New workplan form */}
        {showNew && (
          <div className="bg-white border border-blue-200 rounded-sm p-3 space-y-2">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">New Workplan</p>
            <input
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Workplan title *" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Fiscal year (e.g. FY 2025/26)" value={newYear} onChange={e => setNewYear(e.target.value)}
              />
              <input
                className="border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Period (e.g. Jul 2025 – Jun 2026)" value={newPeriod} onChange={e => setNewPeriod(e.target.value)}
              />
            </div>
            <input
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Division" value={newDiv} onChange={e => setNewDiv(e.target.value)}
            />
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-semibold">PGK</span>
              <input
                type="number" min={0}
                className="w-full border border-gray-200 rounded pl-9 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Total budget *" value={newBudget} onChange={e => setNewBudget(e.target.value)}
              />
            </div>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              placeholder="Workplan objective / purpose" value={newObjective} onChange={e => setNewObjective(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={createWorkplan}
                className="flex-1 bg-blue-700 text-white text-xs font-semibold py-1.5 rounded hover:bg-blue-800 transition-colors">
                Create
              </button>
              <button onClick={() => setShowNew(false)}
                className="px-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-1 overflow-y-auto">
          {workplans.map(wp => {
            const cfg = STATUS_CFG[wp.status]
            return (
              <button
                key={wp.id}
                onClick={() => { setActiveId(wp.id); setEditing(false) }}
                className={`w-full text-left px-3 py-3 rounded-sm border transition-colors ${
                  activeId === wp.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="text-xs font-bold text-gray-900 leading-tight truncate">{wp.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{wp.fiscalYear}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{wp.kras.length} KRAs</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right panel: workplan detail ───────────────────────────────────── */}
      {active ? (
        <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-y-auto">

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-sm px-5 py-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-base font-bold text-gray-900">{active.title}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CFG[active.status].badge}`}>
                  {STATUS_CFG[active.status].label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-2">
                <span>{active.fiscalYear}{active.period ? ` · ${active.period}` : ''}</span>
                <span>{active.division}</span>
                <span>Created by {active.createdBy} · {active.createdAt}</span>
                {active.approvedBy && <span>Approved by {active.approvedBy}</span>}
                <span>{active.kras.length} KRAs · {active.kras.reduce((s, k) => s + k.kpis.length, 0)} KPIs</span>
              </div>
              {/* Budget + objective row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1">
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Budget</span>
                  <span className="text-xs font-black text-emerald-700">
                    PGK {active.budget > 0 ? active.budget.toLocaleString() : '—'}
                  </span>
                </div>
                {active.objective && (
                  <p className="text-[11px] text-gray-500 leading-snug max-w-xl italic">
                    {active.objective}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved
                </span>
              )}

              {/* Weight indicator */}
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border ${
                totalWeight === 100 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                <span className="font-bold">Total weight: {totalWeight}%</span>
                {totalWeight !== 100 && <span className="text-[10px]">(must = 100%)</span>}
              </div>

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
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={totalWeight !== 100}
                    className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}

              {active.status === 'submitted' && (
                <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Awaiting approval
                </span>
              )}
            </div>
          </div>

          {/* KRA list */}
          <div className="space-y-2">
            {active.kras.map((kra, i) => (
              <KRASection
                key={kra.id} kra={kra} index={i} readOnly={!editing}
                onChange={updated => updateKRA(i, updated)}
                onDelete={() => deleteKRA(i)}
              />
            ))}
          </div>

          {/* Add KRA */}
          {editing && (
            <button
              onClick={addKRA}
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-sm py-3.5 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Key Result Area (KRA)
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select or create a workplan to get started.
        </div>
      )}
    </div>
  )
}
