# Contributing Guidelines

Thank you for contributing to the DICT M&E Dashboard. This document covers how to report bugs, request features, and submit code changes.

---

## Before You Start

- Read the [README](README.md) to understand the project structure and technology stack.
- Review open issues and pull requests to avoid duplicating work.
- For significant changes, open an issue first to discuss your approach.

---

## Reporting Bugs

Use the GitHub issue tracker. When filing a bug, include:

- A clear description of the problem and the steps to reproduce it.
- The dashboard module affected (e.g. Projects, KPI Monitoring, Annual Workplan).
- The user role that exposes the issue (super / admin / officer).
- Browser, OS, and Node.js version.
- Any relevant console errors or screenshots.

---

## Requesting Features

Open a GitHub issue with the label `enhancement`. Describe:

- The dashboard module or workflow the feature relates to.
- The user role(s) that would benefit.
- The problem it solves for DICT staff.

---

## Contributing Code

### Setup

```bash
git clone <repo-url>
cd me
npm install
npm run dev
```

### Branch naming

Use descriptive branch names that reference the dashboard module:

```
feat/workplan-export-pdf
fix/kpi-trend-chart-mobile
chore/update-amplify-schema
```

### Pull Request checklist

Before opening a PR:

1. Work against the latest `main` branch.
2. Keep changes focused — one concern per PR.
3. Ensure `npm run build` passes with no TypeScript errors.
4. Test all three user roles (super, admin, officer) if your change touches auth or navigation.
5. If you change `amplify/data/resource.ts`, verify that `types/index.ts` stays in sync — backend model names and field names must match the frontend types.
6. Write clear commit messages (e.g. `fix: correct KRA weight validation in workplan page`).

### Keeping backend and frontend in sync

The backend schema (`amplify/data/resource.ts`) and the frontend types (`types/index.ts`) must stay aligned. When adding or renaming a model or field:

- Update `amplify/data/resource.ts` first.
- Update the corresponding interface or type in `types/index.ts`.
- Update any mock data in `lib/mock-data/me-data.ts` if needed.
- Update the relevant dashboard page under `app/(dashboard)/`.

---

## Project Conventions

### User roles

Always test changes against all three roles. Role-gated navigation is defined in `components/layout/Sidebar.tsx`. Page-level restrictions should match the sidebar rules.

### Status enums

Statuses used in the dashboard (and their backend enum equivalents):

| Domain | Frontend values | Backend enum values |
|--------|----------------|---------------------|
| Project | `active`, `completed`, `on-hold`, `delayed`, `planned` | `active`, `completed`, `on_hold`, `delayed`, `planned` |
| KPI | `on-track`, `at-risk`, `off-track`, `exceeded` | `on_track`, `at_risk`, `off_track`, `exceeded` |
| Report | `submitted`, `pending`, `overdue`, `approved` | same |
| Workplan | `draft`, `submitted`, `approved`, `active` | same |

Note: GraphQL enum values use underscores; frontend display strings use hyphens.

### Currency

All monetary values are in PGK (Papua New Guinea Kina). Do not introduce other currencies.

### Dates

Use ISO 8601 strings (`YYYY-MM-DD`) for date fields in data models. Display formatting is handled at the component level using `date-fns`.

### Fiscal year

The DICT fiscal year runs January to December. Quarter labels (Q1–Q4) in the workplan correspond to Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec respectively.

---

## Security

Do **not** commit real credentials, API keys, or government data to this repository. The `amplify_outputs.json` file is gitignored for this reason — never force-add it.

To report a security vulnerability, contact the DICT ICT team directly. Do not create a public GitHub issue.

---

## License

By contributing, you agree that your contributions will be licensed under the same MIT-0 License that covers this project. See the [LICENSE](LICENSE) file.
