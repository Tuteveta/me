// DICT Organisational Structure — authoritative source used across the dashboard

export interface OrgActivity {
  title: string
  manager?: string
}

export interface OrgProgram {
  id: string
  title: string
  executiveManager?: string
  activities: OrgActivity[]
}

export interface OrgFunctionalArea {
  id: string
  title: string
  shortTitle: string
  headRole: string
  head: string
  note?: string
  color: string          // Tailwind bg color class for badges
  textColor: string      // Tailwind text color class
  borderColor: string    // Tailwind border color class
  programs: OrgProgram[]
}

export const FUNCTIONAL_AREAS: OrgFunctionalArea[] = [
  {
    id: 'policy',
    title: 'Policy and Emerging Technology',
    shortTitle: 'Policy & ET',
    headRole: 'Deputy Secretary',
    head: 'Flierl Shongol',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    programs: [
      {
        id: 'policy_me',
        title: 'Policy and Monitoring & Evaluation',
        executiveManager: 'David Kapi',
        activities: [
          { title: 'Policy', manager: 'Thomson' },
          { title: 'Monitoring & Evaluation', manager: 'Nathan Randa' },
        ],
      },
      {
        id: 'partnership_sector',
        title: 'Partnership and Sector Funding',
        executiveManager: 'Hera John',
        activities: [
          { title: 'Partnership', manager: 'Narson' },
          { title: 'Sector Funding', manager: 'Henry Konaka' },
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
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    programs: [
      {
        id: 'cloud_info',
        title: 'Government Cloud and Information Delivery',
        executiveManager: 'Lizarhmarie Warike',
        activities: [
          { title: 'Cloud',          manager: 'Lizarhmarie Warike' },
          { title: 'Standards',      manager: 'Bernard Sike' },
          { title: 'Data Governance', manager: 'Nancy Kanasa' },
        ],
      },
      {
        id: 'devops',
        title: 'DevOps',
        executiveManager: 'Joshua Pomalo',
        activities: [
          { title: 'DevOps', manager: 'Jesse Biribudo' },
        ],
      },
      {
        id: 'cybersecurity',
        title: 'Cyber Security',
        executiveManager: 'Hamilton Vagi',
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
    note: 'Defined by the IFMS Act, General Orders and Public Servant Management Act',
    color: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    programs: [
      {
        id: 'hr',
        title: 'Human Resources',
        activities: [
          { title: 'HR Management', manager: 'Billy Seri' },
        ],
      },
      {
        id: 'finance_admin',
        title: 'Finance and Administration',
        activities: [
          { title: 'Finance & Administration', manager: 'William Kimia' },
        ],
      },
      {
        id: 'it',
        title: 'Information Technology',
        activities: [
          { title: 'IT Support', manager: 'Bartch Morris' },
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
    note: 'Office of the Secretary. Appointment made by the Cabinet.',
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    programs: [
      {
        id: 'office_secretary',
        title: 'Office of the Secretary',
        activities: [
          { title: 'GESI', manager: 'Marian Rema' },
          { title: 'Internal Audit', manager: 'Valu Rova' },
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
