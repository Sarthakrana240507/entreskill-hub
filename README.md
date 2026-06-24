# EntreSkill Hub — Skill-to-Startup Enablement Platform

EntreSkill Hub helps people with practical skills — tailoring, food preparation, repair services, handicrafts, digital
skills, and more — turn that skill into a real, structured micro-business. It matches users to relevant business ideas,
gives them a phased launch roadmap, curates learning resources, and connects them with verified mentors.

This repository contains the complete, working implementation: a Next.js frontend, an Express.js + PostgreSQL backend,
an automated test suite, and full project documentation.

## Project Structure

```
EntreSkillHub/
├── backend/              Express.js REST API (Node 18, Prisma, PostgreSQL)
├── frontend/             Next.js 14 application (React, Tailwind CSS)
├── docs/                 PRD, SRS, Technical Report, API docs, guides (see below)
├── render.yaml           One-click Render deployment blueprint (backend + DB)
├── .github/workflows/    CI pipeline (lint, test, build on every push)
└── README.md             You are here
```

## Quick Start (Local Development)

### 1. Backend

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL to point at your local/cloud Postgres
npm install
npx prisma migrate dev --name init
npm run seed                # creates demo accounts + sample business ideas
npm run dev                 # http://localhost:5000
```

Demo accounts created by the seed script (password for all: `Password1`):

| Role   | Email                       |
|--------|------------------------------|
| Admin  | admin@entreskillhub.com      |
| Mentor | mentor@entreskillhub.com     |
| User   | user@entreskillhub.com       |

API documentation (Swagger UI) is available at `http://localhost:5000/api-docs` once the backend is running.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL should point at the backend above
npm install
npm run dev                 # http://localhost:3000
```

## Running Tests

```bash
cd backend
npm test                    # full suite: unit + integration + end-to-end
npm test -- --coverage      # with a coverage report
```

Unit tests run with no database required. Integration and end-to-end tests need `DATABASE_URL` pointed at a real
(disposable/test) PostgreSQL instance — they auto-skip gracefully if one isn't configured.

## Deployment

See **`docs/Deployment_Guide.docx`** for a complete, copy-paste walkthrough covering:
- Provisioning a managed PostgreSQL database (Neon/Supabase/Render)
- Deploying the backend (Render, using the included `render.yaml` blueprint or Dockerfile)
- Deploying the frontend (Vercel)
- Post-deployment verification checklist

## Documentation

All documents live in `docs/` as polished `.docx` files:

| Document | Contents |
|---|---|
| `PRD.docx` | Product Requirements Document — goals, scope, personas, features |
| `SRS.docx` | Software Requirements Specification — detailed functional/non-functional requirements |
| `Technical_Report.docx` | Architecture, ER diagram, recommendation engine design, security |
| `API_Documentation.docx` | Full REST API reference (also live at `/api-docs` on the backend) |
| `Deployment_Guide.docx` | Step-by-step deployment instructions |
| `User_Guide.docx` | End-user walkthrough |
| `Admin_Guide.docx` | Admin moderation & curation walkthrough |
| `Mentor_Guide.docx` | Mentor application & engagement walkthrough |
| `Test_Report.docx` | Test plan, coverage, and requirements traceability matrix |

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Axios
- **Backend:** Node.js 18, Express.js 4, Zod validation, JWT auth, Winston logging
- **Database:** PostgreSQL, accessed via Prisma ORM
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions
- **Deployment targets:** Vercel (frontend), Render/any Node host + Dockerfile (backend), any managed Postgres

## Key Design Decision: Explainable Recommendations

Rather than a black-box ML model, the recommendation engine (`backend/src/utils/recommendationEngine.js`) uses a
transparent, weighted scoring formula — skill match (60%), interest overlap (25%), feasibility fit (15%) — so every
match score shown to a user can be explained and acted on. See the Technical Report for full details.

## License

MIT
