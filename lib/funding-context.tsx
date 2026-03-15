'use client'

import '@/lib/amplify'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import type { FundingRequest, RequestStage, ApprovalEntry, AcquittalReport, RequestAttachment } from '@/types'

export type { RequestAttachment }

const client = generateClient<Schema>()

interface FundingContextType {
  requests: FundingRequest[]
  isLoading: boolean
  reload: () => Promise<void>
  submit: (data: Pick<FundingRequest, 'programme' | 'description' | 'amount' | 'fiscalYear' | 'submittedBy' | 'attachments'>) => Promise<void>
  decide: (id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected', by: string, comment?: string, budgetLine?: string) => Promise<void>
  submitAcquittal: (id: string, report: AcquittalReport) => Promise<void>
}

const FundingContext = createContext<FundingContextType | null>(null)

function nextStage(current: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected'): RequestStage {
  if (decision === 'rejected') return 'rejected'
  if (current === 'em')      return 'pending_deputy'
  if (current === 'deputy')  return 'pending_dcs'
  if (current === 'dcs')     return 'pending_finance'
  return 'pending_acquittal'
}

const pending: ApprovalEntry = { decision: 'pending' }

// Transform raw DynamoDB item → FundingRequest the frontend expects
function transform(item: Record<string, unknown>): FundingRequest {
  const parse = (s: unknown): ApprovalEntry => {
    try { return JSON.parse(s as string) } catch { return pending }
  }
  const parseArr = <T,>(s: unknown): T[] => {
    try { return JSON.parse(s as string) } catch { return [] }
  }
  return {
    id:          item.id as string,
    programme:   item.programme as string,
    description: item.description as string,
    amount:      item.amount as number,
    fiscalYear:  item.fiscalYear as string,
    submittedBy: item.submittedBy as string,
    submittedAt: item.submittedAt as string,
    stage:       item.stage as RequestStage,
    budgetLine:  item.budgetLine as string | undefined,
    attachments: parseArr<RequestAttachment>(item.attachments),
    em:          parse(item.emDecision),
    deputy:      parse(item.deputyDecision),
    dcs:         parse(item.dcsDecision),
    finance:     parse(item.financeDecision),
    acquittal: item.acquittalSubmittedAt ? {
      submittedAt:  item.acquittalSubmittedAt as string,
      notes:        (item.acquittalNotes as string) ?? '',
      attachments:  parseArr<RequestAttachment>(item.acquittalAttachments),
    } : undefined,
  }
}

export function FundingProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<FundingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)  // true until first load completes

  async function load() {
    setIsLoading(true)
    try {
      const { data: items } = await (client.models as any).FundingRequest.list()
      setRequests((items ?? []).map(transform))
    } catch {
      // AppSync not yet available (schema still deploying) — graceful fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(data: Pick<FundingRequest, 'programme' | 'description' | 'amount' | 'fiscalYear' | 'submittedBy' | 'attachments'>) {
    await (client.models as any).FundingRequest.create({
      programme:      data.programme,
      description:    data.description,
      amount:         data.amount,
      fiscalYear:     data.fiscalYear,
      submittedBy:    data.submittedBy,
      submittedAt:    new Date().toISOString().slice(0, 10),
      stage:          'pending_em',
      emDecision:     JSON.stringify(pending),
      deputyDecision: JSON.stringify(pending),
      dcsDecision:    JSON.stringify(pending),
      financeDecision: JSON.stringify(pending),
      attachments:    JSON.stringify(data.attachments),
    })
    await load()
  }

  async function decide(id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected', by: string, comment?: string, budgetLine?: string) {
    const entry: ApprovalEntry = { decision, by, at: new Date().toISOString().slice(0, 10), comment }
    const fieldMap = { em: 'emDecision', deputy: 'deputyDecision', dcs: 'dcsDecision', finance: 'financeDecision' }
    const { errors } = await (client.models as any).FundingRequest.update({
      id,
      [fieldMap[stage]]: JSON.stringify(entry),
      stage: nextStage(stage, decision),
      ...(stage === 'finance' && budgetLine ? { budgetLine } : {}),
    })
    if (errors?.length) throw new Error(errors[0].message)
    await load()
  }

  async function submitAcquittal(id: string, report: AcquittalReport) {
    await (client.models as any).FundingRequest.update({
      id,
      stage:               'closed' as RequestStage,
      acquittalNotes:      report.notes,
      acquittalSubmittedAt: report.submittedAt,
      acquittalAttachments: JSON.stringify(report.attachments),
    })
    await load()
  }

  return (
    <FundingContext.Provider value={{ requests, isLoading, reload: load, submit, decide, submitAcquittal }}>
      {children}
    </FundingContext.Provider>
  )
}

export function useFunding() {
  const ctx = useContext(FundingContext)
  if (!ctx) throw new Error('useFunding must be used within FundingProvider')
  return ctx
}
