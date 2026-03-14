'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { FundingRequest, RequestStage, ApprovalEntry, RequestAttachment, AcquittalReport } from '@/types'

export type { RequestAttachment }

const SEED: FundingRequest[] = []

/* ── Context types ─────────────────────────────────────────────────────────── */
interface FundingContextType {
  requests: FundingRequest[]
  submit: (data: Pick<FundingRequest, 'programme' | 'description' | 'amount' | 'fiscalYear' | 'submittedBy' | 'attachments'>) => void
  decide: (id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected', by: string, comment?: string, budgetLine?: string) => void
  submitAcquittal: (id: string, report: AcquittalReport) => void
}

const FundingContext = createContext<FundingContextType | null>(null)

const STORAGE_KEY = 'dict_funding_requests'

function nextStage(current: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected'): RequestStage {
  if (decision === 'rejected') return 'rejected'
  if (current === 'em')      return 'pending_deputy'
  if (current === 'deputy')  return 'pending_dcs'
  if (current === 'dcs')     return 'pending_finance'
  // finance approved → awaiting acquittal report from M&E Manager
  return 'pending_acquittal'
}

export function FundingProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<FundingRequest[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setRequests(stored ? JSON.parse(stored) : SEED)
    } catch {
      setRequests(SEED)
    }
  }, [])

  function save(updated: FundingRequest[]) {
    setRequests(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function submit(data: Pick<FundingRequest, 'programme' | 'description' | 'amount' | 'fiscalYear' | 'submittedBy' | 'attachments'>) {
    const req: FundingRequest = {
      ...data,
      id: `fr-${Date.now()}`,
      submittedAt: new Date().toISOString().slice(0, 10),
      stage: 'pending_em',
      em:      { decision: 'pending' },
      deputy:  { decision: 'pending' },
      dcs:     { decision: 'pending' },
      finance: { decision: 'pending' },
    }
    save([req, ...requests])
  }

  function decide(id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected', by: string, comment?: string, budgetLine?: string) {
    const entry: ApprovalEntry = { decision, by, at: new Date().toISOString().slice(0, 10), comment }
    save(requests.map(r => r.id !== id ? r : {
      ...r,
      [stage]: entry,
      stage: nextStage(stage, decision),
      ...(stage === 'finance' && budgetLine ? { budgetLine } : {}),
    }))
  }

  function submitAcquittal(id: string, report: AcquittalReport) {
    save(requests.map(r => r.id !== id ? r : {
      ...r,
      acquittal: report,
      stage: 'closed' as RequestStage,
    }))
  }

  return (
    <FundingContext.Provider value={{ requests, submit, decide, submitAcquittal }}>
      {children}
    </FundingContext.Provider>
  )
}

export function useFunding() {
  const ctx = useContext(FundingContext)
  if (!ctx) throw new Error('useFunding must be used within FundingProvider')
  return ctx
}
