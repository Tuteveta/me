import type {
  Project, KPI, Report, DashboardStats,
  TrendPoint, BudgetPoint, ManagedUser, AnnualWorkplan
} from '@/types'

// ── Projects ──────────────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  {
    id: 'p1', name: 'National Fibre Backbone Expansion', program: 'Infrastructure',
    status: 'active', completion: 68, budget: 12500000, spent: 8450000,
    startDate: '2024-01-15', endDate: '2026-06-30', lead: 'Tom Rarua',
    beneficiaries: 85000, description: 'Extending fibre optic backbone to 5 additional provinces.',
    milestones: [
      { id: 'm1', title: 'Phase 1 – Lae-Madang link', dueDate: '2024-06-30', completed: true },
      { id: 'm2', title: 'Phase 2 – Highlands link', dueDate: '2025-03-31', completed: true },
      { id: 'm3', title: 'Phase 3 – Momase region', dueDate: '2025-12-31', completed: false },
    ],
  },
  {
    id: 'p2', name: 'eGovernment Portal v3.0', program: 'eGovernment',
    status: 'active', completion: 82, budget: 4200000, spent: 3450000,
    startDate: '2024-03-01', endDate: '2025-09-30', lead: 'Sarah Kuri',
    beneficiaries: 250000, description: 'Unified citizen services portal with mobile-first design.',
    milestones: [
      { id: 'm1', title: 'Design & UX', dueDate: '2024-06-15', completed: true },
      { id: 'm2', title: 'Backend integration', dueDate: '2024-12-31', completed: true },
      { id: 'm3', title: 'UAT & launch', dueDate: '2025-09-30', completed: false },
    ],
  },
  {
    id: 'p3', name: 'Rural Connectivity Program', program: 'Infrastructure',
    status: 'delayed', completion: 34, budget: 8900000, spent: 3020000,
    startDate: '2024-06-01', endDate: '2026-03-31', lead: 'Mark Bika',
    beneficiaries: 120000, description: 'Satellite-based internet for 40 remote communities.',
    milestones: [
      { id: 'm1', title: 'Site surveys', dueDate: '2024-09-30', completed: true },
      { id: 'm2', title: 'Equipment procurement', dueDate: '2025-01-31', completed: false },
    ],
  },
  {
    id: 'p4', name: 'Cybersecurity Framework Implementation', program: 'Cybersecurity',
    status: 'active', completion: 55, budget: 3100000, spent: 1705000,
    startDate: '2024-09-01', endDate: '2025-12-31', lead: 'Lisa Mond',
    beneficiaries: 500, description: 'National cybersecurity policy and CSIRT setup.',
    milestones: [
      { id: 'm1', title: 'Policy drafting', dueDate: '2024-11-30', completed: true },
      { id: 'm2', title: 'CSIRT establishment', dueDate: '2025-06-30', completed: false },
    ],
  },
  {
    id: 'p5', name: 'ICT Workforce Development', program: 'Capacity Building',
    status: 'active', completion: 71, budget: 2400000, spent: 1704000,
    startDate: '2024-02-01', endDate: '2025-12-31', lead: 'Anna Bele',
    beneficiaries: 1200, description: 'Training 1,200 public servants in digital skills.',
    milestones: [
      { id: 'm1', title: 'Curriculum development', dueDate: '2024-05-31', completed: true },
      { id: 'm2', title: 'Cohort 1 (300 trainees)', dueDate: '2024-09-30', completed: true },
      { id: 'm3', title: 'Cohort 2 (500 trainees)', dueDate: '2025-06-30', completed: false },
    ],
  },
  {
    id: 'p6', name: 'Digital Identity System', program: 'Digital Transformation',
    status: 'planned', completion: 8, budget: 6700000, spent: 536000,
    startDate: '2025-01-01', endDate: '2026-12-31', lead: 'Ben Koiri',
    beneficiaries: 9000000, description: 'National digital ID for all citizens.',
    milestones: [
      { id: 'm1', title: 'Feasibility study', dueDate: '2025-04-30', completed: false },
    ],
  },
  {
    id: 'p7', name: 'Government Cloud Migration', program: 'Digital Transformation',
    status: 'active', completion: 49, budget: 5200000, spent: 2548000,
    startDate: '2024-07-01', endDate: '2026-06-30', lead: 'Rachel Nao',
    beneficiaries: 3500, description: 'Migrating 32 government agencies to GovCloud.',
    milestones: [
      { id: 'm1', title: 'Infrastructure setup', dueDate: '2024-12-31', completed: true },
      { id: 'm2', title: 'Agency migration phase 1', dueDate: '2025-06-30', completed: false },
    ],
  },
  {
    id: 'p8', name: 'DICT Staff Skills Audit', program: 'Capacity Building',
    status: 'completed', completion: 100, budget: 380000, spent: 362000,
    startDate: '2024-01-01', endDate: '2024-06-30', lead: 'George Pius',
    beneficiaries: 450, description: 'Baseline skills assessment across all DICT divisions.',
    milestones: [
      { id: 'm1', title: 'Assessment design', dueDate: '2024-02-28', completed: true },
      { id: 'm2', title: 'Field assessment', dueDate: '2024-05-31', completed: true },
      { id: 'm3', title: 'Report publication', dueDate: '2024-06-30', completed: true },
    ],
  },
]

