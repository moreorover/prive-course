# prive-course

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Hono, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Mantine v9** - Primary application UI components
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **workers** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **Cloudflare D1** - Database engine
- **Authentication** - Better-Auth
- **Vite+** - Unified Vite toolchain, workspace task runner, linting, and formatting

## Getting Started

First, install the dependencies:

```bash
vp install
```

## Database Setup

This project uses Cloudflare D1 (SQLite) with Drizzle ORM.

Runtime database access uses the Cloudflare `DB` binding from the root `alchemy.run.ts`. If a local `DATABASE_URL` is present, it is only for database tooling.

Alchemy provisions the D1 database and applies migrations during `dev` and `deploy`.

1. Generate migration files:

```bash
vp run db:generate
```

Then, run the development server:

```bash
vp run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Conventions

React web apps in this project use Mantine v9 as the primary UI system.

- Prefer Mantine components for new app UI.
- Change global styles in `apps/web/src/index.css`.
- Keep reusable app components in `apps/web/src/components`.
- Keep domain-specific UI in `apps/web/src/features`.

## Product Story Map

See [USER_STORIES.md](./USER_STORIES.md) for product behavior, roadmap stages,
runtime flows, acceptance scenarios, and e2e scenario candidates.

## Deployment

### Cloudflare via Alchemy

- Target: web + server
- Dev: vp run dev
- Deploy dev: vp run deploy
- Deploy prod: vp run deploy:prod
- Destroy dev: vp run destroy
- Destroy prod: vp run destroy:prod

For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy).

## Git Hooks and Formatting

- Optional native Vite+ hooks: `vp run hooks:setup`
- Docs: [Vite+ commit hooks](https://viteplus.dev/guide/commit-hooks)
- Run checks: `vp run check`

## Project Structure

```
prive-course/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, TRPC)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
├── alchemy.run.ts   # Cloudflare infrastructure for dev and prod
```

## Available Scripts

- `vp run dev`: Start all applications in development mode
- `vp run build`: Build all applications
- `vp run dev:web`: Start only the web application
- `vp run dev:server`: Start only the server
- `vp run check-types`: Check TypeScript types across all apps
- `vp run db:generate`: Generate database client/types
- `vp run check`: Run Vite+ format/lint checks and workspace TypeScript checks
- `vp run deploy`: Deploy the dev Cloudflare environment through Alchemy
- `vp run deploy:prod`: Deploy the prod Cloudflare environment through Alchemy
- `vp run knip`: Run unused files, exports, and dependency checks
- `vp run test`: Run workspace tests
- `vp run smoke:checklist`: Print the manual smoke-test checklist location
- `vp run lint`: Run Vite+ lint checks
- `vp run format`: Run Vite+ formatting
- `vp run staged`: Run Vite+ checks against staged files
- `vp run hooks:setup`: Install Vite+ native Git hooks with `vp config`
