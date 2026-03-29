export type UserRole = 'super' | 'admin' | 'finance' | 'executive' | 'deputy' | 'dcs' | 'officer'

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
  // Corporate Plan alignment
  strategicPriorityId?: string    // e.g. "sp1"
  strategicPriorityTitle?: string // e.g. "Digital Government Delivery"
}

// ── Request Types ──────────────────────────────────────────
export type RequestType =
  | 'funding'        // Full chain: EM → Deputy → DCS → Finance → Acquittal
  | 'procurement'    // Full chain: EM → Deputy → DCS → Finance → Acquittal
  | 'leave_travel'   // Direct: EM only, no funding
  | 'training'       // Chain: EM → Deputy, no funding
  | 'it_support'     // Direct: EM only, no funding
  | 'policy'         // Chain: EM → DCS, no funding

export interface RequestTypeCfg {
  label: string
  description: string
  requiresFunding: boolean
  steps: Array<'em' | 'deputy' | 'dcs' | 'finance'>
}

export const REQUEST_TYPE_CFG: Record<RequestType, RequestTypeCfg> = {
  funding: {
    label: 'Funding Request',
    description: 'Programme or activity funding requiring full financial approval chain',
    requiresFunding: true,
    steps: ['em', 'deputy', 'dcs', 'finance'],
  },
  procurement: {
    label: 'Procurement Request',
    description: 'Goods or services procurement requiring full approval chain',
    requiresFunding: true,
    steps: ['em', 'deputy', 'dcs', 'finance'],
  },
  leave_travel: {
    label: 'Leave / Travel Request',
    description: 'Staff leave or official travel — approved directly by Executive Manager',
    requiresFunding: false,
    steps: ['em'],
  },
  training: {
    label: 'Training Request',
    description: 'Capacity building, courses, or workshops — reviewed by EM and Deputy Secretary',
    requiresFunding: false,
    steps: ['em', 'deputy'],
  },
  it_support: {
    label: 'IT Support Request',
    description: 'Technical support, equipment, or system access — direct EM approval',
    requiresFunding: false,
    steps: ['em'],
  },
  policy: {
    label: 'Policy / Compliance Request',
    description: 'Policy review, compliance, or regulatory matter — EM then Director Corp. Services',
    requiresFunding: false,
    steps: ['em', 'dcs'],
  },
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
  requestType: RequestType       // defaults to 'funding' for backward compatibility
  programme: string              // KRA title (funding/procurement) or free-text subject (other types)
  description: string
  amount: number
  fiscalYear: string
  submittedBy: string
  submittedAt: string
  division?: string              // submitter's division
  // Source linkage — populated for funding/procurement types
  workplanId?: string
  workplanTitle?: string
  kraId?: string
  kraTitle?: string
  stage: RequestStage
  attachments: RequestAttachment[]
  em: ApprovalEntry
  deputy: ApprovalEntry
  dcs: ApprovalEntry
  finance: ApprovalEntry
  budgetLine?: string            // budget line assigned by Finance on approval
  acquittal?: AcquittalReport
  deferredFromStage?: string
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

// ── Officers — staff created by managers ───────────────────
export interface Officer {
  id: string
  name: string
  email: string
  position: string        // job title / designation
  division: string
  program?: string        // program they work under
  createdBy: string       // name of the manager who created them
  createdByRole: UserRole
  status: 'active' | 'inactive'
  createdAt: string
}

// ── Tasks — assigned by managers to officers ───────────────
export type TaskStatus   = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string        // officer id
  assignedToName: string    // officer name (denormalised)
  assignedBy: string        // manager name
  assignedByRole: UserRole
  division: string
  program?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  createdAt: string
  completedAt?: string
  progress: number          // 0–100
  notes?: string            // officer's latest update note
}

// ── Quarterly Reports ─────────────────────────────────────
export type QRStatus = 'draft' | 'submitted' | 'reviewed'
export type QuarterLabel = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type QREntryStatus = 'Completed' | 'Ongoing' | 'Not Started' | 'Deferred'

export interface QREntry {
  id: string
  quarter: QuarterLabel
  kra: string
  plannedActivity: string
  kpi: string
  approvedBudget: string
  expenditure: string
  status: QREntryStatus
  justification: string
  officersInCharge: string
}

export interface QuarterlyReport {
  id: string
  title: string
  fiscalYear: string
  wing: string
  division: string
  branch: string
  createdBy: string
  createdAt: string
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComment?: string
  status: QRStatus
  workplanId?: string
  workplanTitle?: string
  entries: QREntry[]
}
