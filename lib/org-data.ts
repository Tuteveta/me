// DICT Organisational Structure — authoritative source used across the dashboard

import type { UserRole } from '@/types'

export interface OrgActivity {
  title: string
  manager?: string
  managerRole?: UserRole
}

export interface OrgProgram {
  id: string
  title: string
  executiveManager?: string
  executiveManagerRole?: UserRole
  activities: OrgActivity[]
}

export interface OrgFunctionalArea {
  id: string
  title: string
  shortTitle: string
  headRole: string
  head: string
  headSystemRole: UserRole   // maps the head to a system role
  note?: string
  color: string          // Tailwind bg color class for badges
  textColor: string      // Tailwind text color class
  borderColor: string    // Tailwind border color class
  programs: OrgProgram[]
}

// ── Person record — one entry per named staff member ──────────────────────────
export interface OrgPerson {
  name: string
  position: string        // human-readable job title
  role: UserRole          // system role
  area: string            // functional area title
  division: string        // used as the system division field
}

export const FUNCTIONAL_AREAS: OrgFunctionalArea[] = [
  {
    id: 'policy',
    title: 'Policy and Emerging Technology',
    shortTitle: 'Policy & ET',
    headRole: 'Deputy Secretary',
    head: 'Flierl Shongol',
    headSystemRole: 'deputy',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    programs: [
      {
        id: 'policy_me',
        title: 'Policy and Monitoring & Evaluation',
        executiveManager: 'David Kapi',
        executiveManagerRole: 'executive',
        activities: [
          { title: 'Policy',                  manager: 'Thomson',      managerRole: 'admin' },
          { title: 'Monitoring & Evaluation', manager: 'Nathan Randa', managerRole: 'admin' },
        ],
      },
      {
        id: 'partnership_sector',
        title: 'Partnership and Sector Funding',
        executiveManager: 'Hera John',
        executiveManagerRole: 'executive',
        activities: [
          { title: 'Partnership',    manager: 'Narson',        managerRole: 'admin' },
          { title: 'Sector Funding', manager: 'Henry Konaka',  managerRole: 'admin' },
        ],
      },
    ],
  },
  {
    id: 'digital',
    title: 'Digital Government Delivery',
    shortTitle: 'Digital Govt',
    headRole: 'Deputy Secretary',
    head: 'Jessy Sekere',
    headSystemRole: 'deputy',
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    programs: [
      {
        id: 'cloud_info',
        title: 'Government Cloud and Information Delivery',
        executiveManager: 'Lizarhmarie Warike',
        executiveManagerRole: 'executive',
        activities: [
          { title: 'Cloud',          manager: 'Lizarhmarie Warike', managerRole: 'executive' },
          { title: 'Standards',      manager: 'Bernard Sike',       managerRole: 'admin' },
          { title: 'Data Governance', manager: 'Nancy Kanasa',      managerRole: 'admin' },
        ],
      },
      {
        id: 'devops',
        title: 'DevOps',
        executiveManager: 'Joshua Pomalo',
        executiveManagerRole: 'executive',
        activities: [
          { title: 'DevOps', manager: 'Jesse Biribudo', managerRole: 'admin' },
        ],
      },
      {
        id: 'cybersecurity',
        title: 'Cyber Security',
        executiveManager: 'Hamilton Vagi',
        executiveManagerRole: 'executive',
        activities: [
          { title: 'Cyber Security' },
          { title: 'Social Media' },
        ],
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate Services',
    shortTitle: 'Corporate',
    headRole: 'Director',
    head: 'Maisen Windu',
    headSystemRole: 'dcs',
    note: 'Defined by the IFMS Act, General Orders and Public Servant Management Act',
    color: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    programs: [
      {
        id: 'hr',
        title: 'Human Resources',
        activities: [
          { title: 'HR Management', manager: 'Billy Seri', managerRole: 'admin' },
        ],
      },
      {
        id: 'finance_admin',
        title: 'Finance and Administration',
        activities: [
          { title: 'Finance & Administration', manager: 'William Kimia', managerRole: 'finance' },
        ],
      },
      {
        id: 'it',
        title: 'Information Technology',
        activities: [
          { title: 'IT Support', manager: 'Bartch Morris', managerRole: 'admin' },
        ],
      },
    ],
  },
  {
    id: 'executive',
    title: 'Executive Services',
    shortTitle: 'Executive',
    headRole: 'Secretary',
    head: 'Steven Maitainaho',
    headSystemRole: 'super',
    note: 'Office of the Secretary. Appointment made by the Cabinet.',
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    programs: [
      {
        id: 'office_secretary',
        title: 'Office of the Secretary',
        activities: [
          { title: 'GESI',          manager: 'Marian Rema', managerRole: 'admin' },
          { title: 'Internal Audit', manager: 'Valu Rova',  managerRole: 'admin' },
          { title: 'Public Service ICT Steering Committee' },
        ],
      },
    ],
  },
]

// Flat list of all division names for dropdowns
export const DICT_DIVISIONS: string[] = FUNCTIONAL_AREAS.map(fa => fa.title)

// Flat list of all program names for dropdowns
export const DICT_PROGRAMS: string[] = FUNCTIONAL_AREAS.flatMap(fa =>
  fa.programs.map(p => p.title)
)

// All activity titles for dropdowns
export const DICT_ACTIVITIES: string[] = FUNCTIONAL_AREAS.flatMap(fa =>
  fa.programs.flatMap(p => p.activities.map(a => a.title))
)

// ── All named staff — authoritative people directory with system roles ─────────
// Each person maps directly to a system UserRole used for Cognito / DynamoDB accounts.
export const DICT_PEOPLE: OrgPerson[] = [
  // Executive Services
  { name: 'Steven Maitainaho', position: 'Secretary',                           role: 'super',     area: 'Executive Services',                          division: 'Executive Services' },
  { name: 'Marian Rema',       position: 'GESI Manager',                        role: 'admin',     area: 'Executive Services',                          division: 'Executive Services' },
  { name: 'Valu Rova',         position: 'Internal Auditor',                    role: 'admin',     area: 'Executive Services',                          division: 'Executive Services' },
  // Policy and Emerging Technology
  { name: 'Flierl Shongol',   position: 'Deputy Secretary',                    role: 'deputy',    area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  { name: 'David Kapi',       position: 'Executive Manager — Policy & M&E',    role: 'executive', area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  { name: 'Thomson',          position: 'Policy Manager',                       role: 'admin',     area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  { name: 'Nathan Randa',     position: 'M&E Manager',                          role: 'admin',     area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  { name: 'Hera John',        position: 'Executive Manager — Partnership',      role: 'executive', area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  { name: 'Narson',           position: 'Partnership Manager',                  role: 'admin',     area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  { name: 'Henry Konaka',     position: 'Sector Funding Manager',               role: 'admin',     area: 'Policy and Emerging Technology',              division: 'Policy and Emerging Technology' },
  // Digital Government Delivery
  { name: 'Jessy Sekere',         position: 'Deputy Secretary',                          role: 'deputy',    area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  { name: 'Lizarhmarie Warike',   position: 'Executive Manager / Cloud Manager',         role: 'executive', area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  { name: 'Bernard Sike',         position: 'Standards Manager',                         role: 'admin',     area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  { name: 'Nancy Kanasa',         position: 'Data Governance Manager',                   role: 'admin',     area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  { name: 'Joshua Pomalo',        position: 'Executive Manager — DevOps',                role: 'executive', area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  { name: 'Jesse Biribudo',       position: 'DevOps Manager',                            role: 'admin',     area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  { name: 'Hamilton Vagi',        position: 'Executive Manager — Cyber Security',        role: 'executive', area: 'Digital Government Delivery', division: 'Digital Government Delivery' },
  // Corporate Services
  { name: 'Maisen Windu',   position: 'Director — Corporate Services',           role: 'dcs',     area: 'Corporate Services', division: 'Corporate Services' },
  { name: 'Billy Seri',     position: 'HR Manager',                               role: 'admin',   area: 'Corporate Services', division: 'Corporate Services' },
  { name: 'William Kimia',  position: 'Finance & Administration Manager',         role: 'finance', area: 'Corporate Services', division: 'Corporate Services' },
  { name: 'Bartch Morris',  position: 'IT Manager',                               role: 'admin',   area: 'Corporate Services', division: 'Corporate Services' },
]
