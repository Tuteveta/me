'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  HelpCircle, BookOpen, ChevronDown, ChevronRight,
  Wallet, ClipboardCheck, LayoutList, FileText,
  ClipboardList, BadgeCheck, BarChart3,
} from 'lucide-react'

interface GuideSection {
  title: string
  icon: React.ElementType
  steps: string[]
}

const BRANCH_MANAGER_GUIDE: GuideSection[] = [
  {
    title: 'Create & Submit a Budget Plan',
    icon: Wallet,
    steps: [
      'Go to Budget Plan in the sidebar.',
      'Click "New Plan" and select your Wing, Division, and Branch.',
      'Add budget items: choose a category, describe the activity, and enter the Estimated Cost (K).',
      'Save as Draft. As funds are spent, update the "Utilized (K)" field for each item.',
      'When ready, click Submit to send to management for review.',
      'Once submitted, management will add review comments — visible to you under the report.',
    ],
  },
  {
    title: 'Create & Submit a Quarterly Report',
    icon: ClipboardCheck,
    steps: [
      'Go to Quarterly Reports in the sidebar.',
      'Click "New Report", fill in Wing, Division, Branch, Fiscal Year, and select the quarters.',
      'Optionally link an Annual Workplan — the system auto-fills KRAs, activities, and KPI targets.',
      'Click Edit on the report, then fill each row: KRA, Program/Project, Activities, KPIs, Expected Outcomes, Budget, Expenditure, Status, Officers.',
      'Save your edits, then click Submit when the report is complete.',
      'Executive Managers will review and add time-stamped comments.',
    ],
  },
  {
    title: 'Submit a Funding or Leave Request',
    icon: FileText,
    steps: [
      'Go to My Requests in the sidebar.',
      'Click "New Request" and choose the request type: Funding, Procurement, Leave/Travel, Training, IT Support, or Policy.',
      'Complete all required fields and attach supporting documents.',
      'Submit — your Executive Manager receives the request for approval.',
      'Track the approval status through the approval chain in My Requests.',
      'For funded requests: submit an acquittal report after expenditure.',
    ],
  },
  {
    title: 'Create an Annual Workplan',
    icon: ClipboardList,
    steps: [
      'Go to Annual Workplan in the sidebar.',
      'Click "New Workplan" and set the fiscal year, division, and budget.',
      'Optionally link to a Corporate Strategic Priority — KRAs auto-fill from the priority objectives.',
      'Add KRAs manually or edit the auto-filled ones. For each KRA, add KPIs with quarterly targets.',
      'Submit the workplan for approval. Once approved, it becomes available for Quarterly Report linking.',
    ],
  },
]

const EXECUTIVE_GUIDE: GuideSection[] = [
  {
    title: 'Review Quarterly Reports',
    icon: ClipboardCheck,
    steps: [
      'Go to Quarterly Reports in the sidebar. A blue banner shows how many reports await your review.',
      'Click a report with "Submitted" status to open the detail view.',
      'Review all entries across the table (KRAs, activities, KPIs, budget, status).',
      'Scroll to the Executive Review section at the bottom.',
      'Add your management comment, corrective guidance, or directive.',
      'Click "Mark as Reviewed" — the Branch Manager sees your comment (read-only).',
    ],
  },
  {
    title: 'Review Budget Plans',
    icon: Wallet,
    steps: [
      'Go to Budget Plan in the sidebar.',
      'Open any plan marked "Submitted".',
      'Review all budget items, estimated costs, utilization rate, and the variance summary.',
      'Scroll to Management Review and add your comments.',
      'Click "Mark as Reviewed" to finalise.',
    ],
  },
  {
    title: 'View Consolidated M&E Summary',
    icon: LayoutList,
    steps: [
      'Go to M&E Summary in the sidebar.',
      'Annual KRA View: see all KRAs from approved/active workplans across the department, filterable by fiscal year.',
      'Quarterly Submissions: see all branches\' submitted reports consolidated, filter by quarter or wing, and view completion rates.',
      'Compliance Tracker: grid showing each branch\'s reporting status (Submitted/Draft/Not Started) per quarter — with overall compliance %.',
      'Use "Export CSV" on any tab to download the data.',
    ],
  },
  {
    title: 'Approve Funding Requests',
    icon: BadgeCheck,
    steps: [
      'Go to Approvals in the sidebar.',
      'Review pending requests in your queue — click to expand and read the full request detail.',
      'Check the approval chain tracker to see prior decisions.',
      'Add a comment, then click Approve or Reject.',
      'Use "Defer / Hold" to pause the request pending more information.',
    ],
  },
]

