# DICT M&E Dashboard

Monitoring and Evaluation Dashboard for the **Department of Information Communication & Technology (DICT)**, Government of Papua New Guinea.

Built with Next.js 14 (App Router) and AWS Amplify Gen2, the dashboard gives DICT officers, administrators, and super-admins a single place to track ICT projects, KPIs, quarterly reports, and annual workplans.

---

## Overview

The DICT M&E Dashboard is a role-based web application that centralises performance monitoring across DICT's five programme areas:

- Infrastructure
- Digital Transformation
- Capacity Building
- eGovernment
- Cybersecurity

Three user roles control what each person can see and do:

| Role | Access |
|------|--------|
| **Super Admin** | Full access — user management, all modules, settings |
| **Admin** | Dashboard, projects, KPIs, reports, workplans, settings |
| **Officer** | Dashboard, projects, KPIs, reports (view only) |

---

## Features

- **Authentication** — Email-based login via Amazon Cognito with custom `role` and `division` user attributes.
- **Dashboard Overview** — Live KPI summary cards, budget utilisation, and project status charts powered by D3.js.
- **Projects & Programs** — Track ICT projects with milestones, budgets (PGK), leads, and beneficiary counts.
- **KPI Monitoring** — Real-time performance indicators with trend history and status (on-track / at-risk / off-track / exceeded).
- **Reports** — Manage quarterly, monthly, annual, and ad-hoc reports with submission and approval workflows.
- **Annual Workplan** — Full CRUD for strategic workplans with Key Result Areas (KRAs) and KPIs, weight validation, and a draft → submitted → approved → active status workflow.
- **User Management** — Super-admin provisioning of DICT staff with role assignment (super / admin / officer).
- **Settings** — Application configuration (admin and above).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Charts | D3.js v7 |
| Icons | lucide-react |
| Backend | AWS Amplify Gen2 (Cognito, AppSync, DynamoDB) |
| API | GraphQL via AWS AppSync |
| Hosting | AWS Amplify Console |

---

## Project Structure

```
amplify/
  auth/resource.ts      # Cognito auth — email login, custom role & division attributes
  data/resource.ts      # AppSync GraphQL schema — all dashboard domain models
  backend.ts            # Backend entry point

app/
  (dashboard)/          # Authenticated route group
    dashboard/          # Overview page
    projects/           # Projects & Programs
    kpi/                # KPI Monitoring
    reports/            # Reports
    workplan/           # Annual Workplan
    settings/           # Settings
    users/              # User Management
  auth/login/           # Login page

components/
  layout/               # DashboardShell, Sidebar, TopBar
  shared/               # D3 chart components, KPICard
  ui/                   # shadcn/ui base components

lib/
  auth-context.tsx      # Auth context and mock users
  mock-data/me-data.ts  # Development mock data

types/index.ts          # Shared TypeScript types (mirrors backend schema)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account with Amplify CLI access
- `npm` or compatible package manager

### Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Development credentials (mock users):**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@dict.gov.pg | dict@2025 |
| Admin | admin@dict.gov.pg | dict@2025 |
| Officer | officer@dict.gov.pg | dict@2025 |

### Deploying to AWS

```bash
# Deploy backend (auth + data)
npx ampx pipeline-deploy

# Build frontend
npm run build
```

For full deployment instructions see the [Amplify Gen2 deployment guide](https://docs.amplify.aws/gen2/deploy-and-host/fullstack-branching/).

---

## Backend Schema

The Amplify data schema (`amplify/data/resource.ts`) defines the following models, all aligned with `types/index.ts`:

- `Project` → `Milestone` (1:M)
- `KPI` → `KPIDataPoint` (1:M)
- `Report`
- `AnnualWorkplan` → `KRA` → `WorkplanKPI` (nested 1:M)
- `ManagedUser`

All models use `userPool` authentication — only authenticated DICT staff can read or write data.

---

## Security

To report a potential security issue, contact the DICT ICT team directly. Do **not** create a public GitHub issue for security vulnerabilities.

See [CONTRIBUTING](CONTRIBUTING.md#security) for more information.

---

## License

Licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.
