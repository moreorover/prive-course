# Phase 5 UI Facelift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Prive Course a premium, trustworthy, readable interface with first-class light and dark modes.

**Architecture:** Keep the app Mantine-first and route-local. Use global theme tokens and a few reusable primitives for layout rhythm, then refine the public course, lesson, auth, and admin surfaces without adding a custom component framework.

**Tech Stack:** React, TanStack Router, TanStack Query, Mantine v9, Tailwind utilities, lucide-react.

## Global Constraints

- Existing UI may be changed freely when it improves Phase 5 outcomes.
- Light and dark modes must both look intentional.
- Prefer Mantine v9 components and props before creating custom complex components.
- Main reading flow is mobile-first and single-column; desktop may use at most two columns.
- Avoid marketing-page treatment, decorative clutter, and hidden authorization assumptions.
- Preserve backend authorization, route loaders, mutation invalidation, and existing public/locked/free behavior.
- Validate with `vp run check`, `vp run test`, React Doctor, and visual review at mobile and desktop widths.

---

## Design Direction

**Name:** Private Reading Room.

**Subject:** A private video course platform where students browse available courses, open granted or free lessons, and watch protected course videos. Admins manage course inventory and access.

**Color tokens:**

- Canvas light: `#f7f4ed`
- Canvas dark: `#11130f`
- Panel light: `#fffaf0`
- Panel dark: `#191b16`
- Ink: `#1d221c`
- Mist: `#d9d1c2`
- Brass: `#b08a3c`
- Deep teal: `#176b67`
- Rust: `#a84f3f`

**Type:** System fonts only for reliability. Use a more deliberate scale: large page titles, compact labels, readable body copy, and tabular metadata where useful.

**Layout:**

```text
Mobile:
+----------------------+
| header               |
| title / controls     |
| primary content      |
| secondary content    |
+----------------------+

Desktop:
+----------------------+----------------------+
| primary column        | optional side rail   |
| no more than 2 cols   | metadata/controls    |
+----------------------+----------------------+
```

**Signature:** A restrained "lesson rail" language: rows with position, access state, duration, and current lesson treatment. It should feel like a private playlist, not a generic table.

**Self-critique:** This avoids the generic SaaS dashboard direction by using private-library warmth and course-specific lesson rails. It also avoids a landing-page hero treatment because the app's job is repeated use, scanning, and playback.

---

### Task 1: Theme And Global Surface

**Files:**

- Modify: `apps/web/src/routes/__root.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Produces CSS variables used by route classes: `--pc-canvas`, `--pc-panel`, `--pc-border`, `--pc-muted`, `--pc-accent`, `--pc-accent-strong`.
- Keeps Mantine provider and router context unchanged.

- [ ] **Step 1: Write a baseline visual smoke checklist**

Add a note to the plan execution log or final PR description that verifies:

```text
- Light mode body background and paper surfaces have readable contrast.
- Dark mode body background and paper surfaces have readable contrast.
- Keyboard focus is visible on links and controls.
- No page uses more than two columns at desktop width.
```

- [ ] **Step 2: Implement the Mantine theme**

Update `apps/web/src/routes/__root.tsx` so `createTheme` defines:

```ts
const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "sm",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontWeight: "720",
  },
  colors: {
    brass: [
      "#fbf6e7",
      "#f1e5bf",
      "#e5d091",
      "#d4b765",
      "#b08a3c",
      "#987331",
      "#775725",
      "#59401c",
      "#3b2a13",
      "#22180b",
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
        radius: "sm",
      },
    },
  },
});
```

- [ ] **Step 3: Implement global CSS tokens**

Update `apps/web/src/index.css` with light/dark variables, body color, anchor styling, focus-visible styling, and a `.pc-page` layout helper:

```css
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  background: var(--pc-canvas);
  color: var(--pc-text);
}

[data-mantine-color-scheme="light"] {
  --pc-canvas: #f7f4ed;
  --pc-panel: #fffaf0;
  --pc-border: #d9d1c2;
  --pc-text: #1d221c;
  --pc-muted: #6d675c;
  --pc-accent: #b08a3c;
  --pc-accent-strong: #176b67;
}

[data-mantine-color-scheme="dark"] {
  --pc-canvas: #11130f;
  --pc-panel: #191b16;
  --pc-border: #34372f;
  --pc-text: #f7f4ed;
  --pc-muted: #b8b09f;
  --pc-accent: #d0a84d;
  --pc-accent-strong: #4eb5ad;
}

.pc-page {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 3rem);
}
```

- [ ] **Step 4: Verify**

Run:

```bash
vp run check
```

Expected: formatting, lint, server typecheck, web build, and web typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/__root.tsx apps/web/src/index.css
git commit -m "style: define phase 5 theme"
```

---

### Task 2: Header And Auth Shell

**Files:**

- Modify: `apps/web/src/components/header.tsx`
- Modify: `apps/web/src/components/user-menu.tsx`
- Modify: `apps/web/src/components/mode-toggle.tsx`
- Modify: `apps/web/src/routes/login.tsx`
- Modify: `apps/web/src/components/sign-in-form.tsx`
- Modify: `apps/web/src/components/sign-up-form.tsx`

**Interfaces:**

- Keeps `ModeToggle`, `UserMenu`, `SignInForm`, and `SignUpForm` public props unchanged.
- Uses Mantine `Container`, `Group`, `Button`, `Menu`, `Paper`, and form components.

- [ ] **Step 1: Refine the header**

Update `Header` to use a sticky, bordered app header with a compact brand block, nav links, mode toggle, and user menu. Keep links as TanStack `Link`.

