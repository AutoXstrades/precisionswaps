# PrecisionSwaps.co

Dark-neon LS swap planning app powered by Last Stop Swaps. Customers use a guided on-screen AI LS Swap Specialist to create build tickets, while Nick can use the owner back office to review customers, builds, AI logs, and Clawbot agent reports.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- NextAuth credentials auth
- Prisma with PostgreSQL
- OpenAI API from server-side routes only

## Setup

```bash
npm install
```

Create `.env` from `.env.example` and set:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/precisionswaps"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-openai-key"
OPENAI_MODEL="gpt-4o-mini"
ADMIN_EMAIL="nick@example.com"
ADMIN_PASSWORD="replace-with-a-strong-admin-password"
```

`OPENAI_API_KEY` is optional for local UI testing. If it is missing, the LS Specialist and Clawbot Supervisor use deterministic fallback reports.

## Database

For local development, apply migrations:

```bash
npm run prisma:migrate
```

For production, connect `DATABASE_URL` to the real PostgreSQL instance, then run:

```bash
npm run prisma:deploy
npm run prisma:db-seed
npm run verify:db
```

For local seed without `prisma db seed`, run:

```bash
npm run prisma:seed
```

The seed creates or updates:

- Admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- LS Swap Specialist config
- Clawbot Supervisor config
- Clawbot Build Gap Analyzer worker config

## Run

```bash
npm run dev
```

Open:

- Customer site: `http://localhost:3000`
- Customer dashboard: `http://localhost:3000/dashboard`
- Owner login: `http://localhost:3000/admin`

## Verification

```bash
npm run build
npm audit --omit=dev
npm run verify:auth
```

`npm run verify:auth` expects the app to be running at `NEXTAUTH_URL`, `AUTH_URL`, or `http://127.0.0.1:3000`.

Expected core flows after database setup:

- Customer can sign up, log in, create a guided build ticket, and view saved builds.
- Admin can log in, view all builds, inspect agent logs, view agent configs, and run the Clawbot Supervisor report.

## Phase 7 Go Live Checklist

Before the first production test:

1. Set `DATABASE_URL` to the production PostgreSQL connection string.
2. Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `OPENAI_API_KEY`.
3. In Vercel, set the build command to `npm run build`.
4. In Vercel or a Node host, set the start command to `npm start`.
5. Run `npm run prisma:deploy`.
6. Run `npm run prisma:db-seed`.
7. Run `npm run verify:db`.
8. Run `npm run build`.
9. Start production mode with `npm run start`.
10. Run `npm run verify:auth` against the production URL or staging URL.
11. Dry-run the customer path: signup, login, create build, edit build, confirm dashboard, logout.
12. Dry-run the admin path: login, filter builds, edit build, edit agent config, run Clawbot report.
13. Confirm unauthenticated users redirect to login/admin login.
14. Confirm customers cannot access admin routes.
15. Confirm admins cannot access customer-only build editing routes.

## Boundaries

This project does not connect to CBTuner backend, database, or APIs. It only expects its own PostgreSQL database and optionally an OpenAI API key.
