export type UserRole = 'super' | 'admin' | 'finance' | 'executive' | 'deputy' | 'dcs'

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'delayed' | 'planned'
export type KPIStatus = 'on-track' | 'at-risk' | 'off-track' | 'exceeded'
export type ReportStatus = 'submitted' | 'pending' | 'overdue' | 'approved'
export type ProgramArea =
  | 'Policy & M/E'
  | 'Partnership & Sector Funding'
  | 'Government Cloud & Information Delivery'
  | 'DevOps'
  | 'Cyber Security'
  | 'Corporate Services'
  | 'Executive Services'

// ── Projects ──────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  program: ProgramArea
  status: ProjectStatus
  completion: number        // 0-100
  budget: number            // PGK
  spent: number             // PGK
  startDate: string
  endDate: string
  lead: string
  beneficiaries: number
  description: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  dueDate: string
  completed: boolean
}

// ── KPIs ──────────────────────────────────────────────────
export interface KPI {
  id: string
  name: string
  program: ProgramArea
  unit: string
  target: number
  actual: number
  baseline: number
  status: KPIStatus
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  history: KPIDataPoint[]
}

export interface KPIDataPoint {
  month: string
  value: number
  target: number
}

// ── Reports ───────────────────────────────────────────────
export interface Report {
  id: string
  title: string
  program: ProgramArea
  type: 'quarterly' | 'monthly' | 'annual' | 'ad-hoc'
  period: string
  status: ReportStatus
  submittedBy: string
  submittedAt?: string
  dueDate: string
  fileUrl?: string
}

// ── Dashboard summary ─────────────────────────────────────
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  delayedProjects: number
  kpisOnTrack: number
  kpisAtRisk: number
  kpisOffTrack: number
  totalBudget: number
  totalSpent: number
  reportsThisQuarter: number
  reportsOverdue: number
  beneficiariesReached: number
}

// ── Trend series for charts ────────────────────────────────
export interface TrendPoint {
  month: string
  value: number
}

export interface BudgetPoint {
  program: ProgramArea
  budget: number
  spent: number
}

// ── Annual Workplan ───────────────────────────────────────
export type WorkplanStatus = 'draft' | 'submitted' | 'approved' | 'active'

export interface WorkplanKPI {
  id: string
  name: string
  unit: string
  baseline: string
  q1Target: string
  q2Target: string
  q3Target: string
  q4Target: string
  annualTarget: string
  responsible: string
  method: string
}

export interface KRA {
  id: string
  title: string
  description: string
  weight: number        // percentage, all KRAs should sum to 100
  kpis: WorkplanKPI[]
}

export interface AnnualWorkplan {
  id: string
  title: string
  fiscalYear: string
  period: string          // e.g. "Jan 2025 – Dec 2025"
  division: string
  objective: string       // overall workplan objective
  budget: number          // total allocated budget in PGK
  createdBy: string
  approvedBy?: string
  status: WorkplanStatus
  createdAt: string
  kras: KRA[]
}

// ── Funding Requests (approval workflow) ──────────────────
export type RequestStage =
  | 'pending_em'
  | 'pending_deputy'
  | 'pending_dcs'
  | 'pending_finance'
  | 'pending_acquittal'
  | 'pending_acquittal_review'  // NEW: Finance reviewing submitted acquittal
  | 'closed'
  | 'rejected'
  | 'deferred'                  // NEW: Request on hold by an approver

export interface ApprovalEntry {
  decision: 'approved' | 'rejected' | 'pending' | 'deferred'
  by?: string
  at?: string
  comment?: string
}

export interface RequestAttachment {
  name: string
  size: number   // bytes
  type: string   // MIME type
  url: string    // blob URL (session only) — replaced with real URL on backend integration
}

export interface AcquittalReport {
  submittedAt: string
  notes: string
  attachments: RequestAttachment[]
}

export interface FundingRequest {
  id: string
  programme: string
  description: string
  amount: number
  fiscalYear: string
  submittedBy: string
  submittedAt: string
  stage: RequestStage
  attachments: RequestAttachment[]
  em: ApprovalEntry
  deputy: ApprovalEntry
  dcs: ApprovalEntry           // Director Corporate Services
  finance: ApprovalEntry
  budgetLine?: string          // work plan KRA the Finance charged this to
  acquittal?: AcquittalReport
  deferredFromStage?: string    // NEW: the stage it was at when deferred
}

// ── Users (Super-managed) ─────────────────────────────────
export interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  division: string
  status: 'active' | 'inactive'
  lastLogin?: string
  createdAt: string
}