// ── KPIs ──────────────────────────────────────────────────────────────────────
const months12 = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

function makeHistory(base: number, target: number) {
  return months12.map((month, i) => ({
    month,
    value: Math.round(base + (target - base) * (i / 11) * (0.8 + Math.random() * 0.4)),
    target,
  }))
}

export const KPIS: KPI[] = [
  {
    id: 'k1', name: 'Internet penetration rate', program: 'Infrastructure',
    unit: '%', target: 60, actual: 52, baseline: 38, status: 'at-risk',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(38, 60),
  },
  {
    id: 'k2', name: 'eService transactions per month', program: 'eGovernment',
    unit: 'K', target: 200, actual: 218, baseline: 45, status: 'exceeded',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(45, 200),
  },
  {
    id: 'k3', name: 'Digital skills trained (cumulative)', program: 'Capacity Building',
    unit: 'persons', target: 1200, actual: 852, baseline: 0, status: 'on-track',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(0, 1200),
  },
  {
    id: 'k4', name: 'Government agencies on cloud', program: 'Digital Transformation',
    unit: 'agencies', target: 32, actual: 14, baseline: 0, status: 'at-risk',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(0, 32),
  },
  {
    id: 'k5', name: 'Critical ICT incidents resolved < 4h', program: 'Cybersecurity',
    unit: '%', target: 95, actual: 88, baseline: 60, status: 'at-risk',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(60, 95),
  },
  {
    id: 'k6', name: 'Rural communities connected', program: 'Infrastructure',
    unit: 'communities', target: 40, actual: 13, baseline: 0, status: 'off-track',
    trend: 'stable', lastUpdated: '2025-03-01', history: makeHistory(0, 40),
  },
  {
    id: 'k7', name: 'Female digital skill trainees', program: 'Capacity Building',
    unit: '%', target: 45, actual: 47, baseline: 28, status: 'exceeded',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(28, 45),
  },
  {
    id: 'k8', name: 'DICT project delivery on-time', program: 'Digital Transformation',
    unit: '%', target: 80, actual: 72, baseline: 55, status: 'at-risk',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(55, 80),
  },
  {
    id: 'k9', name: 'Cybersecurity policy compliance', program: 'Cybersecurity',
    unit: '%', target: 90, actual: 58, baseline: 20, status: 'off-track',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(20, 90),
  },
  {
    id: 'k10', name: 'Citizens with digital ID enrolled', program: 'eGovernment',
    unit: 'M', target: 1.5, actual: 0.12, baseline: 0, status: 'off-track',
    trend: 'up', lastUpdated: '2025-03-01', history: makeHistory(0, 1.5),
  },
]

