// Shared corporate plan data — imported by both corporate-plan/page.tsx and workplan/page.tsx

export interface CorporateKPI {
  name: string
  baseline: string
  target: string
  current: string
}

export interface StrategicObjective {
  id: string
  title: string
  description: string
  initiatives: string[]
  kpis: CorporateKPI[]
}

export interface StrategicPriority {
  id: string
  priority: string
  title: string
  shortTitle: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  objectives: StrategicObjective[]
}

export const PRIORITIES: StrategicPriority[] = [
  {
    id: 'sp1',
    priority: 'SP 1',
    title: 'Digital Government Delivery',
    shortTitle: 'Digital Govt',
    description: 'Transform government service delivery through digital technologies to improve citizen access, efficiency, and transparency.',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    objectives: [
      {
        id: 'sp1o1',
        title: 'Deploy citizen-facing digital services',
        description: 'Migrate key government services online via the GovCloud platform.',
        initiatives: [
          'Launch National ID digital portal',
          'Deploy e-Government Service Gateway',
          'Integrate 5 agencies onto GovCloud',
          'Roll out SMS/USSD service notifications',
        ],
        kpis: [
          { name: 'Digital services deployed',       baseline: '3',   target: '20',    current: '11'   },
          { name: 'Agencies on GovCloud',             baseline: '2',   target: '10',    current: '6'    },
          { name: 'Online transactions (monthly)',    baseline: '500', target: '5,000', current: '2,340' },
        ],
      },
      {
        id: 'sp1o2',
        title: 'Expand government cloud infrastructure',
        description: 'Build and expand the Government Cloud to support all major agencies.',
        initiatives: [
          'Upgrade GovCloud data centre capacity',
          'Implement disaster recovery site',
          'Deploy cloud monitoring tools',
        ],
        kpis: [
          { name: 'GovCloud uptime (%)',    baseline: '95', target: '99.9', current: '98.7' },
          { name: 'Storage capacity (TB)',   baseline: '50', target: '500',  current: '180'  },
        ],
      },
    ],
  },
  {
    id: 'sp2',
    priority: 'SP 2',
    title: 'ICT Infrastructure & Connectivity',
    shortTitle: 'Infrastructure',
    description: 'Build reliable, secure, and scalable ICT infrastructure to connect government agencies and underserved communities across PNG.',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    objectives: [
      {
        id: 'sp2o1',
        title: 'Expand government network connectivity',
        description: 'Connect all provincial and district government offices to the national government network.',
        initiatives: [
          'Extend GWAN to 15 provincial capitals',
          'Deploy satellite connectivity for remote offices',
          'Upgrade bandwidth on inter-agency links',
          'Establish network operations centre (NOC)',
        ],
        kpis: [
          { name: 'Provincial offices connected (%)', baseline: '40', target: '100', current: '67' },
          { name: 'Average bandwidth (Mbps)',          baseline: '10', target: '100', current: '45' },
          { name: 'Network availability (%)',          baseline: '90', target: '99',  current: '95' },
        ],
      },
    ],
  },
  {
    id: 'sp3',
    priority: 'SP 3',
    title: 'Cyber Security & Data Governance',
    shortTitle: 'Cyber Security',
    description: 'Protect government information assets, data, and ICT systems against cyber threats and ensure responsible data governance.',
    color: '#CE1126',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    objectives: [
      {
        id: 'sp3o1',
        title: 'Strengthen government cybersecurity posture',
        description: 'Implement whole-of-government cyber security standards and incident response capability.',
        initiatives: [
          'Establish Government CERT (Computer Emergency Response Team)',
          'Deploy government-wide SIEM solution',
          'Conduct annual cyber security audits',
          'Deliver cyber awareness training to 500 public servants',
        ],
        kpis: [
          { name: 'Critical incidents (year)',  baseline: '12', target: '0',   current: '2'   },
          { name: 'Agencies audited',           baseline: '3',  target: '15',  current: '8'   },
          { name: 'Staff trained (cyber)',       baseline: '50', target: '500', current: '210' },
        ],
      },
      {
        id: 'sp3o2',
        title: 'Implement national data governance framework',
        description: 'Develop policies and systems for responsible government data management and sharing.',
        initiatives: [
          'Draft National Data Governance Policy',
          'Establish data classification standards',
          'Deploy data catalogue for government datasets',
        ],
        kpis: [
          { name: 'Data policies enacted', baseline: '1', target: '5',  current: '3'  },
          { name: 'Datasets catalogued',   baseline: '0', target: '50', current: '18' },
        ],
      },
    ],
  },
  {
    id: 'sp4',
    priority: 'SP 4',
    title: 'Policy, Legislation & ICT Standards',
    shortTitle: 'Policy & Standards',
    description: 'Develop a comprehensive ICT policy and legislative framework that governs digital transformation across the Government of PNG.',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    objectives: [
      {
        id: 'sp4o1',
        title: 'Develop and enact ICT legislation',
        description: 'Modernise the ICT Act and supporting regulations to enable digital government.',
        initiatives: [
          'Review and update the ICT Act',
          'Draft Electronic Transactions Regulation',
          'Develop Open Data Policy',
          'Publish ICT Standards Framework',
        ],
        kpis: [
          { name: 'ICT policies enacted',         baseline: '2', target: '8',  current: '5' },
          { name: 'ICT standards published',       baseline: '1', target: '10', current: '4' },
          { name: 'Regulatory reviews completed',  baseline: '0', target: '3',  current: '1' },
        ],
      },
    ],
  },
  {
    id: 'sp5',
    priority: 'SP 5',
    title: 'Institutional Capacity & Human Capital',
    shortTitle: 'Capacity',
    description: "Build DICT's organisational capacity and develop ICT skills across the public service to sustain digital transformation.",
    color: '#D97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    objectives: [
      {
        id: 'sp5o1',
        title: 'Strengthen DICT organisational capability',
        description: "Recruit, train, and retain qualified ICT professionals to deliver DICT's mandate.",
        initiatives: [
          'Fill all vacant ICT positions',
          'Implement HR succession planning',
          'Partner with UPNG and DWU for ICT graduates',
          'Roll out staff performance management system',
        ],
        kpis: [
          { name: 'Positions filled (%)',    baseline: '60', target: '100', current: '78' },
          { name: 'Staff trained (annual)',   baseline: '20', target: '100', current: '55' },
          { name: 'Staff retention rate (%)', baseline: '70', target: '90',  current: '82' },
        ],
      },
    ],
  },
]

export const PLAN_META = {
  title: 'DICT Corporate Plan 2023–2027',
  period: '2023 – 2027',
  vision: 'A digitally connected Papua New Guinea where every citizen benefits from reliable, secure, and inclusive ICT services.',
  mission: 'To lead, coordinate and support the digitisation of Government services and ICT development for the people of Papua New Guinea.',
  preparedBy: 'Department of Information Communication & Technology',
  endorsedBy: 'National Executive Council',
  lastReviewed: 'January 2026',
}
