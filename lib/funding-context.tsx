'use client'

import '@/lib/amplify'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import type { FundingRequest, RequestStage, RequestType, ApprovalEntry, AcquittalReport, RequestAttachment } from '@/types'
import { REQUEST_TYPE_CFG } from '@/types'

export type { RequestAttachment }

const client = generateClient<Schema>()

interface FundingContextType {
  requests: FundingRequest[]
  isLoading: boolean
  reload: () => Promise<void>
  submit: (data: Pick<FundingRequest, 'programme' | 'description' | 'amount' | 'fiscalYear' | 'submittedBy' | 'attachments' | 'requestType' | 'division' | 'workplanId' | 'workplanTitle' | 'kraId' | 'kraTitle'>) => Promise<void>
  decide: (id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected', by: string, comment?: string, budgetLine?: string, requestType?: RequestType) => Promise<void>
  submitAcquittal: (id: string, report: AcquittalReport) => Promise<void>
  defer: (id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', by: string, reason: string, deferredFromStage: RequestStage) => Promise<void>
  resumeDeferred: (id: string) => Promise<void>
  closeRequest: (id: string, _by: string, _comment?: string) => Promise<void>
}

const FundingContext = createContext<FundingContextType | null>(null)

function nextStage(
  current: 'em' | 'deputy' | 'dcs' | 'finance',
  decision: 'approved' | 'rejected',
  requestType: RequestType,
): RequestStage {
  if (decision === 'rejected') return 'rejected'
  const { steps, requiresFunding } = REQUEST_TYPE_CFG[requestType]
  const idx = steps.indexOf(current)
  if (idx < steps.length - 1) {
    // More steps remain
    return `pending_${steps[idx + 1]}` as RequestStage
  }
  // Last approver in chain
  return requiresFunding ? 'pending_acquittal' : 'closed'
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
    id:             item.id as string,
    programme:      item.programme as string,
    description:    item.description as string,
    amount:         item.amount as number,
    fiscalYear:     item.fiscalYear as string,
    submittedBy:    item.submittedBy as string,
    submittedAt:    item.submittedAt as string,
    stage:          item.stage as RequestStage,
    requestType:    (item.requestType as RequestType) ?? 'funding',
    budgetLine:     item.budgetLine as string | undefined,
    division:       item.division as string | undefined,
    workplanId:     item.workplanId as string | undefined,
    workplanTitle:  item.workplanTitle as string | undefined,
    kraId:          item.kraId as string | undefined,
    kraTitle:       item.kraTitle as string | undefined,
    attachments:    parseArr<RequestAttachment>(item.attachments),
    em:             parse(item.emDecision),
    deputy:         parse(item.deputyDecision),
    dcs:            parse(item.dcsDecision),
    finance:        parse(item.financeDecision),
    acquittal: item.acquittalSubmittedAt ? {
      submittedAt:  item.acquittalSubmittedAt as string,
      notes:        (item.acquittalNotes as string) ?? '',
      attachments:  parseArr<RequestAttachment>(item.acquittalAttachments),
    } : undefined,
    deferredFromStage: item.deferredFromStage as string | undefined,
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

  async function submit(data: Pick<FundingRequest, 'programme' | 'description' | 'amount' | 'fiscalYear' | 'submittedBy' | 'attachments' | 'requestType' | 'division' | 'workplanId' | 'workplanTitle' | 'kraId' | 'kraTitle'>) {
    const { errors } = await (client.models as any).FundingRequest.create({
      programme:       data.programme,
      description:     data.description,
      amount:          data.amount,
      fiscalYear:      data.fiscalYear,
      submittedBy:     data.submittedBy,
      submittedAt:     new Date().toISOString().slice(0, 10),
      requestType:     data.requestType,
      division:        data.division,
      workplanId:      data.workplanId,
      workplanTitle:   data.workplanTitle,
      kraId:           data.kraId,
      kraTitle:        data.kraTitle,
      stage:           'pending_em',
      emDecision:      JSON.stringify(pending),
      deputyDecision:  JSON.stringify(pending),
      dcsDecision:     JSON.stringify(pending),
      financeDecision: JSON.stringify(pending),
      attachments:     JSON.stringify(data.attachments),
    })
    if (errors?.length) throw new Error(errors[0].message)
    await load()
  }

  async function decide(id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', decision: 'approved' | 'rejected', by: string, comment?: string, budgetLine?: string, requestType: RequestType = 'funding') {
    const entry: ApprovalEntry = { decision, by, at: new Date().toISOString().slice(0, 10), comment }
    const fieldMap = { em: 'emDecision', deputy: 'deputyDecision', dcs: 'dcsDecision', finance: 'financeDecision' }
    const { errors } = await (client.models as any).FundingRequest.update({
      id,
      [fieldMap[stage]]: JSON.stringify(entry),
      stage: nextStage(stage, decision, requestType),
      ...(stage === 'finance' && budgetLine ? { budgetLine } : {}),
    })
    if (errors?.length) throw new Error(errors[0].message)
    await load()
  }

  async function submitAcquittal(id: string, report: AcquittalReport) {
    await (client.models as any).FundingRequest.update({
      id,
      stage:               'pending_acquittal_review' as RequestStage,
      acquittalNotes:      report.notes,
      acquittalSubmittedAt: report.submittedAt,
      acquittalAttachments: JSON.stringify(report.attachments),
    })
    await load()
  }

  async function defer(id: string, stage: 'em' | 'deputy' | 'dcs' | 'finance', by: string, reason: string, deferredFromStage: RequestStage) {
    const entry: ApprovalEntry = { decision: 'deferred', by, at: new Date().toISOString().slice(0, 10), comment: reason }
    const fieldMap = { em: 'emDecision', deputy: 'deputyDecision', dcs: 'dcsDecision', finance: 'financeDecision' }
    const { errors } = await (client.models as any).FundingRequest.update({
      id,
      [fieldMap[stage]]: JSON.stringify(entry),
      stage: 'deferred' as RequestStage,
      deferredFromStage: deferredFromStage as string,
    })
    if (errors?.length) throw new Error(errors[0].message)
    await load()
  }

  async function resumeDeferred(id: string) {
    // fetch current item to get deferredFromStage
    const { data: item } = await (client.models as any).FundingRequest.get({ id })
    if (!item) throw new Error('Request not found')
    const restoreStage = (item.deferredFromStage as RequestStage) ?? 'pending_em'
    // find which approver's decision is 'deferred' and reset it to pending
    const pendingEntry: ApprovalEntry = { decision: 'pending' }
    const updates: Record<string, unknown> = {
      id,
      stage: restoreStage,
      deferredFromStage: null,
    }
    const fieldPairs: Array<[string, string]> = [
      ['emDecision', 'em'],
      ['deputyDecision', 'deputy'],
      ['dcsDecision', 'dcs'],
      ['financeDecision', 'finance'],
    ]
    for (const [field] of fieldPairs) {
      try {
        const entry = JSON.parse(item[field] ?? '{}') as ApprovalEntry
        if (entry.decision === 'deferred') updates[field] = JSON.stringify(pendingEntry)
      } catch { /* ignore */ }
    }
    const { errors } = await (client.models as any).FundingRequest.update(updates)
    if (errors?.length) throw new Error(errors[0].message)
    await load()
  }

  async function closeRequest(id: string, _by: string, _comment?: string) {
    // keep financeDecision as-is (already approved earlier), just close the stage
    const { errors } = await (client.models as any).FundingRequest.update({
      id,
      stage: 'closed' as RequestStage,
    })
    if (errors?.length) throw new Error(errors[0].message)
    await load()
  }

  return (
    <FundingContext.Provider value={{ requests, isLoading, reload: load, submit, decide, submitAcquittal, defer, resumeDeferred, closeRequest }}>
      {children}
    </FundingContext.Provider>
  )
}

export function useFunding() {
  const ctx = useContext(FundingContext)
  if (!ctx) throw new Error('useFunding must be used within FundingProvider')
  return ctx
}