const FINANCE_GUIDE: GuideSection[] = [
  {
    title: 'Process Finance-Stage Approvals',
    icon: BadgeCheck,
    steps: [
      'Go to Finance in the sidebar.',
      'Finance-stage requests appear after EM, Deputy, and Director have approved.',
      'Review the full approval chain, budget details, and attachments.',
      'Assign a budget line code if applicable, add comments, then Approve or Reject.',
    ],
  },
  {
    title: 'Review Acquittal Reports',
    icon: FileText,
    steps: [
      'Approved funding requests move to "Pending Acquittal" after the activity is completed.',
      'The requesting officer submits an acquittal report with supporting documents.',
      'Review the acquittal in Finance — check spend, documents, and notes.',
      'Accept to close the request, or request revisions.',
    ],
  },
  {
    title: 'Track Budget Utilization',
    icon: BarChart3,
    steps: [
      'Go to Expenditure Budget for programme-level budget vs spend analytics with D3 charts.',
      'Go to Budget Plan to view all branch budget plans, estimated vs utilized, and utilization rates.',
      'Use Export CSV on any view to download financial data for reporting.',
    ],
  },
]

function GuideCard({ section }: { section: GuideSection }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <section.icon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-900">{section.title}</span>
        </div>
        {open
          ? <ChevronDown  className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <ol className="mt-3 space-y-2 list-decimal list-inside">
            {section.steps.map((step, i) => (
              <li key={i} className="text-xs text-gray-600 leading-relaxed pl-1">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const { user } = useAuth()
  const isExecutive = ['executive', 'deputy', 'dcs', 'super'].includes(user?.role ?? '')
  const isFinance   = user?.role === 'finance'

  const guide = isExecutive ? EXECUTIVE_GUIDE : isFinance ? FINANCE_GUIDE : BRANCH_MANAGER_GUIDE
  const roleLabel = isExecutive ? 'Executive / Senior Management' : isFinance ? 'Finance Manager' : 'Branch Manager'

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-base font-bold text-gray-900">Help &amp; User Guide</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          DICT M&amp;E Dashboard · Step-by-step guide for <span className="font-semibold text-gray-600">{roleLabel}</span>
        </p>
      </div>

      {/* Quick reference */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-bold text-blue-900">Quick Reference — Your Key Pages</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
          {!isExecutive && !isFinance && <>
            <span>💰 <strong>Budget Plan</strong> — Enter and track branch budget items</span>
            <span>📋 <strong>Quarterly Reports</strong> — Submit KRA performance reports</span>
            <span>📝 <strong>Annual Workplan</strong> — Set KRAs, KPIs, and quarterly targets</span>
            <span>📤 <strong>My Requests</strong> — Submit funding, leave, and support requests</span>
          </>}
          {isExecutive && <>
            <span>✅ <strong>Quarterly Reports</strong> — Review and comment on branch submissions</span>
            <span>💰 <strong>Budget Plan</strong> — Review branch budget plans and utilization</span>
            <span>📊 <strong>M&E Summary</strong> — Consolidated annual KRAs + compliance tracker</span>
            <span>🔖 <strong>Approvals</strong> — Approve or defer funding requests</span>
          </>}
          {isFinance && <>
            <span>🏦 <strong>Finance</strong> — Process finance-stage approvals and acquittals</span>
            <span>💰 <strong>Budget Plan</strong> — View all branch budget plans and utilization</span>
            <span>📊 <strong>Expenditure Budget</strong> — Programme-level analytics and spend charts</span>
            <span>📝 <strong>Annual Workplan</strong> — View approved division workplans</span>
          </>}
        </div>
      </div>

      {/* Step-by-step guides */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900">Step-by-Step Guides</h2>
        {guide.map((section, i) => <GuideCard key={i} section={section} />)}
      </div>

      {/* System info */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-700">System Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600">
          <span><span className="font-semibold text-gray-700">System:</span> DICT M&amp;E Dashboard</span>
          <span><span className="font-semibold text-gray-700">Organisation:</span> Dept of Information &amp; Communications Technology, PNG</span>
          <span><span className="font-semibold text-gray-700">Your Name:</span> {user?.name ?? '—'}</span>
          <span><span className="font-semibold text-gray-700">Your Role:</span> {roleLabel}</span>
          <span><span className="font-semibold text-gray-700">Division:</span> {user?.division || 'Not set'}</span>
          <span><span className="font-semibold text-gray-700">Authentication:</span> AWS Cognito (username &amp; password)</span>
          <span><span className="font-semibold text-gray-700">Data:</span> AWS DynamoDB (cloud-backed)</span>
          <span><span className="font-semibold text-gray-700">ToR Compliance:</span> DICT M&amp;E Dashboard ToR — Q1 2026</span>
        </div>
        <p className="text-[11px] text-gray-400 pt-1">For technical support, contact the M&amp;E Unit or the ICT Support Branch.</p>
      </div>
    </div>
  )
}
