import type {
  Project, KPI, Report, DashboardStats,
  TrendPoint, BudgetPoint, ManagedUser, AnnualWorkplan
} from '@/types'

export const PROJECTS: Project[] = []

export const KPIS: KPI[] = []

export const REPORTS: Report[] = []

export function getDashboardStats(): DashboardStats {
  return {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    delayedProjects: 0,
    kpisOnTrack: 0,
    kpisAtRisk: 0,
    kpisOffTrack: 0,
    totalBudget: 0,
    totalSpent: 0,
    reportsThisQuarter: 0,
    reportsOverdue: 0,
    beneficiariesReached: 0,
  }
}

export const KPI_TREND: TrendPoint[] = []

export const BUDGET_BY_PROGRAM: BudgetPoint[] = []

export const PROJECT_STATUS_PIE: { label: string; value: number; color: string }[] = []

export const WORKPLANS: AnnualWorkplan[] = []

export const MANAGED_USERS: ManagedUser[] = []
