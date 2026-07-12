# Lesson Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend-computed lesson navigation context and a responsive lesson viewing layout.

**Architecture:** `courses.lessonBySlug` will return ordered published lesson navigation data for the current viewer. The lesson page will render a responsive two-column layout on desktop, a single-column flow on mobile, a lesson sidebar/list, and previous/next controls that never link to locked lessons.

**Tech Stack:** tRPC, Drizzle ORM, Better Auth session context, React, TanStack Router/Query, Mantine.

## Global Constraints

- Backend authorization remains authoritative; frontend route guards and hidden UI are only UX.
- Guests may view published courses and published free lessons.
- Paid lesson content and playback require an authenticated user with active course access.
- Locked paid lessons may be visible as metadata but must not be linked to playable content for guests or users without active access.
- Payment flows and single-lesson purchases stay out of scope.

---

### Task 1: Backend Navigation Contract

**Files:**

- Modify: `packages/api/src/routers/course.ts`
- Modify: `packages/api/src/routers/authz.test.ts`

**Interfaces:**

- `courses.lessonBySlug` returns `navigation: { lessons, previousLesson, nextLesson }`.
- Each navigation lesson has `{ id, title, slug, position, durationSeconds, isFree, accessState, isCurrent }`.
- `accessState` is `"free" | "included" | "locked"`.
- `previousLesson` and `nextLesson` are accessible lessons only, or `null`.

- [ ] **Step 1: Add failing tests for guest navigation**

Guest opening a free lesson receives ordered lessons with free and locked states; previous/next skip locked paid lessons.

- [ ] **Step 2: Add failing tests for granted-user navigation**

Signed-in users with active course access receive all published lessons as accessible, with included paid lessons in previous/next.

- [ ] **Step 3: Implement backend context**

Load course lessons ordered by position, compute active access once, compute access state consistently, and return previous/next from accessible lessons.

- [ ] **Step 4: Run focused API tests**

Run `vp run --filter @prive-course/api test` and expect all API tests to pass.

### Task 2: Lesson Navigation UI

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`

**Interfaces:**

- Consumes `lesson.data.navigation`.
- Renders previous/next `Link`s only when the backend returns a lesson.
- Renders locked sidebar rows without links.

- [ ] **Step 1: Add previous/next controls**

Render previous and next controls above or below the player using TanStack Router `Link`.

- [ ] **Step 2: Add responsive lesson list**

On desktop, render the lesson list in a left sidebar and the video/details on the right. On mobile, stack content in a single column.

- [ ] **Step 3: Preserve locked lesson error UI**

Keep the friendly locked state for direct navigation to paid locked lessons.

### Task 3: TODO And Verification

**Files:**

- Modify: `TODO.md`

**Interfaces:**

- Mark Phase 4 checkboxes complete only when implemented.

- [ ] **Step 1: Update TODO checkboxes**

Check the three Phase 4 items after backend context, previous/next controls, and responsive layout are implemented.

- [ ] **Step 2: Run final validation**

Run `vp run check`, `vp run test`, `vp exec react-doctor --no-telemetry -y --verbose`, and `vp run smoke` when practical.
