# Copilot Instructions for PostForge Scheduler

## Project Overview
- **Purpose:** AI-powered tool for generating, scheduling, and publishing social media posts.
- **Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS 4, Prisma ORM 7, Supabase (PostgreSQL), Clerk (auth), Claude 3.5 Sonnet API, Stripe, Playwright.
- **Architecture:**
  - `src/app/` — Next.js app router, API routes, layouts, dashboard, sign-in/up flows.
  - `src/components/` — React UI components, credit system, toast notifications.
  - `src/lib/` — Utility modules (AI, credits, Prisma, streaming, Stripe).
  - `prisma/` — Database schema, migrations, seed scripts.
  - `scripts/` — Validation, relationship, and DB state scripts (see below).

## Key Workflows
- **Development:**
  - Start: `npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Prisma client: `npm run prisma:generate`
  - DB migration: `npm run db:migrate`
  - Seed DB: `npm run db:seed`
  - Open Prisma Studio: `npm run db:studio`
- **Testing:**
  - Playwright: `npm run test` (see Playwright config)
  - TypeScript: `npx tsc --noEmit`
  - DB validation: `npx tsx scripts/step3-validation.ts`
  - Relationship tests: `npx tsx scripts/test-relationships.ts`
  - Quick DB check: `npx tsx scripts/check-db.ts`

## Conventions & Patterns
- **API routes:** Located in `src/app/api/` (RESTful, Next.js handlers).
- **Credit system:** Managed in `src/lib/credits.ts` and `src/components/credits/`.
- **AI integration:** Claude API logic in `src/lib/ai/` and `src/app/api/ai/`.
- **Stripe:** Payment logic in `src/lib/stripe/` and `src/app/api/stripe/`.
- **Auth:** Clerk setup in `src/app/sign-in/` and `src/app/sign-up/`.
- **Styling:** Tailwind CSS, global styles in `src/app/globals.css`.
- **Type safety:** Shared types in `src/types/`.
- **Database:** Prisma schema in `prisma/schema.prisma`, migrations in `prisma/migrations/`.
- **Environment:** All secrets/keys in `.env.local` (see README for required vars).

## Integration Points
- **Supabase:** PostgreSQL connection via `DATABASE_URL`.
- **Clerk:** Auth keys in `.env.local`, flows in `src/app/sign-in/` and `sign-up/`.
- **Claude API:** Key in `.env.local`, usage in `src/lib/ai/`.
- **Stripe:** Keys in `.env.local`, logic in `src/lib/stripe/`.

## Examples
- **Run DB validation:** `npx tsx scripts/step3-validation.ts`
- **Generate post (AI):** See `src/app/actions/generatePost.ts`
- **Credit badge UI:** See `src/components/credits/CreditCostBadge.tsx`

## Tips for AI Agents
- Always check for required environment variables before running scripts.
- Use provided scripts in `scripts/` for DB health and relationship checks.
- Follow file/directory conventions for new features (see structure above).
- Reference README and scripts/README.md for workflow details.

---
For questions or unclear conventions, ask for clarification or review the README and scripts/README.md for authoritative guidance.
