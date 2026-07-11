# Documentation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the stale implementation plan and replace it with a durable root contributor guide.

**Architecture:** This is a docs-only cleanup. `AGENTS.md` becomes the source for contributor and agent rules, while `README.md`, `DEPLOYMENT.md`, `SMOKE_TEST.md`, and `TODO.md` keep their existing focused responsibilities.

**Tech Stack:** Markdown documentation for a pnpm/Vite+ TypeScript monorepo using React, TanStack Router, TanStack Query, Mantine, Hono, tRPC, Better Auth, Drizzle, Cloudflare D1, Alchemy, and Cloudflare Stream.

## Global Constraints

- Do not change application code, routes, schemas, tests, deployment configuration, smoke flows, or deferred product scope.
- Delete `PLAN.md`; do not archive it elsewhere.
- Keep `README.md`, `DEPLOYMENT.md`, `SMOKE_TEST.md`, and `TODO.md` focused on their current responsibilities.
- Update only direct `PLAN.md` references if any are found.

---

## File Structure

- Create: `AGENTS.md` as the root contributor and agent guide.
- Delete: `PLAN.md` because its historical implementation checklist remains available in git history.
- Inspect only: `README.md`, `DEPLOYMENT.md`, `SMOKE_TEST.md`, `TODO.md`, and tracked Markdown files for references to `PLAN.md`.

### Task 1: Add Root Agent Guide

**Files:**

- Create: `AGENTS.md`

**Interfaces:**

- Consumes: Approved design in `docs/superpowers/specs/2026-07-11-docs-cleanup-design.md`.
- Produces: Root guidance read by future contributors and agents before modifying the repo.

- [ ] **Step 1: Create `AGENTS.md`**

Use this exact Markdown content:

```markdown
# AGENTS.md

## Project

Prive Course is a private video course platform. Version 1 uses manual course access management: admins create courses and lessons, upload protected lesson videos, grant or revoke course access, and students view only courses they have been granted access to.

Payment flows are intentionally out of scope for v1.

## Stack

- Package manager and workspace: pnpm managed through Vite+ commands.
- Frontend: React, Vite, TanStack Router, TanStack Query, Mantine, Tailwind CSS utilities, and Sonner toasts.
- Backend: Hono Worker app exposing tRPC.
- Auth: Better Auth with passkey and admin plugins.
- Database: Drizzle ORM with Cloudflare D1.
- Infrastructure: Cloudflare Workers and D1 deployed through Alchemy.
- Video: Cloudflare Stream direct creator uploads with tus chunks and signed playback tokens.

## Repository Layout

- `apps/web`: React app, routes, app-specific components, and browser-side API clients.
- `apps/server`: Hono Worker entrypoint, Wrangler config, and local server scripts.
- `packages/api`: tRPC routers, procedures, authorization checks, and API tests.
- `packages/auth`: Better Auth server configuration.
- `packages/db`: Drizzle schema, database factory, and generated migrations.
- `packages/env`: shared environment typing and validation entrypoints.
- `packages/infra`: Alchemy deployment definitions for web, server, D1, and migrations.
- `packages/ui`: shared shadcn/ui primitives and global styles from the starter stack.

## Frontend Rules

- Use TanStack Router file routes under `apps/web/src/routes`.
- Put authenticated routes under `_auth`; the `_auth` layout owns the client-side session redirect to `/login`.
- Use route loaders to preload route-critical TanStack Query data with `context.queryClient.ensureQueryData`.
- Keep reusable app components in `apps/web/src/components`.
- Keep domain-specific UI in `apps/web/src/features/<domain>`.
- Prefer Mantine components for forms, layout primitives, tables, badges, papers, and feedback states.
- Use `Link` from `@tanstack/react-router` for internal navigation.
- After mutations, invalidate the specific tRPC query keys that changed.
- Show user-facing mutation failures with `toast.error(error.message)`.

## API And Security Rules

- Frontend decides what to show; backend decides what is allowed.
- Every protected API route must validate the authenticated session server-side.
- Every admin API route must use `adminProcedure` or an equivalent server-side admin role check.
- Student course, lesson, progress, and playback operations must validate active course access server-side.
- Do not rely on hidden buttons, hidden routes, or client redirects for authorization.
- Cloudflare Stream videos are not public assets. Playback must use backend-issued signed playback tokens.
- Keep playback-session enforcement on the backend so a second browser/session cannot bypass client logic.
- Validate external Cloudflare responses with schemas before trusting fields.

## Database Rules

- Define Drizzle schema in `packages/db/src/schema`.
- Keep Better Auth tables in the auth schema files and course-domain tables in the course schema files.
- Generate migrations after schema changes with `vp run db:generate`.
- Generated migrations live in `packages/db/src/migrations`.
- Do not hand-edit generated migration snapshots unless repairing a known migration-generation issue.
- Local and remote D1 migration details belong in `DEPLOYMENT.md`.

## Commands

- Install dependencies: `pnpm install`.
- Start web and server together: `vp run dev`.
- Start only web: `vp run dev:web`.
- Start only server: `vp run dev:server`.
- Run repo checks: `vp run check`.
- Run tests: `vp run test`.
- Run React Doctor: `vp exec react-doctor --no-telemetry -y --verbose`.
- Run local automated smoke checks: `vp run smoke`.
- Run production automated smoke checks: `vp run smoke:production`.
- Generate Drizzle migrations: `vp run db:generate`.
- Apply local D1 migrations: `vp run db:migrate:local`.
- Deploy through Alchemy: `vp run deploy`.

## Validation Expectations

- For docs-only edits, run `vp run check` when practical because staged hooks format Markdown.
- For frontend behavior changes, run `vp run check`, `vp run test`, and React Doctor.
- For API, auth, database, or security-sensitive changes, run `vp run check`, `vp run test`, and the relevant smoke command.
- For deployment or CORS/auth URL changes, run `vp run smoke:production` after deploy.

## Documentation Boundaries

- `README.md`: human onboarding, basic stack summary, project structure, and common scripts.
- `AGENTS.md`: contributor and agent rules for working in this repo.
- `DEPLOYMENT.md`: Cloudflare runtime, environment variables, D1 migrations, deploy commands, and Stream operations.
- `SMOKE_TEST.md`: automated smoke checks and manual admin/student smoke flows.
- `TODO.md`: deferred product or technical work that is still intentionally open.
```

