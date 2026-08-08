# Product Atelier Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every visible Prive Course app page into a cohesive Product Atelier UI using Mantine plus plain CSS, without changing routes, backend contracts, or authorization behavior.

**Architecture:** First create the shared visual system, then migrate public/student pages, auth/profile pages, and admin pages onto it. Shared primitives live in `apps/web/src/components/ui`, domain-specific wrappers stay near their domains, and route files become composition layers over reusable components.

**Tech Stack:** React, Vite, TanStack Router, TanStack Query, Mantine, plain CSS variables/classes, lucide-react, Sonner, Better Auth, tRPC.

## Global Constraints

- Do not build the redesign with Tailwind utilities. Use Mantine components plus plain CSS variables and component classes.
- Preserve all existing route slugs and primary route purposes.
- Preserve backend authorization behavior and do not rely on UI visibility for authorization.
- Preserve mutation invalidation behavior except where a task explicitly tightens the same query key.
- Preserve Stream playback token enforcement and lesson playback behavior.
- Use Mantine as the UI base and plain CSS variables/classes for the app shell and brand layer.
- Keep `lucide-react` because it is already installed.
- Do not add Motion, GSAP, or any new animation dependency.
- Keep motion to CSS hover, active, focus, and reduced-motion-aware transitions.
- Use one accent system, one radius system, and one coherent light/dark theme token system.
- Do not introduce em-dash or en-dash characters in visible copy.
- Do not add fake screenshots, decorative status dots, section numbering, or decorative body gradients on operational surfaces.
- Run `vp run check`, `vp run test`, `vp exec react-doctor --no-telemetry -y --verbose`, and `vp run smoke` before considering the implementation complete.

---

## File Structure

Create:

- `apps/web/src/components/ui/page-shell.tsx`: page width, page tone, and vertical rhythm wrapper.
- `apps/web/src/components/ui/page-header.tsx`: consistent title, description, back link, actions, and optional metadata.
- `apps/web/src/components/ui/surface.tsx`: Mantine `Paper` wrapper with shared variants and padding.
- `apps/web/src/components/ui/status-badge.tsx`: semantic status badge mapping.
- `apps/web/src/components/ui/course-card.tsx`: public/student course summary card.
- `apps/web/src/components/ui/lesson-row.tsx`: shared lesson row for outlines and navigation surfaces.
- `apps/web/src/components/ui/data-table-shell.tsx`: admin table panel with title, toolbar, empty state, and scroll handling.
- `apps/web/src/components/ui/form-section.tsx`: shared form panel wrapper.
- `apps/web/src/components/ui/index.ts`: barrel export for UI primitives.

Modify:

- `apps/web/src/index.css`: replace homepage-specific and utility-dependent styles with Product Atelier tokens and component classes.
- `apps/web/src/routes/__root.tsx`: update Mantine theme tokens, radius defaults, and app root sizing.
- `apps/web/src/components/header.tsx`: rebuild shared header without Tailwind utilities.
- `apps/web/src/components/empty-state.tsx`: migrate to `Surface`.
- `apps/web/src/components/loader.tsx`: remove Tailwind utilities and use product CSS classes.
- `apps/web/src/components/course-form.tsx`: wrap in `FormSection`.
- `apps/web/src/components/lesson-form.tsx`: wrap in `FormSection`.
- `apps/web/src/components/sign-in-form.tsx`: wrap in `FormSection`/`Surface`.
- `apps/web/src/components/sign-up-form.tsx`: wrap in `FormSection`/`Surface`.
- `apps/web/src/features/course/lesson-navigation.tsx`: use `LessonRow` and Product Atelier classes.
- `apps/web/src/features/course/lesson-player-ui.tsx`: align player chrome with Product Atelier tokens.
- `apps/web/src/features/course/lesson-player.tsx`: preserve playback behavior while adopting player page surfaces where needed.
- `apps/web/src/features/profile/*`: align account, password, passkey, and session sections with shared surfaces.
- `apps/web/src/features/admin/video-upload-panel.tsx`: align upload states with shared surfaces and badges.
- `apps/web/src/routes/index.tsx`: rebuild public home with shared course cards and form section.
- `apps/web/src/routes/courses/index.tsx`: rebuild catalog with `PageShell`, `PageHeader`, and `CourseCard`.
- `apps/web/src/routes/courses/$courseSlug/index.tsx`: rebuild detail page with access panel and `LessonRow`.
- `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`: rebuild lesson player layout.
- `apps/web/src/routes/login.tsx`: use `PageShell narrow`.
- `apps/web/src/routes/_auth/profile.tsx`: use `PageShell` and `PageHeader`.
- `apps/web/src/routes/_auth/admin/index.tsx`: use `PageShell wide`, `PageHeader`, and `DataTableShell`.
- `apps/web/src/routes/_auth/admin/courses/new.tsx`: align create form page.
- `apps/web/src/routes/_auth/admin/courses/$courseId/index.tsx`: align edit form and lessons table.
- `apps/web/src/routes/_auth/admin/courses/$courseId/access.tsx`: align access management tables.
- `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/new.tsx`: align lesson create page.
- `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/$lessonId.tsx`: align lesson edit page.

Do not modify generated `apps/web/src/routeTree.gen.ts` by hand.

---

### Task 1: Product Atelier Tokens And App Root

**Files:**

- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/routes/__root.tsx`
- Modify: `apps/web/src/components/header.tsx`
- Modify: `apps/web/src/components/loader.tsx`

**Interfaces:**

- Consumes: existing Mantine provider and global CSS entrypoint.
- Produces: global CSS classes used by later tasks:
  - `.pc-app-root`
  - `.pc-header`
  - `.pc-header__inner`
  - `.pc-brand`
  - `.pc-brand__mark`
  - `.pc-brand__text`
  - `.pc-nav`
  - `.pc-nav__link`
  - `.pc-actions`
  - `.pc-loader`

- [ ] **Step 1: Replace global tokens and app utility classes**

  In `apps/web/src/index.css`, replace the current `body`, token, header, academy, and Tailwind-dependent utility rules with the Product Atelier foundation below. Keep `@import "tailwindcss";` and `@source` unchanged for now so the existing build remains stable until all utility classes are removed.

  ```css
  @import "tailwindcss";
  @source "./**/*.{ts,tsx}";

  html,
  body,
  #app {
    min-height: 100%;
  }

  body {
    margin: 0;
    color: var(--pc-text);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    background: var(--pc-bg);
  }

  [data-mantine-color-scheme="light"] {
    --pc-bg: #f6f4ef;
    --pc-bg-subtle: #eee9df;
    --pc-surface: #fffdf8;
    --pc-surface-raised: #ffffff;
    --pc-border: #ded7ca;
    --pc-border-strong: #b9ae9e;
    --pc-text: #23211d;
    --pc-text-muted: #6f685f;
    --pc-accent: #7f4f3b;
    --pc-accent-soft: #efe1d8;
    --pc-success: #3f6f58;
    --pc-success-soft: #dfede5;
    --pc-warning: #8b6a24;
    --pc-warning-soft: #f2e8c9;
    --pc-danger: #a33f3f;
    --pc-danger-soft: #f3dddd;
    --pc-shadow-soft: 0 18px 48px rgb(57 45 31 / 10%);
  }

  [data-mantine-color-scheme="dark"] {
    --pc-bg: #171612;
    --pc-bg-subtle: #211f1a;
    --pc-surface: #201f1a;
    --pc-surface-raised: #28251f;
    --pc-border: #3b372f;
    --pc-border-strong: #5c5649;
    --pc-text: #f7f2e9;
    --pc-text-muted: #beb4a6;
    --pc-accent: #d09a7e;
    --pc-accent-soft: #3a2a22;
    --pc-success: #8ec4a5;
    --pc-success-soft: #22362b;
    --pc-warning: #d9bc6c;
    --pc-warning-soft: #3c3219;
    --pc-danger: #e08a8a;
    --pc-danger-soft: #402323;
    --pc-shadow-soft: 0 18px 48px rgb(0 0 0 / 26%);
  }

  ::selection {
    color: var(--pc-surface);
    background: var(--pc-accent);
  }

  a {
    color: inherit;
    text-decoration-color: color-mix(in srgb, var(--pc-accent) 56%, transparent);
    text-underline-offset: 0.18em;
  }

  a:hover {
    text-decoration-color: var(--pc-accent);
  }

  :focus-visible {
    outline: 2px solid var(--pc-accent);
    outline-offset: 3px;
  }

  .pc-app-root {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr;
    background: var(--pc-bg);
  }

  .pc-header {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid color-mix(in srgb, var(--pc-border) 82%, transparent);
    background: color-mix(in srgb, var(--pc-bg) 90%, transparent);
    backdrop-filter: blur(14px);
  }

  .pc-header__inner {
    width: min(100% - 2rem, 76rem);
    min-height: 4.25rem;
    margin-inline: auto;
    display: grid;
    grid-template-columns: minmax(13rem, 1fr) auto minmax(13rem, 1fr);
    align-items: center;
    gap: 1rem;
  }

  .pc-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    width: fit-content;
    text-decoration: none;
  }

  .pc-brand__mark {
    width: 2.25rem;
    height: 2.25rem;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: var(--pc-surface);
    background: var(--pc-text);
    font-weight: 850;
    letter-spacing: 0;
  }

  .pc-brand__text {
    display: grid;
    gap: 0.05rem;
  }

  .pc-nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }

  .pc-nav__link {
    min-height: 2.25rem;
    padding: 0 0.75rem;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    color: var(--pc-text-muted);
    font-size: 0.9rem;
    font-weight: 680;
    text-decoration: none;
    transition:
      color 140ms ease,
      background 140ms ease;
  }

  .pc-nav__link:hover,
  .pc-nav__link[aria-current="page"] {
    color: var(--pc-text);
    background: var(--pc-accent-soft);
  }

  .pc-actions {
    justify-self: end;
  }

  .pc-loader {
    min-height: 14rem;
    display: grid;
    place-items: center;
    color: var(--pc-text-muted);
  }

  @media (max-width: 48rem) {
    .pc-header__inner {
      width: min(100% - 1rem, 76rem);
      grid-template-columns: 1fr auto;
      padding-block: 0.75rem;
    }

    .pc-nav {
      grid-column: 1 / -1;
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 0.15rem;
    }

    .pc-actions {
      justify-self: end;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
  ```

- [ ] **Step 2: Update Mantine theme**

  In `apps/web/src/routes/__root.tsx`, update `theme` to remove the duplicated `gold` palette and set radius defaults to the Product Atelier scale:

  ```tsx
  const theme = createTheme({
    defaultRadius: "sm",
    primaryColor: "atelier",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    headings: {
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontWeight: "760",
    },
    colors: {
      atelier: [
        "#f8eee7",
        "#ecd9cd",
        "#d9b79f",
        "#c99474",
        "#b77856",
        "#7f4f3b",
        "#6c4030",
        "#553126",
        "#3b211a",
        "#24130f",
      ],
    },
    components: {
      Button: {
        defaultProps: {
          radius: "sm",
        },
      },
      Paper: {
        defaultProps: {
          radius: "md",
        },
      },
      TextInput: {
        defaultProps: {
          radius: "sm",
        },
      },
      PasswordInput: {
        defaultProps: {
          radius: "sm",
        },
      },
      Textarea: {
        defaultProps: {
          radius: "sm",
        },
      },
      Select: {
        defaultProps: {
          radius: "sm",
        },
      },
    },
  });
  ```

- [ ] **Step 3: Replace root utility classes**

  In `RootComponent`, replace:

  ```tsx
  <div className="grid grid-rows-[auto_1fr] h-svh">
  ```

  with:

  ```tsx
  <div className="pc-app-root">
  ```

- [ ] **Step 4: Rebuild header with semantic links**

  In `apps/web/src/components/header.tsx`, remove `Box` and route button wrappers. Use `Link` anchors styled by `.pc-nav__link`.

  ```tsx
  import { Group, Text } from "@mantine/core";
  import { Link } from "@tanstack/react-router";

  import { authClient } from "@/lib/auth-client";

  import { ModeToggle } from "./mode-toggle";
  import UserMenu from "./user-menu";

  export default function Header() {
    const { data: session } = authClient.useSession();
    const links = [
      { to: "/", label: "Home" },
      { to: "/courses", label: "Courses" },
      ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
    ] as const;

    return (
      <header className="pc-header">
        <div className="pc-header__inner">
          <Link to="/" className="pc-brand">
            <span className="pc-brand__mark">P</span>
            <span className="pc-brand__text">
              <Text fw={850} lh={1}>
                priauginimas.lt
              </Text>
              <Text size="xs" c="dimmed">
                Private course studio
              </Text>
            </span>
          </Link>

          <nav className="pc-nav" aria-label="Main navigation">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="pc-nav__link"
                activeProps={{ "aria-current": "page" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Group gap="xs" wrap="nowrap" className="pc-actions">
            <ModeToggle />
            <UserMenu />
          </Group>
        </div>
      </header>
    );
  }
  ```

- [ ] **Step 5: Replace loader utility classes**

  In `apps/web/src/components/loader.tsx`, replace the wrapper with `.pc-loader`:

  ```tsx
  import { Loader2 } from "lucide-react";

  export default function Loader() {
    return (
      <div className="pc-loader">
        <Loader2 className="pc-loader__icon" aria-hidden="true" />
      </div>
    );
  }
  ```

  Add to `index.css`:

  ```css
  .pc-loader__icon {
    animation: pc-spin 900ms linear infinite;
  }

  @keyframes pc-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pc-loader__icon {
      animation: none;
    }
  }
  ```

- [ ] **Step 6: Run verification**

  Run:

  ```bash
  vp run --filter web check-types
  ```

  Expected: PASS. If the generated route tree is rewritten by build tooling, inspect it and do not hand-edit it.

- [ ] **Step 7: Commit**

  ```bash
  git add apps/web/src/index.css apps/web/src/routes/__root.tsx apps/web/src/components/header.tsx apps/web/src/components/loader.tsx
  git commit -m "feat: establish product atelier shell"
  ```

---

### Task 2: Shared Product UI Primitives

**Files:**

- Create: `apps/web/src/components/ui/page-shell.tsx`
- Create: `apps/web/src/components/ui/page-header.tsx`
- Create: `apps/web/src/components/ui/surface.tsx`
- Create: `apps/web/src/components/ui/status-badge.tsx`
- Create: `apps/web/src/components/ui/data-table-shell.tsx`
- Create: `apps/web/src/components/ui/form-section.tsx`
- Create: `apps/web/src/components/ui/index.ts`
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/components/empty-state.tsx`

**Interfaces:**

- Consumes: global classes from Task 1.
- Produces:
  - `PageShell({ size, tone, children }: PageShellProps)`
  - `PageHeader({ title, description, eyebrow, backTo, actions, meta }: PageHeaderProps)`
  - `Surface({ variant, padding, interactive, className, children, ...paperProps }: SurfaceProps)`
  - `StatusBadge({ status }: { status: ProductStatus })`
  - `DataTableShell({ title, description, actions, empty, children }: DataTableShellProps)`
  - `FormSection({ title, description, actions, children }: FormSectionProps)`

- [ ] **Step 1: Add shared layout CSS**

  Append these classes to `apps/web/src/index.css`:

  ```css
  .pc-page-shell {
    width: min(100% - 2rem, 72rem);
    margin-inline: auto;
    padding-block: clamp(1.5rem, 4vw, 3.25rem);
  }

  .pc-page-shell--narrow {
    width: min(100% - 2rem, 30rem);
  }

  .pc-page-shell--wide {
    width: min(100% - 2rem, 82rem);
  }

  .pc-page-shell--full {
    width: min(100% - 1.5rem, 94rem);
  }

  .pc-page-shell--player {
    width: min(100% - 1.5rem, 96rem);
    padding-block: clamp(1rem, 3vw, 2rem);
  }

  .pc-page-header {
    display: grid;
    gap: 1rem;
    margin-bottom: clamp(1.25rem, 3vw, 2rem);
  }

  .pc-page-header__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .pc-page-header__content {
    display: grid;
    gap: 0.45rem;
    max-width: 48rem;
  }

  .pc-page-header__eyebrow {
    color: var(--pc-text-muted);
    font-size: 0.76rem;
    font-weight: 780;
  }

  .pc-page-header__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .pc-page-header__meta {
    color: var(--pc-text-muted);
  }

  .pc-surface {
    border: 1px solid var(--pc-border);
    background: var(--pc-surface);
    color: var(--pc-text);
  }

  .pc-surface--raised {
    background: var(--pc-surface-raised);
    box-shadow: var(--pc-shadow-soft);
  }

  .pc-surface--subtle {
    background: var(--pc-bg-subtle);
  }

  .pc-surface--accent {
    border-color: color-mix(in srgb, var(--pc-accent) 38%, var(--pc-border));
    background: var(--pc-accent-soft);
  }

  .pc-surface--danger {
    border-color: color-mix(in srgb, var(--pc-danger) 42%, var(--pc-border));
    background: var(--pc-danger-soft);
  }

  .pc-surface--interactive {
    transition:
      transform 140ms ease,
      border-color 140ms ease,
      box-shadow 140ms ease;
  }

  .pc-surface--interactive:hover {
    border-color: color-mix(in srgb, var(--pc-accent) 48%, var(--pc-border));
    box-shadow: var(--pc-shadow-soft);
    transform: translateY(-1px);
  }

  .pc-table-shell {
    display: grid;
    gap: 1rem;
  }

  .pc-table-shell__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }

  .pc-table-shell__title {
    display: grid;
    gap: 0.2rem;
  }

  .pc-table-shell__scroll {
    overflow-x: auto;
  }

  .pc-form-section {
    display: grid;
    gap: 1.25rem;
  }

  .pc-form-section__header {
    display: grid;
    gap: 0.3rem;
  }

  .pc-empty-state {
    display: grid;
    justify-items: center;
    gap: 0.55rem;
    padding: clamp(1.5rem, 4vw, 2.5rem);
    text-align: center;
  }

  @media (max-width: 48rem) {
    .pc-page-header__top,
    .pc-table-shell__header {
      align-items: stretch;
      flex-direction: column;
    }

    .pc-page-header__actions {
      justify-content: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pc-surface--interactive:hover {
      transform: none;
    }
  }
  ```

- [ ] **Step 2: Create `Surface`**

  ```tsx
  import { Paper, type PaperProps } from "@mantine/core";
  import type { ReactNode } from "react";

  export type SurfaceVariant = "default" | "raised" | "subtle" | "accent" | "danger";
  export type SurfacePadding = "sm" | "md" | "lg" | "xl";

  export type SurfaceProps = PaperProps & {
    children: ReactNode;
    className?: string;
    interactive?: boolean;
    padding?: SurfacePadding;
    variant?: SurfaceVariant;
  };

  const paddingMap: Record<SurfacePadding, PaperProps["p"]> = {
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
  };

  export function Surface({
    children,
    className,
    interactive = false,
    padding = "lg",
    variant = "default",
    ...props
  }: SurfaceProps) {
    const classes = [
      "pc-surface",
      variant !== "default" ? `pc-surface--${variant}` : "",
      interactive ? "pc-surface--interactive" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Paper withBorder p={paddingMap[padding]} className={classes} {...props}>
        {children}
      </Paper>
    );
  }
  ```

- [ ] **Step 3: Create `PageShell`**

  ```tsx
  import type { ReactNode } from "react";

  export type PageShellSize = "narrow" | "default" | "wide" | "full";
  export type PageShellTone = "default" | "quiet" | "player";

  export type PageShellProps = {
    children: ReactNode;
    size?: PageShellSize;
    tone?: PageShellTone;
  };

  export function PageShell({ children, size = "default", tone = "default" }: PageShellProps) {
    const classes = [
      "pc-page-shell",
      size !== "default" ? `pc-page-shell--${size}` : "",
      tone !== "default" ? `pc-page-shell--${tone}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return <main className={classes}>{children}</main>;
  }
  ```

- [ ] **Step 4: Create `PageHeader`**

  ```tsx
  import { Button, Group, Stack, Text, Title } from "@mantine/core";
  import { Link } from "@tanstack/react-router";
  import { ArrowLeft } from "lucide-react";
  import type { ReactNode } from "react";

  type BackLink = {
    label?: string;
    params?: Record<string, string>;
    to: string;
  };

  export type PageHeaderProps = {
    actions?: ReactNode;
    backTo?: BackLink;
    description?: ReactNode;
    eyebrow?: string;
    meta?: ReactNode;
    title: ReactNode;
  };

  export function PageHeader({
    actions,
    backTo,
    description,
    eyebrow,
    meta,
    title,
  }: PageHeaderProps) {
    return (
      <header className="pc-page-header">
        <div className="pc-page-header__top">
          <Stack gap="xs">
            {backTo ? (
              <Link to={backTo.to} params={backTo.params}>
                <Button variant="subtle" leftSection={<ArrowLeft size={16} />}>
                  {backTo.label ?? "Back"}
                </Button>
              </Link>
            ) : null}
            <div className="pc-page-header__content">
              {eyebrow ? <Text className="pc-page-header__eyebrow">{eyebrow}</Text> : null}
              <Title order={1}>{title}</Title>
              {description ? <Text c="dimmed">{description}</Text> : null}
              {meta ? <Group className="pc-page-header__meta">{meta}</Group> : null}
            </div>
          </Stack>
          {actions ? <div className="pc-page-header__actions">{actions}</div> : null}
        </div>
      </header>
    );
  }
  ```

  During implementation, if TypeScript rejects the generic `Link` `to` type, change `BackLink["to"]` to the inferred TanStack type used elsewhere in the repo instead of using `any`.

- [ ] **Step 5: Create `StatusBadge`**

  ```tsx
  import { Badge, type BadgeProps } from "@mantine/core";

  export type ProductStatus =
    | "published"
    | "draft"
    | "archived"
    | "free"
    | "included"
    | "locked"
    | "accessGranted"
    | "preview"
    | "admin"
    | "student";

  const statusConfig: Record<
    ProductStatus,
    { color: BadgeProps["color"]; label: string; variant: BadgeProps["variant"] }
  > = {
    accessGranted: { color: "green", label: "Access granted", variant: "light" },
    admin: { color: "atelier", label: "Admin", variant: "light" },
    archived: { color: "gray", label: "Archived", variant: "light" },
    draft: { color: "yellow", label: "Draft", variant: "light" },
    free: { color: "atelier", label: "Free preview", variant: "light" },
    included: { color: "green", label: "Included", variant: "light" },
    locked: { color: "gray", label: "Locked", variant: "light" },
    preview: { color: "yellow", label: "Preview available", variant: "light" },
    published: { color: "green", label: "Published", variant: "light" },
    student: { color: "gray", label: "Student", variant: "light" },
  };

  export function StatusBadge({ status }: { status: ProductStatus }) {
    const config = statusConfig[status];
    return (
      <Badge color={config.color} variant={config.variant}>
        {config.label}
      </Badge>
    );
  }
  ```

- [ ] **Step 6: Create `DataTableShell` and `FormSection`**

  ```tsx
  import { Stack, Text, Title } from "@mantine/core";
  import type { ReactNode } from "react";

  import { Surface } from "./surface";

  export type DataTableShellProps = {
    actions?: ReactNode;
    children: ReactNode;
    description?: ReactNode;
    empty?: ReactNode;
    title: ReactNode;
  };

  export function DataTableShell({
    actions,
    children,
    description,
    empty,
    title,
  }: DataTableShellProps) {
    return (
      <Surface className="pc-table-shell">
        <div className="pc-table-shell__header">
          <div className="pc-table-shell__title">
            <Title order={2} size="h4">
              {title}
            </Title>
            {description ? <Text c="dimmed">{description}</Text> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
        {empty ?? <div className="pc-table-shell__scroll">{children}</div>}
      </Surface>
    );
  }
  ```

  ```tsx
  import { Text, Title } from "@mantine/core";
  import type { ReactNode } from "react";

  import { Surface } from "./surface";

  export type FormSectionProps = {
    actions?: ReactNode;
    children: ReactNode;
    description?: ReactNode;
    title: ReactNode;
  };

  export function FormSection({ actions, children, description, title }: FormSectionProps) {
    return (
      <Surface className="pc-form-section" variant="raised">
        <div className="pc-form-section__header">
          <Title order={1} size="h3">
            {title}
          </Title>
          {description ? <Text c="dimmed">{description}</Text> : null}
        </div>
        {children}
        {actions ? <div>{actions}</div> : null}
      </Surface>
    );
  }
  ```

- [ ] **Step 7: Create barrel exports**

  ```tsx
  export * from "./data-table-shell";
  export * from "./form-section";
  export * from "./page-header";
  export * from "./page-shell";
  export * from "./status-badge";
  export * from "./surface";
  ```

- [ ] **Step 8: Migrate `EmptyState`**

  Replace `apps/web/src/components/empty-state.tsx` with:

  ```tsx
  import { Stack, Text, Title } from "@mantine/core";
  import type { ReactNode } from "react";

  import { Surface } from "@/components/ui";

  export function EmptyState({
    title,
    description,
    action,
  }: {
    action?: ReactNode;
    description: string;
    title: string;
  }) {
    return (
      <Surface padding="xl">
        <Stack gap="xs" align="center" ta="center" className="pc-empty-state">
          <Title order={2} size="h4">
            {title}
          </Title>
          <Text c="dimmed" maw={520}>
            {description}
          </Text>
          {action ? <div>{action}</div> : null}
        </Stack>
      </Surface>
    );
  }
  ```

- [ ] **Step 9: Run verification**

  Run:

  ```bash
  vp run --filter web check-types
  ```

  Expected: PASS.

- [ ] **Step 10: Commit**

  ```bash
  git add apps/web/src/components/ui apps/web/src/components/empty-state.tsx apps/web/src/index.css
  git commit -m "feat: add product atelier primitives"
  ```

---

### Task 3: Course And Lesson Shared Components

**Files:**

- Create: `apps/web/src/components/ui/course-card.tsx`
- Create: `apps/web/src/components/ui/lesson-row.tsx`
- Modify: `apps/web/src/components/ui/index.ts`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: `Surface`, `StatusBadge`.
- Produces:
  - `CourseCard({ title, description, href, params, variant, meta, actionLabel }: CourseCardProps)`
  - `LessonRow({ title, meta, position, status, href, params, icon, action }: LessonRowProps)`

- [ ] **Step 1: Add card and row CSS**

  Append:

  ```css
  .pc-course-card {
    height: 100%;
    display: grid;
    gap: 1rem;
  }

  .pc-course-card__body {
    display: grid;
    gap: 0.55rem;
  }

  .pc-course-card__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .pc-course-card__action {
    align-self: end;
  }

  .pc-course-card--featured {
    min-height: 22rem;
  }

  .pc-lesson-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }

  .pc-lesson-row__position {
    min-width: 2.25rem;
    color: var(--pc-text-muted);
    font-variant-numeric: tabular-nums;
    font-weight: 780;
  }

  .pc-lesson-row__content {
    min-width: 0;
    display: grid;
    gap: 0.15rem;
  }

  .pc-lesson-row__meta {
    color: var(--pc-text-muted);
    font-size: 0.9rem;
  }

  .pc-lesson-row--locked {
    background: color-mix(in srgb, var(--pc-bg-subtle) 70%, transparent);
  }

  @media (max-width: 40rem) {
    .pc-lesson-row {
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
    }

    .pc-lesson-row__position {
      min-width: 0;
    }
  }
  ```

- [ ] **Step 2: Create `CourseCard`**

  ```tsx
  import { Button, Group, Stack, Text, Title } from "@mantine/core";
  import { Link } from "@tanstack/react-router";
  import { ArrowRight } from "lucide-react";
  import type { ReactNode } from "react";

  import { Surface } from "./surface";

  export type CourseCardVariant = "featured" | "standard" | "compact";

  export type CourseCardProps = {
    actionLabel?: string;
    description?: string | null;
    href: string;
    meta?: ReactNode;
    params?: Record<string, string>;
    title: string;
    variant?: CourseCardVariant;
  };

  export function CourseCard({
    actionLabel = "View course",
    description,
    href,
    meta,
    params,
    title,
    variant = "standard",
  }: CourseCardProps) {
    return (
      <Surface
        interactive
        padding={variant === "compact" ? "md" : "xl"}
        className={`pc-course-card pc-course-card--${variant}`}
      >
        <Stack gap="md" h="100%">
          {meta ? <Group className="pc-course-card__meta">{meta}</Group> : null}
          <div className="pc-course-card__body">
            <Title order={variant === "featured" ? 2 : 3}>{title}</Title>
            <Text c="dimmed" lineClamp={variant === "compact" ? 2 : 4}>
              {description || "Course details will be added soon."}
            </Text>
          </div>
          <Link to={href} params={params} className="pc-course-card__action">
            <Button
              fullWidth={variant !== "compact"}
              variant={variant === "featured" ? "filled" : "light"}
              rightSection={<ArrowRight size={16} />}
            >
              {actionLabel}
            </Button>
          </Link>
        </Stack>
      </Surface>
    );
  }
  ```

  During implementation, if TanStack route typing rejects generic `href`, narrow `href` to the route union used by the call sites and avoid `any`.

- [ ] **Step 3: Create `LessonRow`**

  ```tsx
  import { Group, Text, ThemeIcon } from "@mantine/core";
  import { Link } from "@tanstack/react-router";
  import { Lock, PlayCircle } from "lucide-react";
  import type { ReactNode } from "react";

  import { StatusBadge, type ProductStatus } from "./status-badge";
  import { Surface } from "./surface";

  export type LessonRowProps = {
    action?: ReactNode;
    href?: string;
    meta?: ReactNode;
    params?: Record<string, string>;
    position: number;
    status: ProductStatus;
    title: string;
  };

  export function LessonRow({
    action,
    href,
    meta,
    params,
    position,
    status,
    title,
  }: LessonRowProps) {
    const canOpen = Boolean(href);
    const row = (
      <Surface
        interactive={canOpen}
        padding="md"
        className={`pc-lesson-row ${status === "locked" ? "pc-lesson-row--locked" : ""}`}
      >
        <span className="pc-lesson-row__position">{String(position).padStart(2, "0")}</span>
        <Group gap="md" wrap="nowrap">
          <ThemeIcon color={canOpen ? "atelier" : "gray"} variant="light">
            {canOpen ? <PlayCircle size={18} /> : <Lock size={18} />}
          </ThemeIcon>
          <div className="pc-lesson-row__content">
            <Text fw={740}>{title}</Text>
            {meta ? <Text className="pc-lesson-row__meta">{meta}</Text> : null}
          </div>
        </Group>
        {action ?? <StatusBadge status={status} />}
      </Surface>
    );

    return href ? (
      <Link to={href} params={params} className="pc-lesson-row">
        {row}
      </Link>
    ) : (
      <div className="pc-lesson-row">{row}</div>
    );
  }
  ```

- [ ] **Step 4: Export new components**

  Add to `apps/web/src/components/ui/index.ts`:

  ```tsx
  export * from "./course-card";
  export * from "./lesson-row";
  ```

- [ ] **Step 5: Run verification**

  Run:

  ```bash
  vp run --filter web check-types
  ```

  Expected: PASS.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/components/ui/course-card.tsx apps/web/src/components/ui/lesson-row.tsx apps/web/src/components/ui/index.ts apps/web/src/index.css
  git commit -m "feat: add product course and lesson components"
  ```

---

### Task 4: Public And Student Pages

**Files:**

- Modify: `apps/web/src/routes/index.tsx`
- Modify: `apps/web/src/routes/courses/index.tsx`
- Modify: `apps/web/src/routes/courses/$courseSlug/index.tsx`
- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`
- Modify: `apps/web/src/features/course/lesson-navigation.tsx`
- Modify: `apps/web/src/features/course/lesson-player-ui.tsx`
- Modify: `apps/web/src/features/course/lesson-player.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: `PageShell`, `PageHeader`, `Surface`, `CourseCard`, `LessonRow`, `StatusBadge`.
- Produces: public/student routes with no `pc-academy-*`, `pc-page`, `pc-page-narrow`, or Tailwind utility class dependencies.

- [ ] **Step 1: Add student page CSS**

  Append:

  ```css
  .pc-home-layout {
    display: grid;
    gap: clamp(2rem, 5vw, 4rem);
  }

  .pc-home-hero {
    min-height: min(40rem, calc(100dvh - 5rem));
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(19rem, 0.95fr);
    gap: clamp(1.5rem, 5vw, 4rem);
    align-items: center;
  }

  .pc-home-hero__copy {
    display: grid;
    gap: 1.25rem;
  }

  .pc-home-hero__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .pc-course-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .pc-detail-layout,
  .pc-lesson-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(17rem, 21rem);
    gap: 1.5rem;
    align-items: start;
  }

  .pc-lesson-list {
    display: grid;
    gap: 0.75rem;
  }

  .pc-player-surface {
    overflow: hidden;
    background: color-mix(in srgb, var(--pc-text) 88%, var(--pc-bg));
  }

  .pc-player-stack {
    display: grid;
    gap: 1rem;
  }

  @media (max-width: 64rem) {
    .pc-home-hero,
    .pc-detail-layout,
    .pc-lesson-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 48rem) {
    .pc-course-grid {
      grid-template-columns: 1fr;
    }
  }
  ```

- [ ] **Step 2: Rebuild home route**

  Replace the `main className="pc-page pc-home pc-home-academy"` route composition with:

  ```tsx
  <PageShell>
    <div className="pc-home-layout">
      <section className="pc-home-hero">
        <div className="pc-home-hero__copy">
          <Title order={1}>Private beauty courses, taught with care.</Title>
          <Text c="dimmed" size="lg" maw={620}>
            Learn protected salon techniques through focused lessons, clear previews, and
            access-managed course libraries.
          </Text>
          <div className="pc-home-hero__actions">
            <Link to="/courses">
              <Button size="md" rightSection={<ArrowRight size={18} />}>
                View courses
              </Button>
            </Link>
            <a href="#updates">
              <Button size="md" variant="light" leftSection={<Mail size={18} />}>
                Course updates
              </Button>
            </a>
          </div>
        </div>

        {featuredCourse ? (
          <CourseCard
            variant="featured"
            title={featuredCourse.title}
            description={featuredCourse.description}
            href="/courses/$courseSlug"
            params={{ courseSlug: featuredCourse.slug }}
            actionLabel="Open course"
            meta={<StatusBadge status="preview" />}
          />
        ) : (
          <EmptyState
            title="New classes are being prepared"
            description="Published courses will appear here when they are ready."
          />
        )}
      </section>

      <section>
        <PageHeader
          title="Available courses"
          description="A focused course library for private salon training."
        />
        {courseCards.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="The course menu will open as soon as the first class is published."
          />
        ) : (
          <div className="pc-course-grid">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                href="/courses/$courseSlug"
                params={{ courseSlug: course.slug }}
                actionLabel="Open course"
                meta={<StatusBadge status="preview" />}
              />
            ))}
          </div>
        )}
      </section>

      <section id="updates">
        <FormSection
          title="Get course updates"
          description="Leave your details for new course releases and studio updates."
        >
          {/* Keep the existing Mantine form fields and toast behavior here. */}
        </FormSection>
      </section>
    </div>
  </PageShell>
  ```

  Move the existing `TextInput` fields and `form.onSubmit` body into the `FormSection`. Do not keep `academyMarks`, `pc-academy-proof`, `pc-academy-index`, or `pc-academy-mark`.

- [ ] **Step 3: Rebuild catalog route**

  In `apps/web/src/routes/courses/index.tsx`, replace the current hero grid and `SimpleGrid` with `PageShell`, `PageHeader`, and `.pc-course-grid`.

  Use this copy:

  - Title: `Choose your next private course`
  - Description: `Browse published courses, preview what is open, and continue when your course access is active.`
  - Empty title: `No courses yet`
  - Empty description: `Courses will appear here when they are available.`

  Each course maps to:

  ```tsx
  <CourseCard
    key={course.id}
    title={course.title}
    description={course.description}
    href="/courses/$courseSlug"
    params={{ courseSlug: course.slug }}
    meta={<StatusBadge status="preview" />}
  />
  ```

- [ ] **Step 4: Rebuild course detail route**

  In `apps/web/src/routes/courses/$courseSlug/index.tsx`, use `PageShell`, `PageHeader`, `Surface`, `LessonRow`, and `StatusBadge`.

  Preserve:

  - `firstAccessibleLesson` logic
  - `freeLessonCount` logic
  - locked lesson behavior
  - `/login` fallback

  Map each lesson to:

  ```tsx
  <LessonRow
    key={lesson.id}
    position={lesson.position + 1}
    title={lesson.title}
    meta={
      lesson.durationSeconds ? `${Math.round(lesson.durationSeconds / 60)} min` : "Duration pending"
    }
    status={lesson.isFree ? "free" : course.data.hasActiveAccess ? "included" : "locked"}
    href={canOpenLesson ? "/courses/$courseSlug/lessons/$lessonSlug" : undefined}
    params={canOpenLesson ? { courseSlug, lessonSlug: lesson.slug } : undefined}
  />
  ```

- [ ] **Step 5: Rebuild lesson route shell**

  In `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`, use `PageShell size="full" tone="player"` and `.pc-lesson-layout`.

  Preserve:

  - `LessonError`
  - `isCourseAccessError`
  - `LessonPlayer` props
  - `onProgressSaved` invalidation
  - both `LessonNavControls` instances unless the layout makes one redundant after visual inspection

- [ ] **Step 6: Align lesson navigation feature**

  In `apps/web/src/features/course/lesson-navigation.tsx`, replace local row styling with `LessonRow` where possible. Keep existing props and exported component names so route call sites remain stable.

- [ ] **Step 7: Align lesson player UI**

  In `apps/web/src/features/course/lesson-player-ui.tsx`, replace any Tailwind utility class names with product CSS classes and Mantine props. Keep all existing playback controls and event handlers unchanged.

- [ ] **Step 8: Remove unused academy CSS**

  After routes compile, delete unused selectors from `index.css`:

  - `.pc-page`
  - `.pc-page-narrow`
  - `.pc-panel`
  - every `.pc-academy-*`
  - `.pc-home`
  - `.pc-section-heading`

  Run `rg "pc-academy|pc-page|pc-page-narrow|pc-panel|pc-section-heading" apps/web/src` and confirm no results remain before deleting selectors.

- [ ] **Step 9: Run verification**

  Run:

  ```bash
  vp run --filter web check-types
  rg "pc-academy|pc-page|pc-page-narrow|pc-panel|pc-section-heading|className=\"[^\"]*(^| )(grid|flex|mx-|w-|max-w-|px-|py-|mt-|mb-|gap-|h-|min-h-|items-|justify-)" apps/web/src
  ```

  Expected: typecheck PASS. The `rg` command should not find old academy/page classes. For Tailwind-like class hits, inspect each result and convert route/component utility classes to Product Atelier CSS classes in this task.

- [ ] **Step 10: Commit**

  ```bash
  git add apps/web/src/routes/index.tsx apps/web/src/routes/courses apps/web/src/features/course apps/web/src/index.css
  git commit -m "feat: redesign student course experience"
  ```

---

### Task 5: Auth And Profile Pages

**Files:**

- Modify: `apps/web/src/routes/login.tsx`
- Modify: `apps/web/src/components/sign-in-form.tsx`
- Modify: `apps/web/src/components/sign-up-form.tsx`
- Modify: `apps/web/src/routes/_auth/profile.tsx`
- Modify: `apps/web/src/features/profile/account-section.tsx`
- Modify: `apps/web/src/features/profile/password-section.tsx`
- Modify: `apps/web/src/features/profile/passkeys-section.tsx`
- Modify: `apps/web/src/features/profile/passkey-row.tsx`
- Modify: `apps/web/src/features/profile/sessions-section.tsx`
- Modify: `apps/web/src/features/profile/session-row.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: `PageShell`, `PageHeader`, `FormSection`, `Surface`, `StatusBadge`.
- Produces: auth/profile surfaces without Tailwind utility classes and with preserved auth behavior.

- [ ] **Step 1: Add profile/auth CSS**

  Append:

  ```css
  .pc-auth-panel {
    margin-block: clamp(1rem, 6vw, 4rem);
  }

  .pc-profile-stack {
    display: grid;
    gap: 1rem;
  }

  .pc-security-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.75rem;
  }

  .pc-security-row + .pc-security-row {
    border-top: 1px solid var(--pc-border);
  }

  .pc-security-row__content {
    min-width: 0;
    display: grid;
    gap: 0.15rem;
  }

  @media (max-width: 40rem) {
    .pc-security-row {
      align-items: stretch;
      flex-direction: column;
    }
  }
  ```

- [ ] **Step 2: Update login route**

  In `apps/web/src/routes/login.tsx`, replace:

  ```tsx
  <main className="pc-page-narrow">
  ```

  with:

  ```tsx
  <PageShell size="narrow">
    <div className="pc-auth-panel">
      {showSignIn ? (
        <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
      )}
    </div>
  </PageShell>
  ```

- [ ] **Step 3: Update sign-in form wrapper**

  In `sign-in-form.tsx`, replace the outer `Paper` with:

  ```tsx
  <FormSection title="Welcome back" description="Continue your private course access.">
    {/* existing passkey button and email/password form */}
  </FormSection>
  ```

  Keep `signInWithPasskey`, `authClient.signIn.email`, validation, navigation, and toast behavior unchanged.

- [ ] **Step 4: Update sign-up form wrapper**

  In `sign-up-form.tsx`, replace the outer `Paper` with:

  ```tsx
  <FormSection title="Create account" description="Set up access for private course lessons.">
    {/* existing email/password/name form */}
  </FormSection>
  ```

  Keep passkey creation, navigation, validation, and toast behavior unchanged.

- [ ] **Step 5: Update profile route**

  In `_auth/profile.tsx`, replace the `main` utility classes with:

  ```tsx
  <PageShell>
    <PageHeader
      title="Profile"
      description={session.data?.user.email ?? "Manage your account security."}
    />
    <div className="pc-profile-stack">{/* existing profile sections */}</div>
  </PageShell>
  ```

- [ ] **Step 6: Update profile sections**

  In each profile section file, replace direct `Paper` wrappers with `Surface` or `FormSection`.

  Required behavior to preserve:

  - Account update calls `onRefetch`.
  - Password update calls `onSessionsChanged`.
  - Passkey add/remove calls `onRefetch`.
  - Session revoke calls `onRefetch`.
  - All mutation failures call `toast.error(error.message)` or existing auth error messages.

- [ ] **Step 7: Update row components**

  In `passkey-row.tsx` and `session-row.tsx`, use `.pc-security-row` and `.pc-security-row__content` instead of utility classes or ad hoc spacing.

- [ ] **Step 8: Run verification**

  Run:

  ```bash
  vp run --filter web check-types
  rg "pc-page-narrow|className=\"[^\"]*(^| )(grid|flex|mx-|w-|max-w-|px-|py-|mt-|mb-|gap-|h-|min-h-|items-|justify-)" apps/web/src/routes/login.tsx apps/web/src/components/sign-in-form.tsx apps/web/src/components/sign-up-form.tsx apps/web/src/routes/_auth/profile.tsx apps/web/src/features/profile
  ```

  Expected: typecheck PASS. Inspect any `rg` hits and convert Tailwind-like class names to Product Atelier CSS classes.

- [ ] **Step 9: Commit**

  ```bash
  git add apps/web/src/routes/login.tsx apps/web/src/components/sign-in-form.tsx apps/web/src/components/sign-up-form.tsx apps/web/src/routes/_auth/profile.tsx apps/web/src/features/profile apps/web/src/index.css
  git commit -m "feat: redesign auth and profile surfaces"
  ```

---

### Task 6: Admin Pages And Admin Forms

**Files:**

- Modify: `apps/web/src/routes/_auth/admin/index.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/new.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/index.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/access.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/new.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/$lessonId.tsx`
- Modify: `apps/web/src/components/course-form.tsx`
- Modify: `apps/web/src/components/lesson-form.tsx`
- Modify: `apps/web/src/features/admin/video-upload-panel.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: `PageShell`, `PageHeader`, `DataTableShell`, `FormSection`, `Surface`, `StatusBadge`.
- Produces: dense but visually consistent admin UI with preserved mutations and admin route behavior.

- [ ] **Step 1: Add admin CSS**

  Append:

  ```css
  .pc-admin-stack {
    display: grid;
    gap: 1.5rem;
  }

  .pc-admin-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: start;
  }

  .pc-admin-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .pc-table-action {
    white-space: nowrap;
  }

  .pc-upload-stack {
    display: grid;
    gap: 1rem;
  }

  @media (max-width: 64rem) {
    .pc-admin-grid {
      grid-template-columns: 1fr;
    }
  }
  ```

- [ ] **Step 2: Update admin course list**

  In `_auth/admin/index.tsx`, use:

  ```tsx
  <PageShell size="wide">
    <PageHeader
      title="Admin"
      description="Manage courses, lessons, publication state, and private access."
      actions={
        <Link to="/admin/courses/new">
          <Button>New course</Button>
        </Link>
      }
    />
    <DataTableShell
      title="Courses"
      description="Create and maintain the course catalog."
      empty={
        courses.data?.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create the first course, then add lessons and grant users access."
            action={
              <Link to="/admin/courses/new">
                <Button>Create course</Button>
              </Link>
            }
          />
        ) : undefined
      }
    >
      {/* existing table with StatusBadge and edit action */}
    </DataTableShell>
  </PageShell>
  ```

  Replace course status badges with:

  ```tsx
  <StatusBadge status={course.status} />
  ```

  If `course.status` is not inferred as `"draft" | "published" | "archived"`, create a route-local helper:

  ```tsx
  function courseStatusBadge(status: string) {
    if (status === "published" || status === "draft" || status === "archived") {
      return <StatusBadge status={status} />;
    }
    return <Badge variant="light">{status}</Badge>;
  }
  ```

- [ ] **Step 3: Update course form**

  In `course-form.tsx`, replace outer `Paper` with:

  ```tsx
  <FormSection title={title}>
    <form onSubmit={form.onSubmit(onSubmit)}>{/* existing fields and submit button */}</form>
  </FormSection>
  ```

  Keep `slugify`, validation, status options, disabled submit logic, and `CourseFormValue` unchanged.

- [ ] **Step 4: Update lesson form**

  In `lesson-form.tsx`, mirror the `CourseForm` treatment:

  - Use `FormSection`.
  - Preserve all fields, validation, slug generation, free lesson toggle, video UID/duration fields, and submit behavior.
  - Do not rename exported types.

- [ ] **Step 5: Update admin course create route**

  In `_auth/admin/courses/new.tsx`, use `PageShell size="wide"` and `PageHeader` with back link:

  ```tsx
  <PageShell size="wide">
    <PageHeader title="New course" description="Create a course shell before adding lessons." backTo={{ to: "/admin", label: "Back to admin" }} />
    <CourseForm ... />
  </PageShell>
  ```

  Preserve create mutation, invalidations, navigation, and toast handling.

- [ ] **Step 6: Update admin course edit route**

  In `_auth/admin/courses/$courseId/index.tsx`, use `PageShell size="wide"` and `PageHeader`.

  Header actions:

  ```tsx
  <Link to="/admin/courses/$courseId/access" params={{ courseId }}>
    <Button variant="light">Manage access</Button>
  </Link>
  ```

  Wrap lessons table in `DataTableShell`. Preserve reorder logic exactly.

- [ ] **Step 7: Update access management route**

  In `_auth/admin/courses/$courseId/access.tsx`, use `PageShell size="wide"`, `PageHeader`, `.pc-admin-grid`, and two `DataTableShell` panels:

  - `Grant access`
  - `Active access`

  Preserve:

  - `query` state
  - `usersQueryOptions(query)`
  - `activeUserIds`
  - grant and revoke mutations
  - refetch and toast behavior

- [ ] **Step 8: Update lesson create/edit routes and upload panel**

  In lesson new/edit routes:

  - Use `PageShell size="wide"`.
  - Use `PageHeader` with back link to the parent course.
  - Keep existing lesson form and upload panel sequencing.

  In `video-upload-panel.tsx`:

  - Wrap the panel with `Surface variant="raised"` or `Surface`.
  - Use `StatusBadge` only for states it supports.
  - Preserve all Cloudflare Stream upload, tus, and mutation behavior.

- [ ] **Step 9: Run verification**

  Run:

  ```bash
  vp run --filter web check-types
  rg "pc-panel|pc-page|className=\"[^\"]*(^| )(grid|flex|mx-|w-|max-w-|px-|py-|mt-|mb-|gap-|h-|min-h-|items-|justify-)" apps/web/src/routes/_auth/admin apps/web/src/components/course-form.tsx apps/web/src/components/lesson-form.tsx apps/web/src/features/admin
  ```

  Expected: typecheck PASS. Inspect `rg` hits and convert Tailwind-like class names to Product Atelier CSS classes unless they are inside third-party examples or generated files.

- [ ] **Step 10: Commit**

  ```bash
  git add apps/web/src/routes/_auth/admin apps/web/src/components/course-form.tsx apps/web/src/components/lesson-form.tsx apps/web/src/features/admin apps/web/src/index.css
  git commit -m "feat: redesign admin course management"
  ```

---

### Task 7: Final CSS Cleanup, Verification, And Visual QA

**Files:**

- Modify: `apps/web/src/index.css`
- Modify: any touched route/component file with remaining old classes or broken copy.

**Interfaces:**

- Consumes: all redesigned pages and shared primitives.
- Produces: verified Product Atelier app with no unused old UI classes and no Tailwind utility dependency in redesigned code.

- [ ] **Step 1: Scan for retired classes and utility classes**

  Run:

  ```bash
  rg "pc-academy|pc-page|pc-page-narrow|pc-panel|pc-section-heading" apps/web/src
  rg "className=\"[^\"]*(^| )(grid|flex|mx-|w-|max-w-|px-|py-|pt-|pb-|mt-|mb-|gap-|h-|min-h-|items-|justify-|grow|no-underline|text-|bg-|border-)" apps/web/src
  ```

  Expected: no old Product Atelier-retired class hits. Tailwind-like class hits should be manually reviewed. Convert each remaining utility class in app-owned route/component code into Product Atelier CSS classes or Mantine props.

- [ ] **Step 2: Scan visible copy for banned punctuation**

  Run:

  ```bash
  LC_ALL=C rg "$(printf '\342\200\224|\342\200\223')" apps/web/src
  ```

  Expected: no results in visible strings. If results appear in code comments or third-party content, inspect and remove from visible app copy.

- [ ] **Step 3: Confirm Tailwind import decision**

  If Step 1 finds no Tailwind utility classes in `apps/web/src`, remove Tailwind from `apps/web/src/index.css`:

  ```css
  @import "tailwindcss";
  @source "./**/*.{ts,tsx}";
  ```

  Then run `vp run --filter web check-types`.

  If the build fails because Tailwind is required by Vite configuration, keep the import but do not use Tailwind utilities in app code. Document the reason in the final implementation summary.

- [ ] **Step 4: Run full automated verification**

  Run:

  ```bash
  vp run check
  vp run test
  vp exec react-doctor --no-telemetry -y --verbose
  vp run smoke
  ```

  Expected: all PASS. If any command fails, fix the failing issue before proceeding. Do not mark the implementation complete with a failing verification command.

- [ ] **Step 5: Start local app for visual QA**

  Run:

  ```bash
  vp run dev
  ```

  Keep the dev server running for visual inspection. If the default port is taken, use the URL printed by Vite/Vite Plus.

- [ ] **Step 6: Manual route QA**

  Check light and dark mode where possible:

  - `/`
  - `/courses`
  - `/courses/$courseSlug`
  - `/courses/$courseSlug/lessons/$lessonSlug`
  - `/login`
  - `/profile`
  - `/admin`
  - `/admin/courses/new`
  - `/admin/courses/$courseId`
  - `/admin/courses/$courseId/access`
  - `/admin/courses/$courseId/lessons/new`
  - `/admin/courses/$courseId/lessons/$lessonId`

  Expected:

  - Header stays on one line on desktop.
  - Header remains usable on mobile.
  - Buttons have readable contrast.
  - Course cards and lesson rows have visible focus.
  - Lesson player gives visual priority to video.
  - Admin tables scroll horizontally on narrow screens.
  - Empty, loading, and error states fit their parent surface.
  - No old academy decoration remains.

- [ ] **Step 7: Stop dev server**

  Stop the `vp run dev` session cleanly with `Ctrl-C` in the running terminal session.

- [ ] **Step 8: Commit final cleanup**

  ```bash
  git add apps/web/src
  git commit -m "chore: verify product atelier redesign"
  ```

  If Step 4 and Step 6 required no changes after Task 6, skip this commit and note that no cleanup commit was needed.