// ── Reports ───────────────────────────────────────────────────────────────────
export const REPORTS: Report[] = [
  {
    id: 'r1', title: 'Q3 FY2024/25 Progress Report – Infrastructure',
    program: 'Infrastructure', type: 'quarterly', period: 'Q3 FY2024/25',
    status: 'approved', submittedBy: 'Tom Rarua', dueDate: '2025-02-28',
    submittedAt: '2025-02-25',
  },
  {
    id: 'r2', title: 'Q3 FY2024/25 Progress Report – Digital Transformation',
    program: 'Digital Transformation', type: 'quarterly', period: 'Q3 FY2024/25',
    status: 'submitted', submittedBy: 'Rachel Nao', dueDate: '2025-02-28',
    submittedAt: '2025-02-28',
  },
  {
    id: 'r3', title: 'Q3 FY2024/25 Progress Report – Cybersecurity',
    program: 'Cybersecurity', type: 'quarterly', period: 'Q3 FY2024/25',
    status: 'pending', submittedBy: 'Lisa Mond', dueDate: '2025-03-07',
  },
  {
    id: 'r4', title: 'February 2025 Monthly Report – eGovernment',
    program: 'eGovernment', type: 'monthly', period: 'Feb 2025',
    status: 'approved', submittedBy: 'Sarah Kuri', dueDate: '2025-03-05',
    submittedAt: '2025-03-04',
  },
  {
    id: 'r5', title: 'Capacity Building Q3 Report',
    program: 'Capacity Building', type: 'quarterly', period: 'Q3 FY2024/25',
    status: 'overdue', submittedBy: 'Anna Bele', dueDate: '2025-02-28',
  },
  {
    id: 'r6', title: 'Annual Review FY2023/24 – Full Programme',
    program: 'Infrastructure', type: 'annual', period: 'FY2023/24',
    status: 'approved', submittedBy: 'John Vele', dueDate: '2024-10-31',
    submittedAt: '2024-10-28',
  },
  {
    id: 'r7', title: 'Q2 FY2024/25 – Cybersecurity Incident Report',
    program: 'Cybersecurity', type: 'ad-hoc', period: 'Q2 FY2024/25',
    status: 'approved', submittedBy: 'Lisa Mond', dueDate: '2024-12-15',
    submittedAt: '2024-12-14',
  },
  {
    id: 'r8', title: 'March 2025 Monthly Report – Capacity Building',
    program: 'Capacity Building', type: 'monthly', period: 'Mar 2025',
    status: 'pending', submittedBy: 'Anna Bele', dueDate: '2025-04-05',
  },
]

// ── Dashboard stats ───────────────────────────────────────────────────────────
export function getDashboardStats(): DashboardStats {
  const active = PROJECTS.filter(p => p.status === 'active').length
  const completed = PROJECTS.filter(p => p.status === 'completed').length
  const delayed = PROJECTS.filter(p => p.status === 'delayed').length
  const kpiOnTrack = KPIS.filter(k => k.status === 'on-track' || k.status === 'exceeded').length
  const kpiAtRisk = KPIS.filter(k => k.status === 'at-risk').length
  const kpiOffTrack = KPIS.filter(k => k.status === 'off-track').length
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0)
  const totalSpent = PROJECTS.reduce((s, p) => s + p.spent, 0)
  const submitted = REPORTS.filter(r => r.status === 'submitted' || r.status === 'approved').length
  const overdue = REPORTS.filter(r => r.status === 'overdue').length
  const beneficiaries = PROJECTS.reduce((s, p) => s + p.beneficiaries, 0)

  return {
    totalProjects: PROJECTS.length,
    activeProjects: active,
    completedProjects: completed,
    delayedProjects: delayed,
    kpisOnTrack: kpiOnTrack,
    kpisAtRisk: kpiAtRisk,
    kpisOffTrack: kpiOffTrack,
    totalBudget,
    totalSpent,
    reportsThisQuarter: submitted,
    reportsOverdue: overdue,
    beneficiariesReached: beneficiaries,
  }
}

// ── Trend data for charts ─────────────────────────────────────────────────────
export const KPI_TREND: TrendPoint[] = months12.map((month, i) => ({
  month,
  value: Math.round(42 + i * 3.5 + (Math.random() - 0.5) * 5),
}))

export const BUDGET_BY_PROGRAM: BudgetPoint[] = [
  { program: 'Infrastructure', budget: 21400000, spent: 11470000 },
  { program: 'Digital Transformation', budget: 11900000, spent: 3084000 },
  { program: 'eGovernment', budget: 4200000, spent: 3450000 },
  { program: 'Cybersecurity', budget: 3100000, spent: 1705000 },
  { program: 'Capacity Building', budget: 2780000, spent: 2066000 },
]

export const PROJECT_STATUS_PIE = [
  { label: 'Active', value: 5, color: '#3B82F6' },
  { label: 'Completed', value: 1, color: '#10B981' },
  { label: 'Delayed', value: 1, color: '#EF4444' },
  { label: 'Planned', value: 1, color: '#9CA3AF' },
]

