import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// DICT M&E Dashboard – Amplify Data Schema
// Model and enum names mirror the frontend TypeScript types in types/index.ts
// so that backend and frontend stay in sync as the dashboard evolves.

const schema = a.schema({
  // ── Enums ────────────────────────────────────────────────────────────────
  UserRole: a.enum(['super', 'admin', 'finance', 'executive', 'deputy', 'dcs']),

  ProjectStatus:  a.enum(['active', 'completed', 'on_hold', 'delayed', 'planned']),
  KPIStatus:      a.enum(['on_track', 'at_risk', 'off_track', 'exceeded']),
  KPITrend:       a.enum(['up', 'down', 'stable']),
  ReportStatus:   a.enum(['submitted', 'pending', 'overdue', 'approved']),
  ReportType:     a.enum(['quarterly', 'monthly', 'annual', 'ad_hoc']),
  WorkplanStatus: a.enum(['draft', 'submitted', 'approved', 'active']),

  RequestStage: a.enum([
    'pending_em',
    'pending_deputy',
    'pending_dcs',
    'pending_finance',
    'pending_acquittal',
    'pending_acquittal_review',
    'closed',
    'rejected',
    'deferred',
  ]),

  RequestType: a.enum([
    'funding',
    'procurement',
    'leave_travel',
    'training',
    'it_support',
    'policy',
  ]),

  ProgramArea: a.enum([
    'Policy_and_ME',
    'Partnership_Sector',
    'Government_Cloud',
    'DevOps',
    'Cyber_Security',
    'Corporate_Services',
    'Executive_Services',
  ]),

  // ── Custom types (embedded objects) ─────────────────────────────────────
  ApprovalEntry: a.customType({
    decision: a.string().required(),   // 'pending' | 'approved' | 'rejected'
    by:       a.string(),
    at:       a.string(),
    comment:  a.string(),
  }),

  RequestAttachment: a.customType({
    name: a.string().required(),
    size: a.integer().required(),      // bytes
    type: a.string().required(),       // MIME type
    url:  a.string().required(),       // S3 key / signed URL
  }),

  // ── Projects ─────────────────────────────────────────────────────────────
  Project: a
    .model({
      name:          a.string().required(),
      program:       a.ref('ProgramArea').required(),
      status:        a.ref('ProjectStatus').required(),
      completion:    a.integer().required(),
      budget:        a.float().required(),
      spent:         a.float().required(),
      startDate:     a.string().required(),
      endDate:       a.string().required(),
      lead:          a.string().required(),
      beneficiaries: a.integer().required(),
      description:   a.string(),
      milestones:    a.hasMany('Milestone', 'projectId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  Milestone: a
    .model({
      projectId: a.id().required(),
      project:   a.belongsTo('Project', 'projectId'),
      title:     a.string().required(),
      dueDate:   a.string().required(),
      completed: a.boolean().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ── KPI Monitoring ───────────────────────────────────────────────────────
  KPI: a
    .model({
      name:        a.string().required(),
      program:     a.ref('ProgramArea').required(),
      unit:        a.string().required(),
      target:      a.float().required(),
      actual:      a.float().required(),
      baseline:    a.float().required(),
      status:      a.ref('KPIStatus').required(),
      trend:       a.ref('KPITrend').required(),
      lastUpdated: a.string().required(),
      history:     a.hasMany('KPIDataPoint', 'kpiId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  KPIDataPoint: a
    .model({
      kpiId:  a.id().required(),
      kpi:    a.belongsTo('KPI', 'kpiId'),
      month:  a.string().required(),
      value:  a.float().required(),
      target: a.float().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ── Reports ──────────────────────────────────────────────────────────────
  Report: a
    .model({
      title:       a.string().required(),
      program:     a.ref('ProgramArea').required(),
      type:        a.ref('ReportType').required(),
      period:      a.string().required(),
      status:      a.ref('ReportStatus').required(),
      submittedBy: a.string().required(),
      submittedAt: a.string(),
      dueDate:     a.string().required(),
      fileUrl:     a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ── Annual Workplan ──────────────────────────────────────────────────────
  AnnualWorkplan: a
    .model({
      title:      a.string().required(),
      fiscalYear: a.string().required(),
      period:     a.string().required(),
      division:   a.string().required(),
      objective:  a.string().required(),
      budget:     a.float().required(),
      createdBy:  a.string().required(),
      approvedBy: a.string(),
      status:     a.ref('WorkplanStatus').required(),
      kras:       a.hasMany('KRA', 'workplanId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  KRA: a
    .model({
      workplanId:   a.id().required(),
      workplan:     a.belongsTo('AnnualWorkplan', 'workplanId'),
      title:        a.string().required(),
      description:  a.string(),
      weight:       a.integer().required(),
      workplanKPIs: a.hasMany('WorkplanKPI', 'kraId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  WorkplanKPI: a
    .model({
      kraId:        a.id().required(),
      kra:          a.belongsTo('KRA', 'kraId'),
      name:         a.string().required(),
      unit:         a.string().required(),
      baseline:     a.string(),
      q1Target:     a.string(),
      q2Target:     a.string(),
      q3Target:     a.string(),
      q4Target:     a.string(),
      annualTarget: a.string(),
      responsible:  a.string(),
      method:       a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ── Funding Requests (multi-step approval workflow) ──────────────────────
  // Workflow: M&E Manager → Exec. Manager → Deputy Sec.
  //           → Dir. Corp. Services → Finance → Acquittal → Closed
  FundingRequest: a
    .model({
      programme:            a.string().required(),
      description:          a.string().required(),
      amount:               a.float().required(),
      fiscalYear:           a.string().required(),
      submittedBy:          a.string().required(),
      submittedAt:          a.string().required(),
      stage:                a.ref('RequestStage').required(),
      requestType:          a.string(),
      division:             a.string(),
      workplanId:           a.string(),
      workplanTitle:        a.string(),
      kraId:                a.string(),
      kraTitle:             a.string(),
      budgetLine:           a.string(),
      deferredFromStage:    a.string(),
      // Approval decisions (serialised JSON: ApprovalEntry)
      emDecision:           a.string(),
      deputyDecision:       a.string(),
      dcsDecision:          a.string(),
      financeDecision:      a.string(),
      // Attachments (serialised JSON array: RequestAttachment[])
      attachments:          a.string(),
      // Acquittal report
      acquittalNotes:       a.string(),
      acquittalSubmittedAt: a.string(),
      acquittalAttachments: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ── Corporate Plan (super-admin managed, all users read) ─────────────────
  CorporatePlan: a
    .model({
      title:          a.string().required(),
      period:         a.string().required(),
      vision:         a.string().required(),
      mission:        a.string().required(),
      endorsedBy:     a.string(),
      lastReviewed:   a.string(),
      prioritiesJson: a.string().required(), // StrategicPriority[] as JSON
      createdBy:      a.string().required(),
      updatedAt:      a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ── Managed Users (super-admin provisioned) ──────────────────────────────
  ManagedUser: a
    .model({
      name:      a.string().required(),
      email:     a.string().required(),
      role:      a.ref('UserRole').required(),
      division:  a.string().required(),
      status:    a.string().required(),
      lastLogin: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