- [ ] **Step 2: Verify the guide references current paths**

Run:

```sh
rg -n "apps/web|apps/server|packages/api|packages/auth|packages/db|packages/env|packages/infra|packages/ui" AGENTS.md
```

Expected: PASS with matches for every listed path and no missing-file errors.

### Task 2: Remove Stale Plan

**Files:**

- Delete: `PLAN.md`

**Interfaces:**

- Consumes: `AGENTS.md` from Task 1.
- Produces: No stale root implementation plan remains.

- [ ] **Step 1: Delete `PLAN.md`**

Run:

```sh
rm PLAN.md
```

Expected: `PLAN.md` no longer exists.

- [ ] **Step 2: Verify deletion**

Run:

```sh
test ! -e PLAN.md
```

Expected: PASS with no output.

### Task 3: Check References And Validate

**Files:**

- Inspect: tracked Markdown and source files.
- Modify: only files with direct references to `PLAN.md`, if the search finds any.

**Interfaces:**

- Consumes: Completed Tasks 1 and 2.
- Produces: A clean docs-only change ready for review.

- [ ] **Step 1: Search for direct `PLAN.md` references**

Run:

```sh
rg -n "PLAN\\.md|Prive Course Plan" .
```

Expected: matches are allowed only in `docs/superpowers/specs/2026-07-11-docs-cleanup-design.md` and this plan file. If another tracked project doc references `PLAN.md`, update that reference to `AGENTS.md`, `TODO.md`, `DEPLOYMENT.md`, or `SMOKE_TEST.md` according to the intended topic.

- [ ] **Step 2: Check git status**

Run:

```sh
git status --short
```

Expected: only `A AGENTS.md`, `D PLAN.md`, and this plan file if it has not already been committed.

- [ ] **Step 3: Run docs validation**

Run:

```sh
vp run check
```

Expected: PASS.

- [ ] **Step 4: Commit implementation**

Run:

```sh
git add AGENTS.md PLAN.md docs/superpowers/plans/2026-07-11-docs-cleanup.md
git commit -m "docs: replace plan with agent guide"
```

Expected: Commit succeeds.
