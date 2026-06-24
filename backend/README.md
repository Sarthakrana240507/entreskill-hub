# EntreSkill Hub — Backend

Express.js REST API for EntreSkill Hub, backed by PostgreSQL via Prisma ORM.

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The server starts on `http://localhost:5000` by default. Visit `/health` for a liveness check and `/api-docs` for
interactive API documentation.

## Project Layout

```
src/
├── config/        env loading, logger, Prisma client singleton, Swagger spec
├── controllers/    one file per domain (auth, ideas, roadmaps, mentors, admin, ...)
├── middleware/      auth, RBAC, validation, rate limiting, error handling
├── routes/          one file per domain, aggregated in routes/index.js
├── utils/           errors, async handler, JWT helpers, recommendation engine
├── validators/      Zod schemas for every request body/query
├── seed/             database seed script
├── docs/             OpenAPI path definitions (paths.yaml)
└── __tests__/        unit, integration, and end-to-end Jest test suites
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on file changes) |
| `npm start` | Start in production mode |
| `npm test` | Run the full Jest test suite |
| `npm test -- --coverage` | Run tests with a coverage report |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Create/apply a new migration (dev) |
| `npm run prisma:migrate:deploy` | Apply pending migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm run seed` | Populate demo data |

## Environment Variables

See `.env.example` for the full list. At minimum you need `DATABASE_URL`, `JWT_ACCESS_SECRET`, and
`JWT_REFRESH_SECRET` set to start the server.

## Architecture Notes

- **Authentication:** short-lived (15 min) JWT access tokens + long-lived (7 day) rotating refresh tokens, stored
  server-side in the `refresh_tokens` table so they can be revoked.
- **Authorization:** role-based (`USER`, `MENTOR`, `ADMIN`) via the `requireRole` middleware, applied per-route.
- **Validation:** every request body/query is validated against a Zod schema before reaching controller logic.
- **Errors:** a single central error handler normalizes both application errors and Prisma errors into a consistent
  JSON shape (see API Documentation for the exact format).
- **Recommendation engine:** a pure, dependency-free scoring module (`utils/recommendationEngine.js`) — see the
  Technical Report in `/docs` for the full formula and rationale.

## Testing

```bash
npm test                                    # everything
npm test -- recommendationEngine.test.js    # a single file
npm test -- --coverage                      # with coverage
```

Integration and end-to-end tests require a real PostgreSQL database reachable via `DATABASE_URL`; they skip
automatically (rather than failing) if it isn't configured, so unit tests still run in any environment.
