# Salon Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a soft salon-oriented public homepage for `priauginimas.lt` that features available courses and includes a UI-only subscription form.

**Architecture:** Reuse the existing `trpc.courses.listPublished` public query from the homepage route loader and component. Keep all subscription behavior client-side inside the route component so no public write endpoint is introduced.

**Tech Stack:** React, Vite, TanStack Router, TanStack Query, Mantine, Tailwind utilities, Sonner.

## Global Constraints

- Do not add backend subscription persistence in this pass.
- Do not call a public API from the subscription form.
- Use existing file-route and query preload patterns.
- Use Mantine layout and form controls where practical.
- Keep copy focused on a single small salon business, not the software platform.

---

### Task 1: Homepage Catalog And Form

**Files:**

- Modify: `apps/web/src/routes/index.tsx`

**Interfaces:**

- Consumes: `trpc.courses.listPublished.queryOptions()`.
- Produces: A homepage that preloads and renders published courses plus a UI-only subscription form.

- [ ] Import Mantine form controls, TanStack Query `useQuery`, Sonner `toast`, and relevant lucide icons.
- [ ] Add `publishedCoursesQueryOptions` and route loader using `context.queryClient.ensureQueryData`.
- [ ] Replace platform feature copy with salon course storefront copy.
- [ ] Render a featured course from the first published course and secondary cards for the rest.
- [ ] Add local form state for email, full name, Instagram, and phone.
- [ ] Validate email on submit; show toast success and reset form without making a network request.

### Task 2: Header And Theme Softening

**Files:**

- Modify: `apps/web/src/components/header.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: Existing global CSS variables and header component.
- Produces: Softer salon palette and public brand copy for `priauginimas.lt`.

- [ ] Update header brand text and sublabel.
- [ ] Adjust CSS variables for light and dark color schemes.
- [ ] Add route-local homepage utility classes for floral/salon details only where needed.

### Task 3: Verification

**Files:**

- Verify: `apps/web/src/routes/index.tsx`
- Verify: `apps/web/src/components/header.tsx`
- Verify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: The completed UI changes.
- Produces: Type/build verification evidence.

- [ ] Run `vp run --filter web check-types`.
- [ ] If type checking fails, fix reported issues and rerun the same command.
