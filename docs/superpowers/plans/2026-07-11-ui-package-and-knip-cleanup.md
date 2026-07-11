# UI Package And Knip Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the starter shadcn-style UI package, migrate remaining web UI usage to Mantine v9, and add Knip as a monorepo unused-code/dependency check.

**Architecture:** `apps/web` will own its global CSS and import Mantine/Sonner directly. `packages/ui` will be removed from the workspace once all `@prive-course/ui` imports are gone. Knip will run from the repo root with monorepo-aware project globs and ignores for generated/build artifacts.

**Tech Stack:** React, Vite, TanStack Router, TanStack Query, Mantine v9, Sonner, Tailwind CSS v4, pnpm workspaces, Vite+, Knip.

## Global Constraints

- Do not change course/admin/student product behavior, API contracts, auth behavior, database schema, Cloudflare deployment topology, smoke test semantics, or visual design beyond equivalent Mantine replacements.
- Do not add a new design-system abstraction.
- Use Mantine directly in app components.
- Remove `packages/ui`; do not leave an empty workspace package behind.
- Add Knip at the repo root and configure it for the whole monorepo.

---

## File Structure

- Modify: `apps/web/src/routes/__root.tsx` to remove the custom theme provider and import Sonner directly.
- Modify: `apps/web/src/index.css` to own web global CSS directly.
- Delete: `apps/web/src/components/theme-provider.tsx`.
- Modify: `apps/web/src/components/sign-in-form.tsx` to use Mantine controls.
- Modify: `apps/web/src/components/sign-up-form.tsx` to use Mantine controls.
- Modify: `apps/web/src/components/user-menu.tsx` to use Mantine menu/skeleton/button.
- Modify: `apps/web/src/components/mode-toggle.tsx` to use Mantine menu/action icon/color scheme.
- Delete: `packages/ui`.
- Delete: `apps/web/components.json`.
- Modify: `apps/web/package.json`, `apps/web/tsconfig.json`, `package.json`, and `pnpm-workspace.yaml` to remove stale UI dependencies and add Knip.
- Create: `knip.jsonc`.
- Modify: `README.md` and `AGENTS.md` to remove `packages/ui` architecture references.

### Task 1: Root Styling, Toasts, And Theme

**Files:**

- Modify: `apps/web/src/routes/__root.tsx`
- Modify: `apps/web/src/index.css`
- Delete: `apps/web/src/components/theme-provider.tsx`

**Interfaces:**

- Consumes: Mantine `MantineProvider` and Sonner `Toaster`.
- Produces: A web root with no `@prive-course/ui` or `next-themes` dependency.

- [ ] **Step 1: Update `apps/web/src/routes/__root.tsx`**

Replace the root route imports/provider structure with direct Mantine and Sonner usage:

```tsx
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

import Header from "@/components/header";
import type { trpc } from "@/utils/trpc";

import "../index.css";
```

Render:

```tsx
function RootComponent() {
  return (
    <>
      <HeadContent />
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
      </MantineProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
```

- [ ] **Step 2: Replace `apps/web/src/index.css`**

Use direct Tailwind/global CSS without importing `@prive-course/ui`:

```css
@import "tailwindcss";
@source "./**/*.{ts,tsx}";

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 3: Delete `apps/web/src/components/theme-provider.tsx`**

Remove the file because Mantine owns the color scheme after this task.

- [ ] **Step 4: Verify root task**

Run:

```sh
rg -n "@prive-course/ui|next-themes|theme-provider" apps/web/src
vp run --filter web check-types
```

Expected: `rg` finds only remaining component-level `@prive-course/ui` imports that later tasks will remove, and no `next-themes` or `theme-provider` matches. Type check may still fail if later tasks have not migrated imports; if it fails only on known remaining `@prive-course/ui` imports, continue to Task 2.

### Task 2: Auth Forms To Mantine

**Files:**

- Modify: `apps/web/src/components/sign-in-form.tsx`
- Modify: `apps/web/src/components/sign-up-form.tsx`

**Interfaces:**

- Consumes: existing TanStack Form validation and Better Auth submit flows.
- Produces: auth forms that use Mantine inputs/buttons/text and keep the same submit behavior.

- [ ] **Step 1: Update `sign-in-form.tsx` imports**

Replace starter UI imports with:

```tsx
import { Button, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
```

- [ ] **Step 2: Update `sign-in-form.tsx` JSX**

Use Mantine controls while keeping existing form handlers:

```tsx
return (
  <main className="mx-auto w-full mt-10 max-w-md p-6">
    <Stack gap="md">
      <Title order={1} ta="center">
        Welcome Back
      </Title>

      <Button type="button" fullWidth loading={isPasskeyPending} onClick={signInWithPasskey}>
        {isPasskeyPending ? "Waiting for passkey..." : "Sign in with passkey"}
      </Button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack gap="md">
          <form.Field name="email">
            {(field) => (
              <TextInput
                label="Email"
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <PasswordInput
                label="Password"
                id={field.name}
                name={field.name}
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" fullWidth loading={isSubmitting} disabled={!canSubmit}>
                Sign In
              </Button>
            )}
          </form.Subscribe>
        </Stack>
      </form>

      <Button variant="subtle" onClick={onSwitchToSignUp}>
        Need an account? Sign Up
      </Button>
    </Stack>
  </main>
);
```

- [ ] **Step 3: Update `sign-up-form.tsx` imports**

Replace starter UI imports with:

```tsx
import { Button, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
```

- [ ] **Step 4: Update `sign-up-form.tsx` JSX**

Use Mantine controls while preserving submit behavior:

```tsx
return (
  <main className="mx-auto w-full mt-10 max-w-md p-6">
    <Stack gap="md">
      <Title order={1} ta="center">
        Create Account
      </Title>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack gap="md">
          <form.Field name="name">
            {(field) => (
              <TextInput
                label="Name"
                id={field.name}
                name={field.name}
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
              />
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <TextInput
                label="Email"
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <PasswordInput
                label="Password"
                id={field.name}
                name={field.name}
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" fullWidth loading={isSubmitting} disabled={!canSubmit}>
                Sign Up
              </Button>
            )}
          </form.Subscribe>
        </Stack>
      </form>

      <Button variant="subtle" onClick={onSwitchToSignIn}>
        Already have an account? Sign In
      </Button>
    </Stack>
  </main>
);
```

- [ ] **Step 5: Verify auth form task**

Run:

```sh
rg -n "@prive-course/ui/components/(button|input|label)" apps/web/src/components/sign-in-form.tsx apps/web/src/components/sign-up-form.tsx
vp run --filter web check-types
```

Expected: `rg` exits with no matches. Type check may still fail only on remaining header/menu `@prive-course/ui` imports before Task 3.

### Task 3: Header Menus To Mantine

**Files:**

- Modify: `apps/web/src/components/user-menu.tsx`
- Modify: `apps/web/src/components/mode-toggle.tsx`

**Interfaces:**

- Consumes: Better Auth session/sign-out, TanStack navigation, Mantine color scheme APIs.
- Produces: header controls with no starter UI imports.

- [ ] **Step 1: Replace `user-menu.tsx`**

Use Mantine menu primitives:

```tsx
import { Button, Menu, Skeleton, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton height={36} width={96} />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button variant="outline">{session.user.name}</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>My Account</Menu.Label>
        <Menu.Item disabled>
          <Text size="sm" c="dimmed">
            {session.user.email}
          </Text>
        </Menu.Item>
        <Menu.Item onClick={() => navigate({ to: "/profile" })}>Profile</Menu.Item>
        <Menu.Item
          color="red"
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate({ to: "/" });
                },
              },
            });
          }}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
```

- [ ] **Step 2: Replace `mode-toggle.tsx`**

Use Mantine color scheme APIs:

```tsx
import { ActionIcon, Menu, Tooltip, useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label="Toggle color scheme">
          <ActionIcon aria-label="Toggle color scheme" size="lg" variant="outline">
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => setColorScheme("light")}>Light</Menu.Item>
        <Menu.Item onClick={() => setColorScheme("dark")}>Dark</Menu.Item>
        <Menu.Item onClick={() => setColorScheme("auto")}>System</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
```

- [ ] **Step 3: Verify header task**

Run:

```sh
rg -n "@prive-course/ui|next-themes|theme-provider" apps/web/src
vp run --filter web check-types
```

Expected: `rg` exits with no matches. Type check passes.

### Task 4: Remove UI Package And Stale Config

**Files:**

- Delete: `packages/ui`
- Delete: `apps/web/components.json`
- Modify: `apps/web/package.json`
- Modify: `apps/web/tsconfig.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Interfaces:**

- Consumes: all app imports migrated away from `@prive-course/ui`.
- Produces: no `packages/ui` workspace package and no active shadcn config.

- [ ] **Step 1: Remove `packages/ui` and `apps/web/components.json`**

Run:

```sh
rm -rf packages/ui apps/web/components.json
```

Expected: those paths are removed from the working tree.

- [ ] **Step 2: Update `apps/web/package.json`**

Remove:

```json
"@prive-course/ui": "workspace:*",
"next-themes": "catalog:"
```

Keep:

```json
"sonner": "catalog:"
```

- [ ] **Step 3: Update `apps/web/tsconfig.json`**