- [ ] **Step 2: Improve mode toggle affordance**

Keep the Mantine `Menu` implementation. Add clearer icons and active state labels without adding a custom selector component.

- [ ] **Step 3: Improve auth forms**

Wrap sign in and sign up forms in `Paper` on a centered `.pc-page` container. Keep form validation and auth behavior unchanged.

- [ ] **Step 4: Verify**

Run:

```bash
vp run check
vp exec react-doctor --no-telemetry -y --verbose
```

Expected: both commands pass with no React Doctor issues.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/header.tsx apps/web/src/components/user-menu.tsx apps/web/src/components/mode-toggle.tsx apps/web/src/routes/login.tsx apps/web/src/components/sign-in-form.tsx apps/web/src/components/sign-up-form.tsx
git commit -m "style: refine app shell"
```

---

### Task 3: Public Course And Lesson Surfaces

**Files:**

- Modify: `apps/web/src/components/empty-state.tsx`
- Modify: `apps/web/src/routes/courses/index.tsx`
- Modify: `apps/web/src/routes/courses/$courseSlug/index.tsx`
- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`
- Modify: `apps/web/src/features/course/lesson-navigation.tsx`
- Modify: `apps/web/src/features/course/lesson-player.tsx`

**Interfaces:**

- Keeps route params, loaders, query invalidation, and `LessonPlayer` props unchanged.
- Keeps lesson navigation data shape unchanged.

- [ ] **Step 1: Refine empty states**

Use Mantine `Paper`, `Stack`, and `Text` with better spacing and consistent max width. Keep the existing `EmptyState` props unchanged.

- [ ] **Step 2: Refine course catalog**

Keep a single-column reading flow on mobile. On desktop, allow a two-column grid for course cards only. Improve cards with compact metadata, cleaner access badges, and stronger action placement.

- [ ] **Step 3: Refine course detail**

Replace the lesson table with a readable lesson list using Mantine `Paper`, `Group`, `Stack`, `Badge`, and `Button`. Do not exceed two columns. Locked lessons must remain non-links.

- [ ] **Step 4: Refine lesson page**

Use a two-column desktop layout only where it helps: primary video/content column plus lesson rail. On mobile, render as one column. Keep previous/next controls above and below the player.

- [ ] **Step 5: Refine playback states**

Keep protected playback behavior. Improve the pre-playback panel, no-video state, saved progress row, and playback error copy using Mantine components only.

- [ ] **Step 6: Verify**

Run:

```bash
vp run check
vp run test
vp exec react-doctor --no-telemetry -y --verbose
```

Expected: all commands pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/empty-state.tsx apps/web/src/routes/courses/index.tsx 'apps/web/src/routes/courses/$courseSlug/index.tsx' 'apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx' apps/web/src/features/course/lesson-navigation.tsx apps/web/src/features/course/lesson-player.tsx
git commit -m "style: polish course and lesson surfaces"
```

---

### Task 4: Admin Surfaces

**Files:**

- Modify: `apps/web/src/routes/_auth/admin/index.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/index.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/$lessonId.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/access.tsx`
- Modify: `apps/web/src/features/admin/video-upload-panel.tsx`
- Modify: `apps/web/src/components/course-form.tsx`
- Modify: `apps/web/src/components/lesson-form.tsx`

**Interfaces:**

- Keep admin route loaders, mutations, invalidation, upload behavior, and form submit values unchanged.
- Prefer Mantine `Table`, `Paper`, `Stack`, `Group`, `Badge`, `Alert`, and form props.

- [ ] **Step 1: Refine admin list pages**

Improve admin course and lesson tables with clearer headings, compact metadata, and consistent action placement. Tables are allowed in admin because scanning rows is the workflow.

- [ ] **Step 2: Refine forms**

Use clearer section spacing and helper text. Do not reintroduce system-owned fields such as video UID, duration seconds, or position.

- [ ] **Step 3: Refine video upload panel**

Make upload and processing states visually consistent with the new design tokens. Keep provider details hidden.

- [ ] **Step 4: Verify**

Run:

```bash
vp run check
vp run test
vp exec react-doctor --no-telemetry -y --verbose
```

Expected: all commands pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/_auth/admin/index.tsx 'apps/web/src/routes/_auth/admin/courses/$courseId/index.tsx' 'apps/web/src/routes/_auth/admin/courses/$courseId/lessons/$lessonId.tsx' 'apps/web/src/routes/_auth/admin/courses/$courseId/access.tsx' apps/web/src/features/admin/video-upload-panel.tsx apps/web/src/components/course-form.tsx apps/web/src/components/lesson-form.tsx
git commit -m "style: polish admin surfaces"
```

---

### Task 5: TODO And Final Validation

**Files:**

- Modify: `TODO.md`

**Interfaces:**

- Mark Phase 5 checkboxes complete only after implementation and validation.

- [ ] **Step 1: Update TODO**

Convert the Phase 5 free-form notes into constraints and mark completed Phase 5 items.

- [ ] **Step 2: Run final validation**

Run:

```bash
vp run check
vp run test
vp exec react-doctor --no-telemetry -y --verbose
```

If practical, run local smoke against built preview plus local worker:

```bash
vp run dev:server
vp run --filter web serve -- --port 3001 --host localhost
vp run smoke
```

- [ ] **Step 3: Commit**

```bash
git add TODO.md
git commit -m "docs: mark ui facelift complete"
```

- [ ] **Step 4: Push**

```bash
git push -u origin phase-5-ui-facelift
```

Expected: branch is pushed and ready for a stacked PR against `phase-4-lesson-navigation`.
