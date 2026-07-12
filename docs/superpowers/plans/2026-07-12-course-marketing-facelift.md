# Course Marketing Facelift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Phase 5 from a clean functional app UI into a course marketing platform where guests can browse, evaluate, and enter published courses.

**Architecture:** Keep the existing public course APIs and access rules. Improve the visual system and public React route presentation using Mantine v9 primitives, route-local components, and existing lesson metadata.

**Tech Stack:** React, TanStack Router, TanStack Query, Mantine v9, Tailwind utilities, lucide-react.

## Global Constraints

- Guests must be able to view all published courses and inspect each published course detail page.
- Public course pages should market the course value without introducing payment flows.
- Gold is the main accent color, supported by non-yellow neutrals and one cool counter-color.
- Light and dark modes must both look intentional.
- Prefer Mantine v9 components and props before creating custom complex components.
- Mobile is single-column; desktop can use at most two columns.
- Preserve backend authorization, route loaders, mutation invalidation, and existing public/locked/free behavior.
- Validate with `vp run check`, `vp run test`, React Doctor, smoke when practical, and visual review.

---

## Design Direction

**Name:** Gold Studio Catalog.

**Palette:**

- Gold: `#d5a73d`
- Deep gold: `#8d6724`
- Ink: `#111318`
- Porcelain: `#fbf7ef`
- Warm stone: `#ddd3c0`
- Slate green: `#23433f`
- Soft burgundy: `#8e3f35`

**Public experience:** The public catalog should feel like a curated course storefront. The course detail page should work like a course landing/detail page: title, description, access CTA, lesson outline, free preview signals, and a simple value summary from available course/lesson data.

**Signature:** Gold-framed course cards and lesson outline rows. Use restrained gold lines, badges, and CTA treatment rather than large decorative gradients.

---

### Task 1: Gold-Led Theme Revision

**Files:**

- Modify: `apps/web/src/routes/__root.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Keep existing CSS helper classes: `.pc-page`, `.pc-page-narrow`, `.pc-panel`, `.pc-muted`.
- Update CSS variables only; route code should continue using the same helper names.

- [ ] **Step 1: Update Mantine theme accent**

Change `createTheme` in `apps/web/src/routes/__root.tsx` so the primary color becomes `gold`, with a gold color ramp:

```ts
primaryColor: "gold",
colors: {
  gold: [
    "#fff8e1",
    "#f7e8b5",
    "#ecd47e",
    "#dfbf48",
    "#d5a73d",
    "#bd8f31",
    "#946b25",
    "#6d4d1d",
    "#493315",
    "#281b0b",
  ],
},
```

- [ ] **Step 2: Update light/dark CSS tokens**

Update `apps/web/src/index.css` variables:

```css
[data-mantine-color-scheme="light"] {
  --pc-canvas: #fbf7ef;
  --pc-canvas-glow: rgb(213 167 61 / 18%);
  --pc-panel: #fffdf8;
  --pc-panel-soft: #f1e8d7;
  --pc-border: #ddd3c0;
  --pc-text: #17140e;
  --pc-muted: #6b6255;
  --pc-accent: #d5a73d;
  --pc-accent-strong: #23433f;
  --pc-danger-soft: #8e3f35;
}
```

Dark mode should use ink, dark panel, brighter gold, and slate green support.

- [ ] **Step 3: Verify and commit**

Run:

```bash
vp run check
vp exec react-doctor --no-telemetry -y --verbose
```

Commit:

```bash
git add apps/web/src/routes/__root.tsx apps/web/src/index.css
git commit -m "style: revise gold course palette"
```

---

### Task 2: Marketing Course Catalog

**Files:**

- Modify: `apps/web/src/routes/courses/index.tsx`

**Interfaces:**

- Keep `publishedCoursesQueryOptions` and route loader unchanged.
- Keep course card links pointing to `/courses/$courseSlug`.

- [ ] **Step 1: Upgrade catalog header**

Add an editorial page header with:

- Eyebrow: `Course catalog`
- H1: `Choose your next private course`
- Supporting copy about browsing available courses and free previews.

- [ ] **Step 2: Upgrade course cards**

Use Mantine `Paper`, `Stack`, `Group`, `Badge`, `Button`, and `Text`.
Each card should show:

- Course title
- Description
- Access badge only when access is granted
- A gold-accented `View course` CTA
- A short metadata line such as `Private course` and `Free previews where available`

- [ ] **Step 3: Verify and commit**

Run:

```bash
vp run check
vp exec react-doctor --no-telemetry -y --verbose
```

Commit:

```bash
git add apps/web/src/routes/courses/index.tsx
git commit -m "style: make catalog feel marketable"
```

---

### Task 3: Marketing Course Detail Page

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/index.tsx`

**Interfaces:**

- Keep `courseQueryOptions`, loader, lesson locking logic, and lesson links unchanged.
- Desktop can use two columns: primary course story and side summary/CTA.

- [ ] **Step 1: Add course detail hero**

Use course title and description to create a landing/detail hero with:

- Gold eyebrow: `Private course`
- Course title
- Description
- CTA to first accessible lesson when one exists, otherwise sign-in CTA or lesson outline anchor.

- [ ] **Step 2: Add course summary panel**

Add a second desktop column with computed metadata:

- Lesson count
- Free preview count
- Access state: granted or account required for locked lessons

- [ ] **Step 3: Upgrade lesson outline**

Keep locked lessons non-links. Make the outline visually clearer with gold position markers, access badges, duration, and row hover treatment for accessible lessons.

- [ ] **Step 4: Verify and commit**

Run:

```bash
vp run check
vp run test
vp exec react-doctor --no-telemetry -y --verbose
```

Commit:

```bash
git add 'apps/web/src/routes/courses/$courseSlug/index.tsx'
git commit -m "style: make course detail marketable"
```

---

### Task 4: Align Supporting Surfaces And TODO

**Files:**

- Modify: `apps/web/src/features/course/lesson-navigation.tsx`
- Modify: `apps/web/src/features/course/lesson-player-ui.tsx`
- Modify: `apps/web/src/features/admin/video-upload-panel.tsx`
- Modify: `TODO.md`

**Interfaces:**

- Keep component props unchanged.
- Keep admin upload behavior unchanged.

- [ ] **Step 1: Align lesson/player accents**

Use gold accent styling for current lesson rows, protected playback CTA, and free preview/included badges where appropriate.

- [ ] **Step 2: Keep admin calmer**

Admin should inherit the new palette but remain operational. Avoid marketing hero treatment in admin routes.

- [ ] **Step 3: Mark extension items complete**

Update `TODO.md` Phase 5 items only after implementation and validation.

- [ ] **Step 4: Final validation and commit**

Run:

```bash
vp run check
vp run test
vp exec react-doctor --no-telemetry -y --verbose
```

Commit:

```bash
git add apps/web/src/features/course/lesson-navigation.tsx apps/web/src/features/course/lesson-player-ui.tsx apps/web/src/features/admin/video-upload-panel.tsx TODO.md
git commit -m "style: align gold marketing surfaces"
```

---

### Task 5: Smoke And Push

**Files:**

- None unless validation exposes an issue.

- [ ] **Step 1: Run smoke**

Run local smoke against built preview and local worker:

```bash
vp run dev:server
vp run --filter web serve -- --port 3001 --host localhost
vp run smoke
```

- [ ] **Step 2: Push**

```bash
git push
```

Expected: PR #4 updates with this Phase 5 extension.
