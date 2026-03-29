'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { BudgetPlan } from '@/types'

const STORAGE_KEY = 'dict_me_budget_plans'

interface BPContextType {
  plans: BudgetPlan[]
  addPlan: (p: BudgetPlan) => void
  updatePlan: (p: BudgetPlan) => void
  deletePlan: (id: string) => void
}

const BPContext = createContext<BPContextType | null>(null)

function save(next: BudgetPlan[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
}

export function BudgetPlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<BudgetPlan[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPlans(JSON.parse(raw))
    } catch {}
  }, [])

  function addPlan(p: BudgetPlan) {
    setPlans(prev => { const next = [p, ...prev]; save(next); return next })
  }

  function updatePlan(p: BudgetPlan) {
    setPlans(prev => { const next = prev.map(x => x.id === p.id ? p : x); save(next); return next })
  }

  function deletePlan(id: string) {
    setPlans(prev => { const next = prev.filter(x => x.id !== id); save(next); return next })
  }

  return (
    <BPContext.Provider value={{ plans, addPlan, updatePlan, deletePlan }}>
      {children}
    </BPContext.Provider>
  )
}

export function useBudgetPlan() {
  const ctx = useContext(BPContext)
  if (!ctx) throw new Error('useBudgetPlan must be used within BudgetPlanProvider')
  return ctx
}
