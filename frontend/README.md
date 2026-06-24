# EntreSkill Hub — Frontend

Next.js 14 (App Router) application for EntreSkill Hub.

## Setup

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your running backend
npm install
npm run dev
```

Starts on `http://localhost:3000`. The backend must be running separately (see `../backend/README.md`).

## Project Layout

```
app/                 Routes (App Router) — one folder per route, page.tsx per page
  ├── admin/          Admin dashboard + sub-pages (users, mentors, resources, ideas, reports)
  ├── dashboard/       User dashboard (roadmap progress, bookmarks)
  ├── ideas/           Business idea listing + detail pages
  ├── mentors/         Public directory, application, mentor dashboard
  ├── roadmaps/        Per-roadmap progress/checklist page
  └── ...
components/
  ├── ui/              Button, Card, Input, ProgressBar — the design system primitives
  ├── layout/          Header, Footer
  └── ideas/           IdeaCard, RoadmapStepList
context/
  └── AuthContext.tsx  Login/register/logout state, exposed via useAuth()
lib/
  ├── api.ts           Axios client with automatic token-refresh interceptor
  ├── types.ts          Shared TypeScript types matching the backend's API shapes
  └── useRequireAuth.ts Route guard hook (redirects if not logged in / wrong role)
```

## Design System

The visual identity is intentionally not generic SaaS-blue: a warm "ledger paper" palette (cream background, deep
indigo ink, marigold accent, workshop green) with a hand-stamped badge motif, evoking a shopkeeper's receipt book
rather than a tech dashboard. Design tokens live in `tailwind.config.ts` and `app/globals.css`.

## Authentication Flow

`AuthContext` stores the access/refresh token pair in cookies and exposes `user`, `login`, `register`, `logout`, and
`refreshUser`. The Axios client in `lib/api.ts` automatically attaches the access token to every request and
transparently refreshes it on a 401 response, retrying the original request once.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Start the production build |
| `npm run lint` | ESLint (Next.js config) |
