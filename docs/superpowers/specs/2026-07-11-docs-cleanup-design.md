# Documentation Cleanup Design

## Context

`PLAN.md` currently mixes original planning notes, completed implementation history, stack decisions, security rules, validation commands, and remaining work. The project now has focused documents for current operations:

- `README.md` for human onboarding and basic project structure.
- `DEPLOYMENT.md` for Cloudflare runtime, environment, deployment, and Stream notes.
- `SMOKE_TEST.md` for automated and manual smoke coverage.
- `TODO.md` for deferred product and technical work.

Keeping `PLAN.md` as a living document would duplicate those focused docs and make stale guidance more likely.

## Decision

Retire `PLAN.md` from the working tree and replace its durable guidance with a root `AGENTS.md`.

The completed checklist, scaffold command, and historical implementation sequence remain available through git history. Current deferred work stays in `TODO.md`.

## `AGENTS.md` Scope

Create a root `AGENTS.md` as the durable contributor and agent guide. It should document:

- Stack: pnpm workspace, Vite+, React, TanStack Router, TanStack Query, Mantine, Hono, tRPC, Better Auth, Drizzle, Cloudflare D1, Alchemy, and Cloudflare Stream.
- Architecture: ownership boundaries for `apps/web`, `apps/server`, `packages/api`, `packages/auth`, `packages/db`, `packages/env`, `packages/infra`, and `packages/ui`.
- Frontend conventions: file-based routes under `apps/web/src/routes`, `_auth` route protection, route loaders preloading TanStack Query data, reusable components under `apps/web/src/components`, domain-specific UI under `apps/web/src/features`, and Mantine-first UI composition.
- API and security rules: backend authorization is authoritative, use `protectedProcedure` and `adminProcedure`, validate course access server-side, do not rely on frontend visibility for security, and use backend-issued signed Cloudflare Stream playback tokens.
- Database rules: schema lives in `packages/db/src/schema`, generated migrations live in `packages/db/src/migrations`, auth schema and course-domain schema stay separated, and schema changes require migration generation.
- Operations and validation: use the existing `vp` scripts, especially `vp run check`, `vp run test`, `vp run smoke`, `vp run smoke:production`, and `vp exec react-doctor --no-telemetry -y --verbose` when changes warrant it.
- Documentation boundaries: keep `README.md`, `DEPLOYMENT.md`, `SMOKE_TEST.md`, and `TODO.md` focused on their current responsibilities.

## Out of Scope

This cleanup does not change application code, routes, schemas, tests, deployment configuration, smoke flows, or deferred product scope.

It also does not rewrite the existing focused docs unless a broken reference to `PLAN.md` is found during implementation.

## Implementation Shape

1. Add root `AGENTS.md` with concise, current project guidance.
2. Delete `PLAN.md`.
3. Search for references to `PLAN.md` and remove or update only direct references if any exist.
4. Verify with `git status --short` and a targeted text search.

## Success Criteria

- `PLAN.md` is no longer present in the working tree.
- Root `AGENTS.md` exists and accurately reflects the current stack, architecture, conventions, security model, database workflow, validation commands, and documentation boundaries.
- No remaining tracked document points contributors to `PLAN.md`.
- Existing focused docs keep their current responsibilities.
