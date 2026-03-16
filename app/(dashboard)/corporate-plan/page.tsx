'use client'

import { useState } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2,
  TrendingUp, Wifi, ShieldCheck, FileCheck, Users2,
  Calendar, Flag, Pencil, Plus, Trash2, Save, X, Lock,
} from 'lucide-react'
import { useCorporatePlan } from '@/lib/corporate-plan-context'
import type { PlanMeta } from '@/lib/corporate-plan-context'
import type { StrategicPriority, StrategicObjective, CorporateKPI } from '@/lib/corporate-plan-data'
import { useAuth } from '@/lib/auth-context'

/* ── Icon map ──────────────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  sp1: TrendingUp, sp2: Wifi, sp3: ShieldCheck, sp4: FileCheck, sp5: Users2,
}

const COLOR_OPTIONS = [
  { label: 'Blue',   color: '#3B82F6', bgColor: 'bg-blue-50',   borderColor: 'border-blue-200',   textColor: 'text-blue-700'   },
  { label: 'Green',  color: '#10B981', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700' },
  { label: 'Red',    color: '#CE1126', bgColor: 'bg-red-50',     borderColor: 'border-red-200',     textColor: 'text-red-700'    },
  { label: 'Purple', color: '#8B5CF6', bgColor: 'bg-purple-50',  borderColor: 'border-purple-200',  textColor: 'text-purple-700' },
  { label: 'Amber',  color: '#D97706', bgColor: 'bg-amber-50',   borderColor: 'border-amber-200',   textColor: 'text-amber-700'  },
  { label: 'Teal',   color: '#0D9488', bgColor: 'bg-teal-50',    borderColor: 'border-teal-200',    textColor: 'text-teal-700'   },
]

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function pct(current: string, target: string): number {
  const c = parseFloat(current.replace(/,/g, ''))
  const t = parseFloat(target.replace(/,/g, ''))
  if (!t || !c) return 0
  return Math.min(100, Math.round((c / t) * 100))
}

function uid() { return Math.random().toString(36).slice(2, 9) }

/* ── KPI Progress Row (read-only) ──────────────────────────────────────────── */
function KPIRow({ kpi }: { kpi: CorporateKPI }) {
  const p = pct(kpi.current, kpi.target)
  const barColor = p >= 75 ? '#10B981' : p >= 40 ? '#D97706' : '#EF4444'
  return (
    <div className="py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[11px] text-gray-700 font-medium flex-1">{kpi.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-gray-400">Baseline: {kpi.baseline}</span>
          <span className="text-[10px] text-gray-400">→</span>
          <span className="text-[10px] font-semibold text-gray-600">Target: {kpi.target}</span>
          <span className="text-[10px] font-black" style={{ color: barColor }}>Current: {kpi.current}</span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: barColor }} />
      </div>
    </div>
  )
}

