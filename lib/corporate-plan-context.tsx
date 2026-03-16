'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import {
  PRIORITIES as SEED_PRIORITIES,
  PLAN_META as SEED_META,
  type StrategicPriority,
} from '@/lib/corporate-plan-data'

const client = generateClient<Schema>()

export interface PlanMeta {
  title: string
  period: string
  vision: string
  mission: string
  endorsedBy: string
  lastReviewed: string
}

interface CorporatePlanContextType {
  planMeta: PlanMeta
  priorities: StrategicPriority[]
  isLoading: boolean
  dbId: string | null          // DynamoDB record id — null means no record yet
  savePlan: (meta: PlanMeta, priorities: StrategicPriority[], createdBy: string) => Promise<void>
}

const DEFAULT_META: PlanMeta = {
  title:        SEED_META.title,
  period:       SEED_META.period,
  vision:       SEED_META.vision,
  mission:      SEED_META.mission,
  endorsedBy:   SEED_META.endorsedBy,
  lastReviewed: SEED_META.lastReviewed,
}

const CorporatePlanContext = createContext<CorporatePlanContextType>({
  planMeta:   DEFAULT_META,
  priorities: SEED_PRIORITIES,
  isLoading:  true,
  dbId:       null,
  savePlan:   async () => {},
})

export function CorporatePlanProvider({ children }: { children: React.ReactNode }) {
  const [planMeta,   setPlanMeta]   = useState<PlanMeta>(DEFAULT_META)
  const [priorities, setPriorities] = useState<StrategicPriority[]>(SEED_PRIORITIES)
  const [isLoading,  setIsLoading]  = useState(true)
  const [dbId,       setDbId]       = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { data } = await (client.models as any).CorporatePlan.list()
      if (data && data.length > 0) {
        const rec = data[0]
        setDbId(rec.id)
        setPlanMeta({
          title:        rec.title,
          period:       rec.period,
          vision:       rec.vision,
          mission:      rec.mission,
          endorsedBy:   rec.endorsedBy   ?? '',
          lastReviewed: rec.lastReviewed ?? '',
        })
        try {
          const parsed: StrategicPriority[] = JSON.parse(rec.prioritiesJson)
          setPriorities(parsed)
        } catch {
          // malformed JSON — fall back to seed
        }
      }
      // If no record exists, keep the seed defaults (read-only view still works)
    } catch {
      // Network / auth error — keep seed defaults
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function savePlan(meta: PlanMeta, newPriorities: StrategicPriority[], createdBy: string) {
    const payload = {
      title:          meta.title,
      period:         meta.period,
      vision:         meta.vision,
      mission:        meta.mission,
      endorsedBy:     meta.endorsedBy,
      lastReviewed:   meta.lastReviewed,
      prioritiesJson: JSON.stringify(newPriorities),
      createdBy,
      updatedAt:      new Date().toISOString().slice(0, 10),
    }

    if (dbId) {
      await (client.models as any).CorporatePlan.update({ id: dbId, ...payload })
    } else {
      const { data } = await (client.models as any).CorporatePlan.create(payload)
      if (data?.id) setDbId(data.id)
    }

    setPlanMeta(meta)
    setPriorities(newPriorities)
  }

  return (
    <CorporatePlanContext.Provider value={{ planMeta, priorities, isLoading, dbId, savePlan }}>
      {children}
    </CorporatePlanContext.Provider>
  )
}

export function useCorporatePlan() {
  return useContext(CorporatePlanContext)
}