// ── Annual Workplans ──────────────────────────────────────────────────────────
export const WORKPLANS: AnnualWorkplan[] = [
  {
    id: 'wp1',
    title: 'DICT Annual Workplan FY 2024/25',
    fiscalYear: 'FY 2024/25',
    period: 'Jul 2024 – Jun 2025',
    division: 'M&E Division',
    objective: 'Accelerate ICT-led development across Papua New Guinea by improving connectivity, digital services, cybersecurity, and workforce capacity in alignment with the National ICT Policy 2025–2030.',
    budget: 43400000,
    createdBy: 'Mary Kila',
    approvedBy: 'John Vele',
    status: 'active',
    createdAt: '2024-07-01',
    kras: [
      {
        id: 'kra1',
        title: 'ICT Infrastructure & Connectivity',
        description: 'Expand national fibre backbone and rural broadband access to underserved provinces.',
        weight: 30,
        kpis: [
          {
            id: 'k1', name: 'Provinces connected to fibre backbone', unit: 'provinces',
            baseline: '8', q1Target: '10', q2Target: '12', q3Target: '14', q4Target: '16',
            annualTarget: '16', responsible: 'Tom Rarua', method: 'Site inspection reports',
          },
          {
            id: 'k2', name: 'Internet penetration rate', unit: '%',
            baseline: '38', q1Target: '44', q2Target: '48', q3Target: '52', q4Target: '60',
            annualTarget: '60', responsible: 'Tom Rarua', method: 'NICTA survey data',
          },
          {
            id: 'k3', name: 'Rural communities connected', unit: 'communities',
            baseline: '0', q1Target: '8', q2Target: '16', q3Target: '28', q4Target: '40',
            annualTarget: '40', responsible: 'Mark Bika', method: 'Field deployment logs',
          },
        ],
      },
      {
        id: 'kra2',
        title: 'eGovernment & Digital Services',
        description: 'Deliver citizen-centric digital services and increase online government transactions.',
        weight: 25,
        kpis: [
          {
            id: 'k4', name: 'eService transactions per month', unit: 'K transactions',
            baseline: '45', q1Target: '100', q2Target: '140', q3Target: '175', q4Target: '200',
            annualTarget: '200', responsible: 'Sarah Kuri', method: 'Portal analytics dashboard',
          },
          {
            id: 'k5', name: 'Government agencies on cloud', unit: 'agencies',
            baseline: '0', q1Target: '6', q2Target: '12', q3Target: '20', q4Target: '32',
            annualTarget: '32', responsible: 'Rachel Nao', method: 'GovCloud migration tracker',
          },
        ],
      },
      {
        id: 'kra3',
        title: 'Capacity Building & Human Resource Development',
        description: 'Strengthen ICT skills and knowledge across public servants and DICT staff.',
        weight: 20,
        kpis: [
          {
            id: 'k6', name: 'Public servants trained in digital skills', unit: 'persons',
            baseline: '0', q1Target: '200', q2Target: '500', q3Target: '850', q4Target: '1200',
            annualTarget: '1200', responsible: 'Anna Bele', method: 'Training attendance registers',
          },
          {
            id: 'k7', name: 'Female trainees percentage', unit: '%',
            baseline: '28', q1Target: '35', q2Target: '40', q3Target: '43', q4Target: '45',
            annualTarget: '45', responsible: 'Anna Bele', method: 'Disaggregated training data',
          },
        ],
      },
      {
        id: 'kra4',
        title: 'Cybersecurity & ICT Governance',
        description: 'Establish a robust cybersecurity framework and improve GoPNG ICT policy compliance.',
        weight: 15,
        kpis: [
          {
            id: 'k8', name: 'Critical incidents resolved within 4 hours', unit: '%',
            baseline: '60', q1Target: '72', q2Target: '80', q3Target: '88', q4Target: '95',
            annualTarget: '95', responsible: 'Lisa Mond', method: 'CSIRT incident logs',
          },
          {
            id: 'k9', name: 'Agencies compliant with ICT security policy', unit: '%',
            baseline: '20', q1Target: '40', q2Target: '58', q3Target: '75', q4Target: '90',
            annualTarget: '90', responsible: 'Lisa Mond', method: 'Compliance audit reports',
          },
        ],
      },
      {
        id: 'kra5',
        title: 'M&E, Reporting & Institutional Strengthening',
        description: 'Improve programme monitoring, evaluation, and timely reporting across all DICT divisions.',
        weight: 10,
        kpis: [
          {
            id: 'k10', name: 'Quarterly reports submitted on time', unit: '%',
            baseline: '55', q1Target: '70', q2Target: '78', q3Target: '85', q4Target: '95',
            annualTarget: '95', responsible: 'Mary Kila', method: 'M&E tracking register',
          },
          {
            id: 'k11', name: 'Projects delivered on schedule', unit: '%',
            baseline: '55', q1Target: '62', q2Target: '68', q3Target: '74', q4Target: '80',
            annualTarget: '80', responsible: 'Mary Kila', method: 'Project status reviews',
          },
        ],
      },
    ],
  },
  {
    id: 'wp2',
    title: 'DICT Annual Workplan FY 2023/24',
    fiscalYear: 'FY 2023/24',
    period: 'Jul 2023 – Jun 2024',
    division: 'M&E Division',
    objective: 'Strengthen DICT institutional capacity and expand core ICT infrastructure to support government digitalisation objectives under the Medium-Term Development Plan IV.',
    budget: 31000000,
    createdBy: 'John Vele',
    approvedBy: 'John Vele',
    status: 'approved',
    createdAt: '2023-07-01',
    kras: [
      {
        id: 'kra1', title: 'Infrastructure Development', description: 'Expand national connectivity.',
        weight: 40,
        kpis: [
          {
            id: 'k1', name: 'Provinces with broadband access', unit: 'provinces',
            baseline: '5', q1Target: '6', q2Target: '7', q3Target: '8', q4Target: '8',
            annualTarget: '8', responsible: 'Tom Rarua', method: 'NICTA reports',
          },
        ],
      },
      {
        id: 'kra2', title: 'Digital Transformation', description: 'Government digitalisation.',
        weight: 35,
        kpis: [
          {
            id: 'k2', name: 'Online services launched', unit: 'services',
            baseline: '4', q1Target: '6', q2Target: '8', q3Target: '10', q4Target: '12',
            annualTarget: '12', responsible: 'Sarah Kuri', method: 'Portal registry',
          },
        ],
      },
      {
        id: 'kra3', title: 'Capacity Building', description: 'Skills development.',
        weight: 25,
        kpis: [
          {
            id: 'k3', name: 'Staff trained', unit: 'persons',
            baseline: '0', q1Target: '100', q2Target: '250', q3Target: '400', q4Target: '600',
            annualTarget: '600', responsible: 'Anna Bele', method: 'Training registers',
          },
        ],
      },
    ],
  },
]

