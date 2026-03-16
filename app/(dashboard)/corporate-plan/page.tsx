'use client'

import { useState } from 'react'
import {
  Target, ChevronDown, ChevronRight, CheckCircle2,
  TrendingUp, Wifi, ShieldCheck, FileCheck, Users2,
  Calendar, Flag,
} from 'lucide-react'

/* ── Data ──────────────────────────────────────────────────────────────────── */
interface StrategicObjective {
  id: string
  title: string
  description: string
  initiatives: string[]
  kpis: { name: string; baseline: string; target: string; current: string }[]
}

interface StrategicPriority {
  id: string
  priority: string
  title: string
  shortTitle: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  objectives: StrategicObjective[]
}

const PRIORITIES: StrategicPriority[] = [
  {
    id: 'sp1',
    priority: 'SP 1',
    title: 'Digital Government Delivery',
    shortTitle: 'Digital Govt',
    description: 'Transform government service delivery through digital technologies to improve citizen access, efficiency, and transparency.',
    icon: TrendingUp,
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    objectives: [
      {
        id: 'sp1o1',
        title: 'Deploy citizen-facing digital services',
        description: 'Migrate key government services online via the GovCloud platform.',
        initiatives: [
          'Launch National ID digital portal',
          'Deploy e-Government Service Gateway',
          'Integrate 5 agencies onto GovCloud',
          'Roll out SMS/USSD service notifications',
        ],
        kpis: [
          { name: 'Digital services deployed', baseline: '3', target: '20', current: '11' },
          { name: 'Agencies on GovCloud',       baseline: '2', target: '10', current: '6'  },
          { name: 'Online transactions (monthly)', baseline: '500', target: '5,000', current: '2,340' },
        ],
      },
      {
        id: 'sp1o2',
        title: 'Expand government cloud infrastructure',
        description: 'Build and expand the Government Cloud to support all major agencies.',
        initiatives: [
          'Upgrade GovCloud data centre capacity',
          'Implement disaster recovery site',
          'Deploy cloud monitoring tools',
        ],
        kpis: [
          { name: 'GovCloud uptime (%)',       baseline: '95', target: '99.9', current: '98.7' },
          { name: 'Storage capacity (TB)',      baseline: '50', target: '500',  current: '180'  },
        ],
      },
    ],
  },
  {
    id: 'sp2',
    priority: 'SP 2',
    title: 'ICT Infrastructure & Connectivity',
    shortTitle: 'Infrastructure',
    description: 'Build reliable, secure, and scalable ICT infrastructure to connect government agencies and underserved communities across PNG.',
    icon: Wifi,
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    objectives: [
      {
        id: 'sp2o1',
        title: 'Expand government network connectivity',
        description: 'Connect all provincial and district government offices to the national government network.',
        initiatives: [
          'Extend GWAN to 15 provincial capitals',
          'Deploy satellite connectivity for remote offices',
          'Upgrade bandwidth on inter-agency links',
          'Establish network operations centre (NOC)',
        ],
        kpis: [
          { name: 'Provincial offices connected (%)', baseline: '40', target: '100', current: '67' },
          { name: 'Average bandwidth (Mbps)',          baseline: '10', target: '100', current: '45' },
          { name: 'Network availability (%)',          baseline: '90', target: '99',  current: '95' },
        ],
      },
    ],
  },
  {
    id: 'sp3',
    priority: 'SP 3',
    title: 'Cyber Security & Data Governance',
    shortTitle: 'Cyber Security',
    description: 'Protect government information assets, data, and ICT systems against cyber threats and ensure responsible data governance.',
    icon: ShieldCheck,
    color: '#CE1126',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    objectives: [
      {
        id: 'sp3o1',
        title: 'Strengthen government cybersecurity posture',
        description: 'Implement whole-of-government cyber security standards and incident response capability.',
        initiatives: [
          'Establish Government CERT (Computer Emergency Response Team)',
          'Deploy government-wide SIEM solution',
          'Conduct annual cyber security audits',
          'Deliver cyber awareness training to 500 public servants',
        ],
        kpis: [
          { name: 'Critical incidents (year)',   baseline: '12', target: '0',  current: '2'  },
          { name: 'Agencies audited',            baseline: '3',  target: '15', current: '8'  },
          { name: 'Staff trained (cyber)',        baseline: '50', target: '500', current: '210' },
        ],
      },
      {
        id: 'sp3o2',
        title: 'Implement national data governance framework',
        description: 'Develop policies and systems for responsible government data management and sharing.',
        initiatives: [
          'Draft National Data Governance Policy',
          'Establish data classification standards',
          'Deploy data catalogue for government datasets',
        ],
        kpis: [
          { name: 'Data policies enacted',        baseline: '1', target: '5', current: '3' },
          { name: 'Datasets catalogued',           baseline: '0', target: '50', current: '18' },
        ],
      },
    ],
  },
  {
    id: 'sp4',
    priority: 'SP 4',
    title: 'Policy, Legislation & ICT Standards',
    shortTitle: 'Policy & Standards',
    description: 'Develop a comprehensive ICT policy and legislative framework that governs digital transformation across the Government of PNG.',
    icon: FileCheck,
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    objectives: [
      {
        id: 'sp4o1',
        title: 'Develop and enact ICT legislation',
        description: 'Modernise the ICT Act and supporting regulations to enable digital government.',
        initiatives: [
          'Review and update the ICT Act',
          'Draft Electronic Transactions Regulation',
          'Develop Open Data Policy',
          'Publish ICT Standards Framework',
        ],
        kpis: [
          { name: 'ICT policies enacted',          baseline: '2', target: '8', current: '5' },
          { name: 'ICT standards published',        baseline: '1', target: '10', current: '4' },
          { name: 'Regulatory reviews completed',   baseline: '0', target: '3', current: '1' },
        ],
      },
    ],
  },
  {
    id: 'sp5',
    priority: 'SP 5',
    title: 'Institutional Capacity & Human Capital',
    shortTitle: 'Capacity',
    description: 'Build DICT's organisational capacity and develop ICT skills across the public service to sustain digital transformation.',
    icon: Users2,
    color: '#D97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    objectives: [
      {
        id: 'sp5o1',
        title: 'Strengthen DICT organisational capability',
        description: 'Recruit, train, and retain qualified ICT professionals to deliver DICT's mandate.',
        initiatives: [
          'Fill all vacant ICT positions',
          'Implement HR succession planning',
          'Partner with UPNG and DWU for ICT graduates',
          'Roll out staff performance management system',
        ],
        kpis: [
          { name: 'Positions filled (%)',         baseline: '60', target: '100', current: '78' },
          { name: 'Staff trained (annual)',        baseline: '20', target: '100', current: '55' },
          { name: 'Staff retention rate (%)',      baseline: '70', target: '90',  current: '82' },
        ],
      },
    ],
  },
]

const PLAN_META = {
  title: 'DICT Corporate Plan 2023–2027',
  period: '2023 – 2027',
  vision: 'A digitally connected Papua New Guinea where every citizen benefits from reliable, secure, and inclusive ICT services.',
  mission: 'To lead, coordinate and support the digitisation of Government services and ICT development for the people of Papua New Guinea.',
  preparedBy: 'Department of Information Communication & Technology',
  endorsedBy: 'National Executive Council',
  lastReviewed: 'January 2026',
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

  const totalObjectives = PRIORITIES.reduce((s, p) => s + p.objectives.length, 0)
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
        {PRIORITIES.map(sp => (
          <div key={sp.id} className={`bg-white border ${sp.borderColor} rounded-lg overflow-hidden`}>

            {/* Priority header */}
            <button
              onClick={() => toggle(sp.id)}
              className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg ${sp.bgColor} ${sp.borderColor} border flex items-center justify-center shrink-0`}>
                <sp.icon className={`w-4.5 h-4.5 ${sp.textColor}`} style={{ width: 18, height: 18 }} />
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
        ))}
      </div>
    </div>
  )
}
