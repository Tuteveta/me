'use client'

import { useState } from 'react'
import { FUNCTIONAL_AREAS } from '@/lib/org-data'
import { Building2, ChevronDown, ChevronRight, Users, Briefcase, Activity } from 'lucide-react'

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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-400">Executive Manager:</span>
                            <span className="text-[10px] font-semibold text-gray-600">{prog.executiveManager}</span>
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
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-[11px] text-gray-500">{act.manager}</span>
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
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: 'Steven Maitainaho', role: 'Secretary', area: 'Executive Services', badge: 'bg-amber-50 text-amber-700' },
            { name: 'Flierl Shongol',    role: 'Deputy Secretary', area: 'Policy and Emerging Technology', badge: 'bg-blue-50 text-blue-700' },
            { name: 'Jessy Sekere',      role: 'Deputy Secretary', area: 'Digital Government Delivery', badge: 'bg-purple-50 text-purple-700' },
            { name: 'Maisen Windu',      role: 'Director', area: 'Corporate Services', badge: 'bg-emerald-50 text-emerald-700' },
            { name: 'David Kapi',        role: 'Executive Manager', area: 'Policy and M&E', badge: 'bg-indigo-50 text-indigo-700' },
            { name: 'Hera John',         role: 'Executive Manager', area: 'Partnership and Sector Funding', badge: 'bg-indigo-50 text-indigo-700' },
            { name: 'Lizarhmarie Warike',role: 'Executive Manager / Cloud Manager', area: 'Government Cloud and Information Delivery', badge: 'bg-indigo-50 text-indigo-700' },
            { name: 'Joshua Pomalo',     role: 'Executive Manager', area: 'DevOps', badge: 'bg-indigo-50 text-indigo-700' },
            { name: 'Hamilton Vagi',     role: 'Executive Manager', area: 'Cyber Security', badge: 'bg-indigo-50 text-indigo-700' },
            { name: 'Thomson',           role: 'Policy Manager', area: 'Policy and M&E', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Nathan Randa',      role: 'M&E Manager', area: 'Policy and M&E', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Narson',            role: 'Partnership Manager', area: 'Partnership and Sector Funding', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Henry Konaka',      role: 'Sector Funding Manager', area: 'Partnership and Sector Funding', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Jesse Biribudo',    role: 'DevOps Manager', area: 'DevOps', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Bernard Sike',      role: 'Standards Manager', area: 'Government Cloud and Information Delivery', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Nancy Kanasa',      role: 'Data Governance Manager', area: 'Government Cloud and Information Delivery', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Billy Seri',        role: 'HR Manager', area: 'Corporate Services', badge: 'bg-gray-100 text-gray-600' },
            { name: 'William Kimia',     role: 'Finance & Administration Manager', area: 'Corporate Services', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Bartch Morris',     role: 'IT Manager', area: 'Corporate Services', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Marian Rema',       role: 'GESI Manager', area: 'Executive Services', badge: 'bg-gray-100 text-gray-600' },
            { name: 'Valu Rova',         role: 'Internal Auditor', area: 'Executive Services', badge: 'bg-gray-100 text-gray-600' },
          ].map(person => (
            <div key={person.name} className="flex items-center gap-3 px-5 py-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                {person.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{person.name}</p>
                <p className="text-[11px] text-gray-400">{person.area}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${person.badge}`}>
                {person.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