// ── Managed users (Super-only view) ──────────────────────────────────────────
export const MANAGED_USERS: ManagedUser[] = [
  { id: '1', name: 'John Vele', email: 'super@dict.gov.pg', role: 'super', division: 'ICT Infrastructure', status: 'active', lastLogin: '2025-03-14T08:22:00Z', createdAt: '2023-01-10' },
  { id: '2', name: 'Mary Kila', email: 'admin@dict.gov.pg', role: 'admin', division: 'M&E Division', status: 'active', lastLogin: '2025-03-14T07:45:00Z', createdAt: '2023-03-15' },
  { id: '3', name: 'Peter Namaliu', email: 'officer@dict.gov.pg', role: 'officer', division: 'Digital Services', status: 'active', lastLogin: '2025-03-13T16:30:00Z', createdAt: '2023-06-01' },
  { id: '4', name: 'Grace Temu', email: 'g.temu@dict.gov.pg', role: 'officer', division: 'M&E Division', status: 'active', lastLogin: '2025-03-12T10:00:00Z', createdAt: '2024-01-20' },
  { id: '5', name: 'Daniel Paru', email: 'd.paru@dict.gov.pg', role: 'officer', division: 'Cybersecurity', status: 'inactive', lastLogin: '2025-01-05T09:00:00Z', createdAt: '2023-09-01' },
  { id: '6', name: 'Helen Bua', email: 'h.bua@dict.gov.pg', role: 'admin', division: 'eGovernment', status: 'active', lastLogin: '2025-03-13T14:15:00Z', createdAt: '2024-02-10' },
]
