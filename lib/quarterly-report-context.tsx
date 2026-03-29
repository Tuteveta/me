'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { QuarterlyReport } from '@/types'

const STORAGE_KEY = 'dict_me_quarterly_reports'

interface QRContextType {
  reports: QuarterlyReport[]
  addReport: (r: QuarterlyReport) => void
  updateReport: (r: QuarterlyReport) => void
  deleteReport: (id: string) => void
}

const QRContext = createContext<QRContextType | null>(null)

function save(next: QuarterlyReport[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
}

export function QuarterlyReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<QuarterlyReport[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setReports(JSON.parse(raw))
    } catch {}
  }, [])

  function addReport(r: QuarterlyReport) {
    setReports(prev => { const next = [r, ...prev]; save(next); return next })
  }

  function updateReport(r: QuarterlyReport) {
    setReports(prev => { const next = prev.map(x => x.id === r.id ? r : x); save(next); return next })
  }

  function deleteReport(id: string) {
    setReports(prev => { const next = prev.filter(x => x.id !== id); save(next); return next })
  }

  return (
    <QRContext.Provider value={{ reports, addReport, updateReport, deleteReport }}>
      {children}
    </QRContext.Provider>
  )
}

export function useQuarterlyReport() {
  const ctx = useContext(QRContext)
  if (!ctx) throw new Error('useQuarterlyReport must be used within QuarterlyReportProvider')
  return ctx
}
