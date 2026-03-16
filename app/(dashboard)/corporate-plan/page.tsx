'use client'

import { useState } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2,
  TrendingUp, Wifi, ShieldCheck, FileCheck, Users2,
  Calendar, Flag,
} from 'lucide-react'
import { PRIORITIES, PLAN_META } from '@/lib/corporate-plan-data'
import type { StrategicObjective } from '@/lib/corporate-plan-data'

/* ── Icon map (keeps React imports out of the shared data module) ──────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  sp1: TrendingUp,
  sp2: Wifi,
  sp3: ShieldCheck,
  sp4: FileCheck,
  sp5: Users2,
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function pct(current: string, target: string): number {
  const c = parseFloat(current.replace(/,/g, ''))
  const t = parseFloat(target.replace(/,/g, ''))
  if (!t || !c) return 0
  return Math.min(100, Math.round((c / t) * 100))
}

/* ── KPI Progress Row ──────────────────────────────────────────────────────── */
function KPIRow({ kpi, color }: { kpi: StrategicObjective['kpis'][0]; color: string }) {
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

/* ── Objective Card ────────────────────────────────────────────────────────── */
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
          {/* Key initiatives */}
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

          {/* KPIs */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Performance Indicators</p>
            <div className="bg-gray-50 rounded p-3 space-y-0.5">
              {obj.kpis.map((kpi, i) => <KPIRow key={i} kpi={kpi} color={color} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function CorporatePlanPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(PRIORITIES.map(p => [p.id, true]))
  )

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const totalObjectives  = PRIORITIES.reduce((s, p) => s + p.objectives.length, 0)
  const totalInitiatives = PRIORITIES.reduce((s, p) =>
    s + p.objectives.reduce((ss, o) => ss + o.initiatives.length, 0), 0)

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900">{PLAN_META.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {PLAN_META.period}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Flag className="w-3.5 h-3.5 text-gray-400" />
            Endorsed by {PLAN_META.endorsedBy}
          </span>
          <span className="text-xs text-gray-400">Last reviewed: {PLAN_META.lastReviewed}</span>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-blue-700 text-white rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-2">Vision</p>
          <p className="text-sm font-medium leading-relaxed">{PLAN_META.vision}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mission</p>
          <p className="text-sm text-gray-700 leading-relaxed">{PLAN_META.mission}</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-blue-700">{PRIORITIES.length}</p>
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
        {PRIORITIES.map(sp => {
          const Icon = ICON_MAP[sp.id]
          return (
            <div key={sp.id} className={`bg-white border ${sp.borderColor} rounded-lg overflow-hidden`}>

              {/* Priority header */}
              <button
                onClick={() => toggle(sp.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg ${sp.bgColor} ${sp.borderColor} border flex items-center justify-center shrink-0`}>
                  {Icon && <Icon className={`${sp.textColor}`} style={{ width: 18, height: 18 }} />}
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

              {/* Objectives */}
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
