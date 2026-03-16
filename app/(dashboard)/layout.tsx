'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { FundingProvider } from '@/lib/funding-context'
import { WorkplanProvider } from '@/lib/workplan-context'
import { TeamProvider } from '@/lib/team-context'
import { CorporatePlanProvider } from '@/lib/corporate-plan-context'
import DashboardShell from '@/components/layout/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <CorporatePlanProvider>
      <WorkplanProvider>
        <FundingProvider>
          <TeamProvider>
            <DashboardShell>{children}</DashboardShell>
          </TeamProvider>
        </FundingProvider>
      </WorkplanProvider>
    </CorporatePlanProvider>
  )
}
