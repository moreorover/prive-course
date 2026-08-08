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
- `alchemy.run.ts`: Alchemy deployment definitions for web, server, D1, and migrations.

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
- Run Knip: `vp run knip`.
- Run repo checks: `vp run check`.
- Run tests: `vp run test`.
- Run React Doctor: `vp exec react-doctor --no-telemetry -y --verbose`.
- Run local automated smoke checks: `vp run smoke`.
- Run production automated smoke checks: `vp run smoke:production`.
- Generate Drizzle migrations: `vp run db:generate`.
- Apply local D1 migrations: `vp run db:migrate:local`.
- Deploy dev through Alchemy: `vp run deploy`.
- Deploy prod through Alchemy: `vp run deploy:prod`.

## Validation Expectations

- For docs-only edits, run `vp run check` when practical because staged hooks format Markdown.
- For frontend behavior changes, run `vp run check`, `vp run test`, and React Doctor.
- For API, auth, database, or security-sensitive changes, run `vp run check`, `vp run test`, and the relevant smoke command.
- For deployment or CORS/auth URL changes, run `vp run smoke:production` after deploy.

## Documentation Boundaries

- `README.md`: human onboarding, basic stack summary, project structure, and common scripts.
- `AGENTS.md`: contributor and agent rules for working in this repo.
- `USER_STORIES.md`: single source of truth for product behavior, roadmap stages,
  runtime flows, acceptance scenarios, and e2e scenario candidates.
- `DEPLOYMENT.md`: Cloudflare runtime, environment variables, D1 migrations, deploy commands, and Stream operations.
- `SMOKE_TEST.md`: automated smoke checks and manual admin/student smoke flows.