Remove the `@prive-course/ui/*` path alias from `compilerOptions.paths`.

- [ ] **Step 4: Update `pnpm-workspace.yaml` catalog**

Remove the `next-themes` catalog entry if no package still uses it.

- [ ] **Step 5: Update docs**

In `README.md`, remove shared UI package feature and project tree line. In `AGENTS.md`, remove the `packages/ui` repository layout entry.

- [ ] **Step 6: Verify package removal**

Run:

```sh
rg -n "@prive-course/ui|packages/ui|shadcn|next-themes|tw-animate-css|@base-ui|class-variance-authority|tailwind-merge" apps packages package.json pnpm-workspace.yaml README.md AGENTS.md --glob '!**/node_modules/**' --glob '!**/dist/**'
vp run check
```

Expected: `rg` has no active-code/config/doc matches except historical files under `docs/superpowers` if the command scope includes them. `vp run check` passes.

### Task 5: Add And Configure Knip

**Files:**

- Modify: `package.json`
- Create: `knip.jsonc`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: cleaned workspace without `packages/ui`.
- Produces: root `pnpm run knip` script and monorepo Knip configuration.

- [ ] **Step 1: Install Knip**

Run:

```sh
pnpm add -D knip -w
```

Expected: root `package.json` and `pnpm-lock.yaml` update with Knip.

- [ ] **Step 2: Add root script**

Add to root `package.json` scripts:

```json
"knip": "knip"
```

- [ ] **Step 3: Create `knip.jsonc`**

Use this starting configuration:

```jsonc
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "workspaces": {
    ".": {
      "entry": [
        "vite.config.ts",
        "scripts/**/*.mjs",
        "docs/superpowers/specs/**/*.md",
        "docs/superpowers/plans/**/*.md",
      ],
      "project": ["*.{js,ts,json,jsonc}", "scripts/**/*.{js,mjs,ts}"],
    },
    "apps/web": {
      "entry": ["src/main.tsx", "src/worker.ts", "src/routes/**/*.tsx", "vite.config.ts"],
      "project": ["src/**/*.{ts,tsx}", "*.config.{ts,js}", "package.json"],
      "ignore": ["src/routeTree.gen.ts", "dist/**", ".alchemy/**"],
    },
    "apps/server": {
      "entry": ["src/index.ts", "scripts/**/*.mjs", "wrangler.jsonc", "tsdown.config.ts"],
      "project": ["src/**/*.ts", "scripts/**/*.mjs", "*.config.ts", "package.json"],
      "ignore": ["dist/**", ".wrangler/**"],
    },
    "packages/api": {
      "entry": ["src/index.ts", "src/routers/**/*.test.ts"],
      "project": ["src/**/*.ts", "package.json"],
    },
    "packages/auth": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts", "package.json"],
    },
    "packages/config": {
      "entry": ["src/**/*.ts"],
      "project": ["src/**/*.ts", "package.json"],
    },
    "packages/db": {
      "entry": ["src/index.ts", "drizzle.config.ts"],
      "project": ["src/**/*.ts", "drizzle.config.ts", "package.json"],
      "ignore": ["src/migrations/**"],
    },
    "packages/env": {
      "entry": ["src/**/*.ts", "env.d.ts"],
      "project": ["src/**/*.ts", "env.d.ts", "package.json"],
    },
    "packages/infra": {
      "entry": ["alchemy.run.ts"],
      "project": ["*.ts", "package.json"],
      "ignore": [".alchemy/**"],
    },
  },
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.wrangler/**",
    "**/.alchemy/**",
    "apps/web/src/routeTree.gen.ts",
  ],
  "ignoreDependencies": [
    "@cloudflare/workers-types",
    "@types/node",
    "@types/react",
    "@types/react-dom",
  ],
}
```

- [ ] **Step 4: Run Knip and tune only legitimate false positives**

Run:

```sh
pnpm run knip
```

Expected: if Knip reports real unused files/dependencies, remove them. If it reports generated/config false positives, update `knip.jsonc` with the smallest explicit entry/ignore needed.

- [ ] **Step 5: Final verification**

Run:

```sh
pnpm run knip
vp run test
vp run check
rg -n "@prive-course/ui|packages/ui|shadcn|next-themes|tw-animate-css|@base-ui|class-variance-authority|tailwind-merge" apps packages package.json pnpm-workspace.yaml README.md AGENTS.md --glob '!**/node_modules/**' --glob '!**/dist/**'
```

Expected: Knip passes, tests pass, repo check passes, and `rg` has no active-code/config/doc matches.

- [ ] **Step 6: Commit**

Run:

```sh
git add .
git commit -m "chore: remove starter ui package and add knip"
```

Expected: commit succeeds.
