# CapperTracker

CapperTracker is a production-ready starter kit for tracking sports betting handicappers ("cappers"), managing their picks, and publishing rich analytics. The project ships with a Next.js dashboard, an Express/Prisma API, automated grading logic, and CI-ready testing.

## Monorepo structure

```
/apps
  ├─ api        # Express + Prisma REST API
  └─ web        # Next.js dashboard
/packages
  └─ core       # Shared grading, auth, leaderboard helpers
/db             # Prisma schema & seed script
/tests          # Reserved for future end-to-end suites
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL (recommended) or SQLite for demos

## Environment variables

Copy `.env.example` to `.env` at the repository root and fill in values.

| Variable | Description |
| --- | --- |
| `DATABASE_PROVIDER` | `postgresql` or `sqlite` |
| `DATABASE_URL` | Connection string for Prisma |
| `JWT_SECRET` | Secret used to sign owner JWTs |
| `OWNER_EMAIL` | Seed owner email (default: `owner@example.com`) |
| `OWNER_PASSWORD` | Seed owner password (default: `OwnerPass123!`) |
| `WEBHOOK_SECRET` | Shared secret for webhook grading |
| `NEXT_PUBLIC_API_BASE_URL` | URL for the API (e.g. `http://localhost:4000`) |
| `SPORTS_API_KEY` | Placeholder for third-party scores provider |

## Getting started

Install dependencies and bootstrap Husky hooks (optional):

```bash
npm install
npm run prepare
```

### Database setup

1. Ensure your database is running and the `DATABASE_URL` is set.
2. Run Prisma migrations and generate the client:

   ```bash
   npx prisma migrate deploy --schema ./db/schema.prisma
   npx prisma generate --schema ./db/schema.prisma
   ```
3. Seed the database with demo data (owner, cappers, and graded picks):

   ```bash
   npx ts-node --project tsconfig.base.json ./db/seed.ts
   ```

   > The seed script creates the owner account (`owner@example.com` / `OwnerPass123!`) and 20 picks spanning multiple sports. Adjust the credentials in the script or via `OWNER_EMAIL` and `OWNER_PASSWORD`.

### Local development

Run both the API and the dashboard with a single command:

```bash
npm run dev
```

- API: http://localhost:4000 (configurable via `PORT`)
- Web: http://localhost:3000

You can also run each workspace individually:

```bash
npm run dev --workspace @capper-tracker/api
npm run dev --workspace @capper-tracker/web
```

### Testing & linting

```bash
npm test        # Runs vitest suites across workspaces
npm run lint    # ESLint across workspaces
npm run build   # Production builds
```

### Deployment notes

- **Web (Vercel/Netlify)**: Deploy `apps/web` with environment variables `NEXT_PUBLIC_API_BASE_URL`, `OWNER_EMAIL`, `OWNER_PASSWORD`, and `JWT_SECRET`.
- **API (Render/Fly/Heroku)**: Deploy `apps/api`, set `DATABASE_URL`, `DATABASE_PROVIDER`, `JWT_SECRET`, and `WEBHOOK_SECRET`.
- **Database**: Prisma schema targets PostgreSQL by default. For SQLite demos set `DATABASE_PROVIDER=sqlite` and `DATABASE_URL="file:./dev.db"`.

### Sports results provider

The grading service is provider-agnostic. To integrate a scores API:

1. Store credentials in `SPORTS_API_KEY` (or extend `.env.example`).
2. Implement a fetcher under `apps/api/src/services/providers/your-provider.ts` that maps API responses to the `gradePickById` input.
3. Call the provider from a cron job or webhook and POST to `/api/webhooks/grade`.

## Authentication model

- Single owner account authenticated via `/api/auth/login`.
- Owner receives a short-lived JWT (`Authorization: Bearer <token>`) used for all write endpoints.
- Passwords are hashed with bcrypt and seeded credentials are provided for local dev.

## API surface

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Owner login returning JWT |
| GET | `/api/cappers` | Public list of cappers |
| POST | `/api/cappers` | Create capper (owner only) |
| PATCH | `/api/cappers/:id` | Update capper (owner only) |
| DELETE | `/api/cappers/:id` | Remove capper (owner only) |
| GET | `/api/picks` | Filterable picks feed |
| POST | `/api/picks` | Add pick (owner only) |
| PATCH | `/api/picks/:id` | Edit pick (owner only) |
| POST | `/api/picks/:id/grade` | Manual grading |
| GET | `/api/leaderboards` | Leaderboard windows |
| POST | `/api/webhooks/grade` | Batch grading via webhook |

## Frontend highlights

- Responsive dashboard with summary KPIs, leaderboard, and recent picks.
- Capper detail pages with cumulative profit charts and pick tables.
- Recharts-powered visuals with graceful fallbacks to seeded sample data.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, tests, and builds on every push. Customize with deployment steps (e.g., Vercel CLI) as needed.

## Contributing

1. Create feature branches.
2. Run `npm test` and `npm run lint` before committing.
3. Submit PRs with screenshots for UI changes when possible.

Enjoy tracking your cappers with confidence!
