# UI Package And Knip Cleanup Design

## Context

The app now uses Mantine v9 as its primary UI system, but the repo still contains Better-T-Stack starter shadcn-style UI scaffolding:

- `packages/ui` contains starter primitives and chat-oriented components.
- `apps/web` still imports a small set of `@prive-course/ui` primitives for auth forms, header menus, theme toggling, the Sonner wrapper, and global CSS.
- `packages/ui/src/styles/globals.css` imports `shadcn/tailwind.css` and defines shadcn-style token variables.
- shadcn config files still exist in `apps/web/components.json` and `packages/ui/components.json`.
- The repo has no Knip configuration yet.

This leaves unused components, dependencies, and project guidance that no longer match the intended stack.

## Decision

Migrate the remaining app UI usage away from `@prive-course/ui`, delete the starter UI package, and add Knip as a root monorepo hygiene tool.

The active UI direction is Mantine v9. Sonner remains the toast library, imported directly by the web app instead of through `packages/ui`.

## Migration Scope

Replace all remaining `@prive-course/ui` imports in `apps/web`:

- `apps/web/src/components/sign-in-form.tsx`: replace starter `Button`, `Input`, and `Label` with Mantine form controls and text components.
- `apps/web/src/components/sign-up-form.tsx`: replace starter `Button`, `Input`, and `Label` with Mantine form controls and text components.
- `apps/web/src/components/user-menu.tsx`: replace starter `Button`, `DropdownMenu`, and `Skeleton` with Mantine `Button`, `Menu`, `Skeleton`, and text primitives.
- `apps/web/src/components/mode-toggle.tsx`: replace starter `Button` and `DropdownMenu` with Mantine `ActionIcon` and `Menu`.
- `apps/web/src/routes/__root.tsx`: import `Toaster` directly from `sonner`.
- `apps/web/src/index.css`: own the web app's Tailwind/global CSS directly and stop importing `@prive-course/ui/globals.css`.

After the app no longer imports `@prive-course/ui`, remove:

- `packages/ui`.
- `apps/web/components.json`.
- Any `@prive-course/ui` alias from `apps/web/tsconfig.json`.
- `@prive-course/ui` from `apps/web/package.json`.
- shadcn/base-ui-only dependencies that become unused.

## Theme Scope

Remove `next-themes` if it is no longer needed after the Mantine migration.

Use Mantine's color scheme APIs for the mode toggle and keep the root `MantineProvider` as the source of UI color scheme behavior.

## Knip Scope

Add Knip as a root dev dependency and configure it for the whole monorepo.

The configuration should include legitimate entrypoints and project files for:

- root scripts and config files.
- `apps/web` Vite/TanStack Router source.
- `apps/server` Worker entrypoint and scripts.
- shared packages under `packages/*`.
- deployment and database config files.
- generated files that should be ignored, such as `apps/web/src/routeTree.gen.ts`, build output, Wrangler output, Alchemy output, and migrations where appropriate.

Knip findings should be handled by fixing real unused code/dependencies and by configuring only legitimate false positives.

## Documentation Scope

Update durable docs so they no longer describe `packages/ui` as part of the architecture:

- `AGENTS.md`: remove the `packages/ui` ownership entry and keep Mantine v9 as the UI rule.
- `README.md`: remove the shared UI package description and any remaining starter/shadcn guidance.

Historical design and plan docs under `docs/superpowers` do not need to be rewritten unless they interfere with Knip or current tooling.

## Out Of Scope

This cleanup does not change course/admin/student product behavior, API contracts, auth behavior, database schema, Cloudflare deployment topology, smoke test semantics, or the visual design beyond replacing equivalent starter controls with Mantine controls.

It does not add a new design system abstraction. Mantine should be used directly in app components.

## Success Criteria

- No current app code imports `@prive-course/ui`.
- No current app code or active config references shadcn.
- `packages/ui` is removed from the workspace.
- Root Knip configuration exists and is runnable through a package script.
- Knip reports no actionable unused files, exports, or dependencies for the configured monorepo.
- `vp run check` passes.
- `vp run test` passes.
- Docs describe Mantine v9 as the active UI system and no longer list `packages/ui` as an architectural package.
