import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// DICT M&E Dashboard – Amplify Data Schema
// Model and enum names mirror the frontend TypeScript types in types/index.ts
// so that backend and frontend stay in sync as the dashboard evolves.

const schema = a.schema({
  // ── Enums ────────────────────────────────────────────────────────────────
  UserRole:       a.enum(['super', 'admin', 'officer']),
  ProjectStatus:  a.enum(['active', 'completed', 'on_hold', 'delayed', 'planned']),
  KPIStatus:      a.enum(['on_track', 'at_risk', 'off_track', 'exceeded']),
  KPITrend:       a.enum(['up', 'down', 'stable']),
  ReportStatus:   a.enum(['submitted', 'pending', 'overdue', 'approved']),
  ReportType:     a.enum(['quarterly', 'monthly', 'annual', 'ad_hoc']),
  WorkplanStatus: a.enum(['draft', 'submitted', 'approved', 'active']),
  ProgramArea:    a.enum([
    'Infrastructure',
    'Digital_Transformation',
    'Capacity_Building',
    'eGovernment',
    'Cybersecurity',
  ]),

  // ── Projects ─────────────────────────────────────────────────────────────
  // Mirrors: types/index.ts → Project, Milestone
  Project: a
    .model({
      name:          a.string().required(),
      program:       a.ref('ProgramArea').required(),
      status:        a.ref('ProjectStatus').required(),
      completion:    a.integer().required(),   // 0–100 %
      budget:        a.float().required(),     // PGK
      spent:         a.float().required(),     // PGK
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
  // Mirrors: types/index.ts → KPI, KPIDataPoint
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
  // Mirrors: types/index.ts → Report
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
  // Mirrors: types/index.ts → AnnualWorkplan, KRA, WorkplanKPI
  AnnualWorkplan: a
    .model({
      title:      a.string().required(),
      fiscalYear: a.string().required(),
      period:     a.string().required(),        // e.g. "Jan 2025 – Dec 2025"
      division:   a.string().required(),
      objective:  a.string().required(),
      budget:     a.float().required(),         // PGK
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
      weight:       a.integer().required(),     // %; all KRAs per workplan sum to 100
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

  // ── Managed Users (super-admin provisioned) ──────────────────────────────
  // Mirrors: types/index.ts → ManagedUser
  ManagedUser: a
    .model({
      name:      a.string().required(),
      email:     a.string().required(),
      role:      a.ref('UserRole').required(),
      division:  a.string().required(),
      status:    a.string().required(),         // 'active' | 'inactive'
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