/* ── Objective Card (read-only) ─────────────────────────────────────────────── */
function ObjectiveCard({ obj, color }: { obj: StrategicObjective; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
          style={{ borderColor: color }}>
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900">{obj.title}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{obj.description}</p>
        </div>
        <div className="shrink-0 text-gray-400 mt-0.5">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 space-y-4">
          <div className="pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Key Initiatives</p>
            <ul className="space-y-1.5">
              {obj.initiatives.map((init, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color }} />
                  <span className="text-xs text-gray-600">{init}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Performance Indicators</p>
            <div className="bg-gray-50 rounded p-3 space-y-0.5">
              {obj.kpis.map((kpi, i) => <KPIRow key={i} kpi={kpi} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── KPI Editor Row ─────────────────────────────────────────────────────────── */
function KPIEditorRow({
  kpi, onChange, onRemove,
}: { kpi: CorporateKPI; onChange: (k: CorporateKPI) => void; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-12 gap-1.5 items-center py-1.5 border-b border-gray-100 last:border-0">
      <input className="col-span-4 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="KPI name" value={kpi.name} onChange={e => onChange({ ...kpi, name: e.target.value })} />
      <input className="col-span-2 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="Baseline" value={kpi.baseline} onChange={e => onChange({ ...kpi, baseline: e.target.value })} />
      <input className="col-span-2 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="Target" value={kpi.target} onChange={e => onChange({ ...kpi, target: e.target.value })} />
      <input className="col-span-2 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="Current" value={kpi.current} onChange={e => onChange({ ...kpi, current: e.target.value })} />
      <button onClick={onRemove}
        className="col-span-2 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/* ── Objective Editor ───────────────────────────────────────────────────────── */
function ObjectiveEditor({
  obj, color, onChange, onRemove,
}: { obj: StrategicObjective; color: string; onChange: (o: StrategicObjective) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true)

  function updateInitiative(i: number, val: string) {
    const initiatives = [...obj.initiatives]
    initiatives[i] = val
    onChange({ ...obj, initiatives })
  }
  function removeInitiative(i: number) {
    onChange({ ...obj, initiatives: obj.initiatives.filter((_, idx) => idx !== i) })
  }
  function updateKPI(i: number, kpi: CorporateKPI) {
    const kpis = [...obj.kpis]
    kpis[i] = kpi
    onChange({ ...obj, kpis })
  }
  function removeKPI(i: number) {
    onChange({ ...obj, kpis: obj.kpis.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-gray-200 rounded overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: color }} />
        <div className="flex-1 min-w-0">
          <input
            className="w-full text-xs font-bold bg-transparent border-0 focus:outline-none text-gray-900 placeholder-gray-400"
            placeholder="Objective title…"
            value={obj.title}
            onChange={e => onChange({ ...obj, title: e.target.value })}
          />
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-gray-400 hover:text-gray-600">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="px-4 py-3 space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Description</label>
            <textarea rows={2} value={obj.description} onChange={e => onChange({ ...obj, description: e.target.value })}
              placeholder="Describe this objective…"
              className="mt-1 w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
          </div>

          {/* Initiatives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Key Initiatives</label>
              <button onClick={() => onChange({ ...obj, initiatives: [...obj.initiatives, ''] })}
                className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800">
                <Plus className="w-3 h-3" />Add
              </button>
            </div>
            <div className="space-y-1.5">
              {obj.initiatives.map((init, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                  <input value={init} onChange={e => updateInitiative(i, e.target.value)}
                    placeholder="Initiative…"
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <button onClick={() => removeInitiative(i)} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Performance Indicators</label>
              <button onClick={() => onChange({ ...obj, kpis: [...obj.kpis, { name: '', baseline: '', target: '', current: '' }] })}
                className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800">
                <Plus className="w-3 h-3" />Add KPI
              </button>
            </div>
            {obj.kpis.length > 0 && (
              <div className="bg-gray-50 rounded p-2">
                <div className="grid grid-cols-12 gap-1.5 mb-1">
                  {['Name', 'Baseline', 'Target', 'Current', ''].map((h, i) => (
                    <span key={i} className={`text-[9px] font-bold uppercase text-gray-400 tracking-wide ${
                      i === 0 ? 'col-span-4' : i === 4 ? 'col-span-2' : 'col-span-2'
                    }`}>{h}</span>
                  ))}
                </div>
                {obj.kpis.map((kpi, i) => (
                  <KPIEditorRow key={i} kpi={kpi}
                    onChange={k => updateKPI(i, k)}
                    onRemove={() => removeKPI(i)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Priority Editor ────────────────────────────────────────────────────────── */
function PriorityEditor({
  sp, index, onChange, onRemove,
}: { sp: StrategicPriority; index: number; onChange: (p: StrategicPriority) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true)

  function updateObjective(i: number, obj: StrategicObjective) {
    const objectives = [...sp.objectives]
    objectives[i] = obj
    onChange({ ...sp, objectives })
  }
  function removeObjective(i: number) {
    onChange({ ...sp, objectives: sp.objectives.filter((_, idx) => idx !== i) })
  }
  function addObjective() {
    onChange({ ...sp, objectives: [...sp.objectives, { id: uid(), title: '', description: '', initiatives: [], kpis: [] }] })
  }
  function selectColor(opt: typeof COLOR_OPTIONS[0]) {
    onChange({ ...sp, color: opt.color, bgColor: opt.bgColor, borderColor: opt.borderColor, textColor: opt.textColor })
  }

  return (
    <div className={`bg-white border ${sp.borderColor} rounded-lg overflow-hidden`}>
      <div className={`flex items-center gap-3 px-5 py-3 ${sp.bgColor}`}>
        <div className="w-7 h-7 rounded-full shrink-0" style={{ background: sp.color }} />
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <input
            className={`text-sm font-bold bg-transparent border-0 focus:outline-none ${sp.textColor} w-48`}
            placeholder={`Strategic Priority ${index + 1} title…`}
            value={sp.title}
            onChange={e => onChange({ ...sp, title: e.target.value })}
          />
          <input
            className="text-xs bg-transparent border-0 focus:outline-none text-gray-500 w-24"
            placeholder="Short title"
            value={sp.shortTitle}
            onChange={e => onChange({ ...sp, shortTitle: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {COLOR_OPTIONS.map(opt => (
            <button key={opt.label} onClick={() => selectColor(opt)}
              className={`w-4 h-4 rounded-full border-2 transition-all ${sp.color === opt.color ? 'border-gray-700 scale-110' : 'border-transparent'}`}
              style={{ background: opt.color }} title={opt.label} />
          ))}
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-gray-400 hover:text-gray-600 shrink-0">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <textarea rows={2} value={sp.description} onChange={e => onChange({ ...sp, description: e.target.value })}
            placeholder="Describe this strategic priority…"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Strategic Objectives ({sp.objectives.length})
              </p>
              <button onClick={addObjective}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 rounded px-2 py-1">
                <Plus className="w-3.5 h-3.5" />Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {sp.objectives.map((obj, i) => (
                <ObjectiveEditor key={obj.id} obj={obj} color={sp.color}
                  onChange={o => updateObjective(i, o)}
                  onRemove={() => removeObjective(i)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function CorporatePlanPage() {
  const { user } = useAuth()
  const { planMeta, priorities, isLoading, dbId, savePlan } = useCorporatePlan()
  const isSuper = user?.role === 'super'

  const [editing,    setEditing]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState<string | null>(null)

  // Edit state — deep clones so changes don't mutate context until saved
  const [editMeta,   setEditMeta]   = useState<PlanMeta>(planMeta)
  const [editPriorities, setEditPriorities] = useState<StrategicPriority[]>(priorities)

  // Collapsible state for read-only view
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(priorities.map(p => [p.id, true]))
  )

  function startEditing() {
    setEditMeta({ ...planMeta })
    setEditPriorities(JSON.parse(JSON.stringify(priorities))) // deep clone
    setSaveError(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setSaveError(null)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    try {
      await savePlan(editMeta, editPriorities, user.name)
      setEditing(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function addPriority() {
    const n = editPriorities.length + 1
    const color = COLOR_OPTIONS[n % COLOR_OPTIONS.length]
    setEditPriorities(prev => [...prev, {
      id: uid(),
      priority: `SP ${n}`,
      title: '',
      shortTitle: '',
      description: '',
      color: color.color,
      bgColor: color.bgColor,
      borderColor: color.borderColor,
      textColor: color.textColor,
      objectives: [],
    }])
  }

  function updatePriority(i: number, p: StrategicPriority) {
    setEditPriorities(prev => prev.map((item, idx) => idx === i ? p : item))
  }

  function removePriority(i: number) {
    setEditPriorities(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalObjectives  = priorities.reduce((s, p) => s + p.objectives.length, 0)
  const totalInitiatives = priorities.reduce((s, p) =>
    s + p.objectives.reduce((ss, o) => ss + o.initiatives.length, 0), 0)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-24 text-gray-400">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        Loading corporate plan…
      </div>
    )
  }

  /* ── Edit mode (super admin only) ───────────────────────────────────────── */
  if (editing && isSuper) {
    return (
      <div className="p-4 sm:p-6 space-y-6">

        {/* Edit header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Edit Corporate Plan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Changes are saved to the database and visible to all users.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={cancelEditing}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded hover:border-gray-300 transition-colors">
              <X className="w-4 h-4" />Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-blue-800 disabled:opacity-60 transition-colors">
              <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Plan'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}

        {/* Plan metadata */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Plan Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              ['Title',        'title',        'DICT Corporate Plan 2023–2027'],
              ['Period',       'period',       '2023 – 2027'],
              ['Endorsed By',  'endorsedBy',   'National Executive Council'],
              ['Last Reviewed','lastReviewed', 'January 2026'],
            ] as [string, keyof PlanMeta, string][]).map(([label, field, ph]) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <input value={editMeta[field]} onChange={e => setEditMeta(m => ({ ...m, [field]: e.target.value }))}
                  placeholder={ph}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vision</label>
              <textarea rows={2} value={editMeta.vision} onChange={e => setEditMeta(m => ({ ...m, vision: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mission</label>
              <textarea rows={2} value={editMeta.mission} onChange={e => setEditMeta(m => ({ ...m, mission: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Strategic priorities editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Strategic Priorities</h2>
            <button onClick={addPriority}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 border border-blue-200 bg-blue-50 px-3 py-2 rounded hover:bg-blue-100 transition-colors">
              <Plus className="w-4 h-4" />Add Priority
            </button>
          </div>
          {editPriorities.map((sp, i) => (
            <PriorityEditor key={sp.id} sp={sp} index={i}
              onChange={p => updatePriority(i, p)}
              onRemove={() => removePriority(i)} />
          ))}
          {editPriorities.length === 0 && (
            <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm">No strategic priorities yet.</p>
              <p className="text-xs mt-1">Click &quot;Add Priority&quot; to start building the corporate plan.</p>
            </div>
          )}
        </div>

        {/* Bottom save bar */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-blue-800 disabled:opacity-60 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Plan'}
          </button>
          <button onClick={cancelEditing}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:border-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  /* ── Read-only view ─────────────────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">{planMeta.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {planMeta.period}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Flag className="w-3.5 h-3.5 text-gray-400" />
              Endorsed by {planMeta.endorsedBy}
            </span>
            <span className="text-xs text-gray-400">Last reviewed: {planMeta.lastReviewed}</span>
            {!dbId && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Default data — not yet saved to database
              </span>
            )}
          </div>
        </div>
        {isSuper && (
          <button onClick={startEditing}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors shrink-0">
            <Pencil className="w-4 h-4" />Edit Plan
          </button>
        )}
        {!isSuper && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
            <Lock className="w-3.5 h-3.5" />View only
          </span>
        )}
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-blue-700 text-white rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-2">Vision</p>
          <p className="text-sm font-medium leading-relaxed">{planMeta.vision}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mission</p>
          <p className="text-sm text-gray-700 leading-relaxed">{planMeta.mission}</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-blue-700">{priorities.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Strategic Priorities</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-emerald-600">{totalObjectives}</p>
          <p className="text-xs text-gray-500 mt-0.5">Strategic Objectives</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-purple-600">{totalInitiatives}</p>
          <p className="text-xs text-gray-500 mt-0.5">Key Initiatives</p>
        </div>
      </div>

      {/* Strategic Priorities */}
      <div className="space-y-4">
        {priorities.map(sp => {
          const Icon = ICON_MAP[sp.id]
          return (
            <div key={sp.id} className={`bg-white border ${sp.borderColor} rounded-lg overflow-hidden`}>
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [sp.id]: !prev[sp.id] }))}
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg ${sp.bgColor} ${sp.borderColor} border flex items-center justify-center shrink-0`}>
                  {Icon
                    ? <Icon className={sp.textColor} style={{ width: 18, height: 18 }} />
                    : <div className="w-4 h-4 rounded-full" style={{ background: sp.color }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sp.bgColor} ${sp.textColor} ${sp.borderColor} border`}>
                      {sp.priority}
                    </span>
                    <h2 className="text-sm font-bold text-gray-900">{sp.title}</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sp.description}</p>
                </div>
                <div className="shrink-0 text-gray-400 mt-1">
                  {expanded[sp.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {expanded[sp.id] && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Strategic Objectives ({sp.objectives.length})
                  </p>
                  {sp.objectives.map(obj => (
                    <ObjectiveCard key={obj.id} obj={obj} color={sp.color} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
