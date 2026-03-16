'use client'

import { useState } from 'react'
import { FUNCTIONAL_AREAS, DICT_PEOPLE } from '@/lib/org-data'
import type { UserRole } from '@/types'
import { Building2, ChevronDown, ChevronRight, Users, Briefcase, Activity } from 'lucide-react'

/* ── Role display config ────────────────────────────────────────────────────── */
const ROLE_CFG: Record<UserRole, { label: string; badge: string }> = {
  super:     { label: 'System',     badge: 'bg-red-100 text-red-800 border-red-300' },
  deputy:    { label: 'Deputy',     badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  dcs:       { label: 'Director',   badge: 'bg-teal-100 text-teal-800 border-teal-300' },
  executive: { label: 'Executive',  badge: 'bg-purple-100 text-purple-800 border-purple-300' },
  finance:   { label: 'Secretary',  badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  admin:     { label: 'Manager',    badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  officer:   { label: 'Officer',    badge: 'bg-gray-100 text-gray-700 border-gray-300' },
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CFG[role]
  return (
    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.badge} whitespace-nowrap`}>
      {cfg.label}
    </span>
  )
}

export default function OrganisationPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(FUNCTIONAL_AREAS.map(fa => [fa.id, true]))
  )

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900">Organisation Structure</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Department of Information Communication &amp; Technology — Functional Areas, Programs &amp; Activities
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FUNCTIONAL_AREAS.map(fa => (
          <div key={fa.id} className={`${fa.color} ${fa.borderColor} border rounded-lg p-3`}>
            <p className={`text-xs font-bold ${fa.textColor} truncate`}>{fa.shortTitle}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{fa.headRole}</p>
            <p className="text-xs font-semibold text-gray-700 mt-0.5 truncate">{fa.head}</p>
            <div className="mt-1">
              <RoleBadge role={fa.headSystemRole} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{fa.programs.length} program{fa.programs.length !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Functional Areas */}
      <div className="space-y-4">
        {FUNCTIONAL_AREAS.map(fa => (
          <div key={fa.id} className={`bg-white border ${fa.borderColor} rounded-lg overflow-hidden`}>

            {/* FA Header */}
            <button
              onClick={() => toggle(fa.id)}
              className={`w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors`}
            >
              <div className={`w-8 h-8 rounded-lg ${fa.color} ${fa.borderColor} border flex items-center justify-center shrink-0`}>
                <Building2 className={`w-4 h-4 ${fa.textColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-gray-900">{fa.title}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fa.color} ${fa.textColor} ${fa.borderColor} border`}>
                    {fa.headRole}
                  </span>
                  <RoleBadge role={fa.headSystemRole} />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  <span className="font-semibold">{fa.head}</span>
                  {fa.note && <span className="text-gray-400 ml-2 text-[11px] italic">{fa.note}</span>}
                </p>
              </div>
              <div className="shrink-0 text-gray-400">
                {expanded[fa.id]
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />
                }
              </div>
            </button>

            {/* Programs */}
            {expanded[fa.id] && (
              <div className="border-t border-gray-100">
                {fa.programs.map((prog, pi) => (
                  <div key={prog.id} className={`${pi > 0 ? 'border-t border-gray-100' : ''}`}>

                    {/* Program row */}
                    <div className="flex items-start gap-3 px-5 py-3 bg-gray-50/60">
                      <div className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{prog.title}</p>
                        {prog.executiveManager && (
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-gray-400">Executive Manager:</span>
                            <span className="text-[10px] font-semibold text-gray-600">{prog.executiveManager}</span>
                            {prog.executiveManagerRole && <RoleBadge role={prog.executiveManagerRole} />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activities */}
                    {prog.activities.length > 0 && (
                      <div className="px-5 py-2 space-y-1">
                        {prog.activities.map((act, ai) => (
                          <div key={ai} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                            <Activity className="w-3 h-3 text-gray-300 shrink-0 ml-9" />
                            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                              <span className="text-xs text-gray-700 font-medium">{act.title}</span>
                              {act.manager && (
                                <>
                                  <span className="text-gray-300 text-[10px]">·</span>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-[11px] text-gray-500">{act.manager}</span>
                                    {act.managerRole && <RoleBadge role={act.managerRole} />}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {prog.activities.length === 0 && (
                      <div className="px-5 pb-2">
                        <p className="text-[11px] text-gray-400 italic ml-9">No activities defined</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* People directory */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            People Directory
            <span className="text-[10px] font-semibold text-gray-400 ml-1">· {DICT_PEOPLE.length} staff</span>
          </h2>
        </div>

        {/* Role legend */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/40 flex flex-wrap gap-2">
          {(Object.entries(ROLE_CFG) as [UserRole, typeof ROLE_CFG[UserRole]][]).map(([role, cfg]) => (
            <span key={role} className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded border ${cfg.badge}`}>
              {cfg.label}
            </span>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {DICT_PEOPLE.map(person => (
            <div key={person.name} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                {person.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{person.name}</p>
                <p className="text-[11px] text-gray-400">{person.position} · {person.area}</p>
              </div>
              <RoleBadge role={person.role} />
            </div>
          ))}
        </div>
      </div>

      {/* Role mapping legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">System Role Mapping</h2>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Each staff member&apos;s position maps to a system role that determines their dashboard view,
          access permissions, and approval authority within the M&amp;E platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.entries(ROLE_CFG) as [UserRole, typeof ROLE_CFG[UserRole]][]).map(([role, cfg]) => {
            const people = DICT_PEOPLE.filter(p => p.role === role)
            return (
              <div key={role} className={`rounded-lg border p-3 ${cfg.badge}`}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1">{cfg.label}</p>
                <p className="text-[11px] font-semibold text-gray-700 mb-2">
                  {people.length} {people.length === 1 ? 'person' : 'people'}
                </p>
                <ul className="space-y-0.5">
                  {people.map(p => (
                    <li key={p.name} className="text-[10px] text-gray-600 truncate">{p.name}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
