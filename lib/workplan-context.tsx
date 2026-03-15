'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AnnualWorkplan } from '@/types'

// Workplans are authored per-division and stored in localStorage so they persist
// across sessions on the same device. The key data (funding requests) flows
// through AppSync; workplans act as the source-of-truth for what can be funded.

const STORAGE_KEY = 'dict_me_workplans'

interface WorkplanContextType {
  workplans: AnnualWorkplan[]
  addWorkplan: (wp: AnnualWorkplan) => void
  updateWorkplan: (wp: AnnualWorkplan) => void
  deleteWorkplan: (id: string) => void
}

const WorkplanContext = createContext<WorkplanContextType | null>(null)

export function WorkplanProvider({ children }: { children: ReactNode }) {
  const [workplans, setWorkplans] = useState<AnnualWorkplan[]>([])

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setWorkplans(JSON.parse(raw))
    } catch {}
  }, [])

  function persist(next: AnnualWorkplan[]) {
    setWorkplans(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const addWorkplan    = (wp: AnnualWorkplan)  => persist([wp, ...workplans])
  const updateWorkplan = (wp: AnnualWorkplan)  => persist(workplans.map(w => w.id === wp.id ? wp : w))
  const deleteWorkplan = (id: string)          => persist(workplans.filter(w => w.id !== id))

  return (
    <WorkplanContext.Provider value={{ workplans, addWorkplan, updateWorkplan, deleteWorkplan }}>
      {children}
    </WorkplanContext.Provider>
  )
}

export function useWorkplan() {
  const ctx = useContext(WorkplanContext)
  if (!ctx) throw new Error('useWorkplan must be used within WorkplanProvider')
  return ctx
}
