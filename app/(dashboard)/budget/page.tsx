'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  Banknote, TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, BarChart3, Calendar, FileEdit, X, Save,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface BudgetLine {
  id: string
  activity: string
  allocated: number    // PGK
  q1: number
  q2: number
  q3: number
  q4: number
}

interface BudgetProgram {
  id: string
  title: string
  executiveManager?: string
  lines: BudgetLine[]
}

interface BudgetArea {
  id: string
  title: string
  shortTitle: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  totalAllocated: number
  programs: BudgetProgram[]
}

/* ── Default Data ──────────────────────────────────────────────────────────── */
const FISCAL_YEAR = 'FY 2024/25'
const QUARTER_LABELS = ['Q1 (Jul–Sep)', 'Q2 (Oct–Dec)', 'Q3 (Jan–Mar)', 'Q4 (Apr–Jun)']
const STORAGE_KEY = 'dict_me_budget_areas'

const DEFAULT_BUDGET_AREAS: BudgetArea[] = [
  {
    id: 'policy',
    title: 'Policy and Emerging Technology',
    shortTitle: 'Policy & ET',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    totalAllocated: 5_200_000,
    programs: [
      {
        id: 'policy_me',
        title: 'Policy and Monitoring & Evaluation',
        executiveManager: 'David Kapi',
        lines: [
          { id: 'p1', activity: 'Policy Development & Review',         allocated: 1_200_000, q1: 280_000, q2: 310_000, q3: 290_000, q4: 0 },
          { id: 'p2', activity: 'Monitoring & Evaluation Activities',  allocated: 800_000,   q1: 180_000, q2: 200_000, q3: 195_000, q4: 0 },
        ],
      },
      {
        id: 'partnership',
        title: 'Partnership and Sector Funding',
        executiveManager: 'Hera John',
        lines: [
          { id: 'p3', activity: 'Donor Partnership Coordination',      allocated: 1_500_000, q1: 350_000, q2: 380_000, q3: 400_000, q4: 0 },
          { id: 'p4', activity: 'Sector Funding Management',           allocated: 1_700_000, q1: 400_000, q2: 420_000, q3: 380_000, q4: 0 },
        ],
      },
    ],
  },
  {
    id: 'digital',
    title: 'Digital Government Delivery',
    shortTitle: 'Digital Govt',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    totalAllocated: 12_500_000,
    programs: [
      {
        id: 'cloud_info',
        title: 'Government Cloud and Information Delivery',
        executiveManager: 'Lizarhmarie Warike',
        lines: [
          { id: 'd1', activity: 'GovCloud Operations & Maintenance',     allocated: 3_500_000, q1: 850_000,  q2: 880_000,  q3: 870_000,  q4: 0 },
          { id: 'd2', activity: 'Digital Standards Implementation',       allocated: 1_200_000, q1: 280_000,  q2: 310_000,  q3: 300_000,  q4: 0 },
          { id: 'd3', activity: 'Data Governance Programme',              allocated: 900_000,   q1: 200_000,  q2: 230_000,  q3: 220_000,  q4: 0 },
        ],
      },
      {
        id: 'devops',
        title: 'DevOps',
        executiveManager: 'Joshua Pomalo',
        lines: [
          { id: 'd4', activity: 'DevOps Platform & Tools',               allocated: 2_100_000, q1: 500_000,  q2: 520_000,  q3: 490_000,  q4: 0 },
          { id: 'd5', activity: 'System Integration & Deployment',        allocated: 1_800_000, q1: 420_000,  q2: 450_000,  q3: 430_000,  q4: 0 },
        ],
      },
      {
        id: 'cybersec',
        title: 'Cyber Security',
        executiveManager: 'Hamilton Vagi',
        lines: [
          { id: 'd6', activity: 'Cyber Security Operations',              allocated: 2_000_000, q1: 480_000,  q2: 500_000,  q3: 510_000,  q4: 0 },
          { id: 'd7', activity: 'Social Media Monitoring',                allocated: 1_000_000, q1: 230_000,  q2: 250_000,  q3: 240_000,  q4: 0 },
        ],
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate Services',
    shortTitle: 'Corporate',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    totalAllocated: 4_800_000,
    programs: [
      {
        id: 'hr_prog',
        title: 'Human Resources',
        lines: [
          { id: 'c1', activity: 'Salaries & Allowances',                 allocated: 2_000_000, q1: 480_000,  q2: 500_000,  q3: 490_000,  q4: 0 },
          { id: 'c2', activity: 'Staff Training & Development',          allocated: 600_000,   q1: 140_000,  q2: 150_000,  q3: 145_000,  q4: 0 },
        ],
      },
      {
        id: 'fin_admin',
        title: 'Finance and Administration',
        lines: [
          { id: 'c3', activity: 'Office Operations & Administration',     allocated: 1_200_000, q1: 290_000,  q2: 300_000,  q3: 295_000,  q4: 0 },
          { id: 'c4', activity: 'IT Support & Maintenance',               allocated: 1_000_000, q1: 240_000,  q2: 250_000,  q3: 245_000,  q4: 0 },
        ],
      },
    ],
  },
  {
    id: 'executive',
    title: 'Executive Services',
    shortTitle: 'Executive',
    color: '#D97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    totalAllocated: 2_100_000,
    programs: [
      {
        id: 'office_sec',
        title: 'Office of the Secretary',
        lines: [
          { id: 'e1', activity: 'GESI Programme Activities',             allocated: 500_000,   q1: 115_000,  q2: 125_000,  q3: 120_000,  q4: 0 },
          { id: 'e2', activity: 'Internal Audit',                        allocated: 600_000,   q1: 140_000,  q2: 150_000,  q3: 145_000,  q4: 0 },
          { id: 'e3', activity: 'PS ICT Steering Committee',             allocated: 1_000_000, q1: 230_000,  q2: 250_000,  q3: 240_000,  q4: 0 },
        ],
      },
    ],
  },
]

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function spent(line: BudgetLine) { return line.q1 + line.q2 + line.q3 + line.q4 }
function fmt(n: number) {
  if (n >= 1_000_000) return `K${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `K${(n / 1_000).toFixed(0)}K`
  return `K${n}`
}
function pctBar(used: number, total: number) {
  if (!total) return 0
  return Math.min(100, Math.round((used / total) * 100))
}
function barColor(p: number) {
  if (p >= 90) return '#EF4444'
  if (p >= 70) return '#D97706'
  return '#10B981'
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function BudgetPage() {
  const { user } = useAuth()
  const canEdit = user?.role === 'finance' || user?.role === 'super'

  const [areas, setAreas] = useState<BudgetArea[]>(DEFAULT_BUDGET_AREAS)
  const [draft, setDraft] = useState<BudgetArea[]>(DEFAULT_BUDGET_AREAS)
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(DEFAULT_BUDGET_AREAS.map(a => [a.id, true]))
  )
  const [activeQuarter, setActiveQuarter] = useState<'all' | 'q1' | 'q2' | 'q3' | 'q4'>('all')

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved: BudgetArea[] = JSON.parse(raw)
        setAreas(saved)
        setDraft(saved)
        setExpanded(Object.fromEntries(saved.map(a => [a.id, true])))
      }
    } catch {}
  }, [])

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(areas)))  // deep copy
    setEditing(true)
  }

  function cancelEdit() {
    setDraft(JSON.parse(JSON.stringify(areas)))
    setEditing(false)
  }

  function saveEdit() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)) } catch {}
    setAreas(draft)
    setEditing(false)
  }

  // Update a single number field on a budget line
  function setLineField(areaId: string, progId: string, lineId: string, field: keyof BudgetLine, raw: string) {
    const val = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
    setDraft(prev => prev.map(a => a.id !== areaId ? a : {
      ...a,
      programs: a.programs.map(p => p.id !== progId ? p : {
        ...p,
        lines: p.lines.map(l => l.id !== lineId ? l : { ...l, [field]: val }),
      }),
    }))
  }

  // Update totalAllocated for an area
  function setAreaAllocated(areaId: string, raw: string) {
    const val = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
    setDraft(prev => prev.map(a => a.id !== areaId ? a : { ...a, totalAllocated: val }))
  }

  const activeAreas = editing ? draft : areas

  // Totals
  const totalAllocated = activeAreas.reduce((s, a) => s + a.totalAllocated, 0)
  const totalSpent = activeAreas.reduce((s, a) =>
    s + a.programs.reduce((ss, p) =>
      ss + p.lines.reduce((sss, l) => sss + spent(l), 0), 0), 0)
  const totalRemaining = totalAllocated - totalSpent
  const totalPct = pctBar(totalSpent, totalAllocated)

  const qTotals = (['q1', 'q2', 'q3', 'q4'] as const).map(q =>
    activeAreas.reduce((s, a) =>
      s + a.programs.reduce((ss, p) =>
        ss + p.lines.reduce((sss, l) => sss + l[q], 0), 0), 0)
  )

  const inputCls = "w-full text-right bg-white border border-blue-300 rounded px-1.5 py-0.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-gray-900">Expenditure Budget</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {FISCAL_YEAR} — Budget allocation and expenditure by functional area
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quarter filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded p-0.5">
            {([['all','All'], ['q1','Q1'], ['q2','Q2'], ['q3','Q3'], ['q4','Q4']] as const).map(([q, label]) => (
              <button
                key={q}
                onClick={() => setActiveQuarter(q)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  activeQuarter === q
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Edit controls — Finance only */}
          {canEdit && !editing && (
            <button onClick={startEdit}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded hover:bg-gray-50 transition-colors">
              <FileEdit className="w-3.5 h-3.5" /> Edit Data
            </button>
          )}
          {editing && (
            <>
              <button onClick={cancelEdit}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded hover:bg-gray-50 transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={saveEdit}
                className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-blue-800 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit notice */}
      {editing && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-800">
          <FileEdit className="w-3.5 h-3.5 shrink-0" />
          <span>Edit mode — click any <strong>Allocated</strong> or quarterly expenditure cell to update the value. Click <strong>Save Changes</strong> when done.</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Budget</span>
          </div>
          <p className="text-2xl font-black text-blue-700">{fmt(totalAllocated)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{FISCAL_YEAR} allocation</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expended</span>
          </div>
          <p className="text-2xl font-black text-amber-700">{fmt(totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{totalPct}% of total budget</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Remaining</span>
          </div>
          <p className="text-2xl font-black text-emerald-700">{fmt(totalRemaining)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{100 - totalPct}% uncommitted</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Utilisation</span>
          </div>
          <p className="text-2xl font-black" style={{ color: barColor(totalPct) }}>{totalPct}%</p>
          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${totalPct}%`, background: barColor(totalPct) }} />
          </div>
        </div>
      </div>

      {/* Quarterly breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-900">Quarterly Expenditure — {FISCAL_YEAR}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUARTER_LABELS.map((label, i) => {
            const qKey = (['q1', 'q2', 'q3', 'q4'] as const)[i]
            const q = qTotals[i]
            const quarterBudget = totalAllocated / 4
            const p = pctBar(q, quarterBudget)
            const isFuture = qKey === 'q4'
            return (
              <div key={label} className={`border rounded-lg p-3 ${isFuture ? 'border-dashed border-gray-200 bg-gray-50/50' : 'border-gray-200 bg-white'}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-black ${isFuture ? 'text-gray-300' : 'text-gray-900'}`}>
                  {isFuture ? '—' : fmt(q)}
                </p>
                {!isFuture && (
                  <>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p}%`, background: barColor(p) }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{p}% of Q budget</p>
                  </>
                )}
                {isFuture && <p className="text-[10px] text-gray-300 mt-1">Not yet expended</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Area-by-area breakdown */}
      <div className="space-y-4">
        {activeAreas.map(area => {
          const areaSpent = area.programs.reduce((s, p) =>
            s + p.lines.reduce((ss, l) => ss + spent(l), 0), 0)
          const areaPct = pctBar(areaSpent, area.totalAllocated)
          const areaRemaining = area.totalAllocated - areaSpent

          return (
            <div key={area.id} className={`bg-white border ${area.borderColor} rounded-lg overflow-hidden`}>

              {/* Area header */}
              <button
                onClick={() => toggle(area.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2 className="text-sm font-bold text-gray-900">{area.title}</h2>
                    {areaPct >= 90 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" /> Over 90%
                      </span>
                    )}
                    {areaPct < 50 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> On track
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${areaPct}%`, background: barColor(areaPct) }} />
                    </div>
                    <span className="text-xs font-black shrink-0" style={{ color: barColor(areaPct) }}>{areaPct}%</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[11px] text-gray-400">
                    <span>Allocated: {editing
                      ? <input
                          type="number"
                          defaultValue={area.totalAllocated}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setAreaAllocated(area.id, e.target.value)}
                          className="w-28 bg-white border border-blue-300 rounded px-1.5 py-0.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      : <span className="font-semibold text-gray-700">{fmt(area.totalAllocated)}</span>
                    }</span>
                    <span>Expended: <span className="font-semibold text-amber-700">{fmt(areaSpent)}</span></span>
                    <span>Remaining: <span className="font-semibold text-emerald-700">{fmt(areaRemaining)}</span></span>
                  </div>
                </div>
                <div className="shrink-0 text-gray-400">
                  {expanded[area.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Programs & lines */}
              {expanded[area.id] && (
                <div className="border-t border-gray-100">
                  {area.programs.map((prog, pi) => {
                    const progSpent = prog.lines.reduce((s, l) => s + spent(l), 0)
                    const progAllocated = prog.lines.reduce((s, l) => s + l.allocated, 0)
                    return (
                      <div key={prog.id} className={pi > 0 ? 'border-t border-gray-100' : ''}>
                        {/* Program sub-header */}
                        <div className="px-5 py-2.5 bg-gray-50/60 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-gray-700">{prog.title}</p>
                            {prog.executiveManager && (
                              <p className="text-[10px] text-gray-400">Exec. Manager: {prog.executiveManager}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-gray-800">{fmt(progSpent)} <span className="font-normal text-gray-400">/ {fmt(progAllocated)}</span></p>
                            <p className="text-[10px] text-gray-400">{pctBar(progSpent, progAllocated)}% expended</p>
                          </div>
                        </div>

                        {/* Budget lines table */}
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-180 text-xs">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="px-5 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Activity / Budget Line</th>
                                <th className={`px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide ${editing ? 'text-blue-600' : 'text-gray-400'}`}>
                                  Allocated {editing && <span className="normal-case font-normal">(editable)</span>}
                                </th>
                                {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
                                  <th key={q} className={`px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide ${editing ? 'text-blue-600' : 'text-gray-400'}`}>
                                    Q{i+1} {editing && <span className="normal-case font-normal">(K)</span>}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Total Spent</th>
                                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Remaining</th>
                                <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prog.lines.map(line => {
                                const lineSpent = spent(line)
                                const lineRemaining = line.allocated - lineSpent
                                const linePct = pctBar(lineSpent, line.allocated)
                                const highlight = activeQuarter !== 'all'
                                return (
                                  <tr key={line.id} className="border-b border-gray-50 hover:bg-gray-50/40 align-middle">
                                    <td className="px-5 py-2.5 font-medium text-gray-800">{line.activity}</td>

                                    {/* Allocated — editable */}
                                    <td className="px-3 py-2 text-right">
                                      {editing
                                        ? <input type="number" defaultValue={line.allocated}
                                            onChange={e => setLineField(area.id, prog.id, line.id, 'allocated', e.target.value)}
                                            className={inputCls} style={{ width: 96 }} />
                                        : <span className="font-semibold text-gray-700">{fmt(line.allocated)}</span>
                                      }
                                    </td>

                                    {/* Q1–Q4 — editable */}
                                    {(['q1', 'q2', 'q3', 'q4'] as const).map(q => (
                                      <td key={q} className={`px-3 py-2 text-right ${
                                        !editing && highlight && activeQuarter === q
                                          ? 'font-bold text-blue-700 bg-blue-50'
                                          : ''
                                      }`}>
                                        {editing
                                          ? <input type="number" defaultValue={line[q]}
                                              onChange={e => setLineField(area.id, prog.id, line.id, q, e.target.value)}
                                              className={inputCls} style={{ width: 84 }} />
                                          : <span className={line[q] === 0 ? 'text-gray-300' : 'text-gray-600'}>
                                              {line[q] === 0 ? '—' : fmt(line[q])}
                                            </span>
                                        }
                                      </td>
                                    ))}

                                    <td className="px-3 py-2.5 text-right font-bold text-amber-700">{fmt(lineSpent)}</td>
                                    <td className={`px-3 py-2.5 text-right font-semibold ${lineRemaining < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                      {fmt(lineRemaining)}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <div className="flex items-center gap-1.5 justify-end">
                                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <div className="h-full rounded-full" style={{ width: `${linePct}%`, background: barColor(linePct) }} />
                                        </div>
                                        <span className="text-[10px] font-bold w-7 text-right" style={{ color: barColor(linePct) }}>{linePct}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer totals */}
      <div className="bg-gray-900 text-white rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Grand Total — {FISCAL_YEAR}</p>
            <p className="text-2xl font-black">{fmt(totalAllocated)} <span className="text-gray-400 text-base font-normal">allocated</span></p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Expended</p>
              <p className="text-lg font-black text-amber-400">{fmt(totalSpent)}</p>
              <p className="text-[10px] text-gray-400">{totalPct}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Remaining</p>
              <p className="text-lg font-black text-emerald-400">{fmt(totalRemaining)}</p>
              <p className="text-[10px] text-gray-400">{100 - totalPct}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Q3 YTD (3 Qtrs)</p>
              <p className="text-lg font-black text-blue-400">{fmt(qTotals[0] + qTotals[1] + qTotals[2])}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${totalPct}%`, background: totalPct >= 90 ? '#EF4444' : totalPct >= 70 ? '#F59E0B' : '#10B981' }} />
        </div>
      </div>

    </div>
  )
}
