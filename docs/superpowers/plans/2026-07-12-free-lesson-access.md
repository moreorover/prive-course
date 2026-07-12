# Free Lesson Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow published free lessons to be discovered and played by guests while keeping paid lessons restricted to signed-in users with active course access.

**Architecture:** Add a durable lesson-level `isFree` flag, expose it through admin lesson CRUD, and make public course and free lesson APIs authorize from published course, published lesson, and free flag state. Authenticated paid lesson behavior remains grant-based, and guest free playback receives signed Stream tokens without user-bound playback sessions.

**Tech Stack:** Drizzle ORM with Cloudflare D1, Hono/tRPC, Better Auth session context, React with TanStack Router/Query, Mantine forms.

## Global Constraints

- Backend authorization remains authoritative; frontend route guards and hidden UI are only UX.
- Guests may view published courses and published free lessons.
- Paid lesson content and playback require an authenticated user with active course access.
- Existing lessons must default to gated behavior.
- Payment flows and single-lesson purchases stay out of scope.

---

### Task 1: Free Lesson Authorization Tests

**Files:**

- Modify: `packages/api/src/routers/authz.test.ts`

**Interfaces:**

- Consumes: current `appRouter.createCaller` test harness.
- Produces: failing tests for `courses.bySlug`, `courses.lessonBySlug`, `courses.createPlaybackToken`, and `courses.updateProgress`.

- [ ] **Step 1: Write failing API tests**

Add tests that expect:

- guest course detail reads return published lesson metadata with `isFree` and `hasActiveAccess: false`;
- guest free lesson detail succeeds and has `progress: null`;
- guest paid lesson detail fails with `FORBIDDEN`;
- guest free playback returns a token and `playbackSessionId: null`;
- signed-in free lesson progress succeeds without course access.

- [ ] **Step 2: Run tests to verify red**

Run: `vp run --filter @prive-course/api test`

Expected: fail because `isFree` is absent and free lesson APIs are still protected or grant-gated.

### Task 2: Schema And Admin Lesson Flag

**Files:**

- Modify: `packages/db/src/schema/course.ts`
- Modify: `packages/api/src/routers/admin.ts`
- Modify: `apps/web/src/components/lesson-form.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/new.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/$lessonId.tsx`
- Create: generated Drizzle migration under `packages/db/src/migrations`

**Interfaces:**

- Produces: `lesson.isFree: boolean` backed by `lesson.is_free`.
- Produces: `LessonFormValue.isFree: boolean`.

- [ ] **Step 1: Add `isFree` to schema and admin input**

Set `isFree: integer("is_free", { mode: "boolean" }).default(false).notNull()` on `lesson`, and add `isFree: z.boolean().default(false)` to lesson input.

- [ ] **Step 2: Add admin form control**

Add a Mantine `Checkbox` labeled `Free preview lesson`, include it in create/edit initial values, and submit it with lesson mutations.

- [ ] **Step 3: Generate migration**

Run: `vp run db:generate`

Expected: a migration adding `is_free` with `DEFAULT false NOT NULL`.

### Task 3: Public Free Lesson API Behavior

**Files:**

- Modify: `packages/api/src/routers/course.ts`

**Interfaces:**

- Consumes: `lesson.isFree`.
- Produces: public `bySlug`, public `lessonBySlug`, public `createPlaybackToken`, grant-gated paid access, and signed-in free progress.

- [ ] **Step 1: Implement minimal authorization helpers**

Add helpers that load published course/lesson rows, compute active course access only when a session exists, and allow access when `lesson.isFree` is true.

- [ ] **Step 2: Make course detail public**

Change `bySlug` to `publicProcedure`; return published course details, `hasActiveAccess`, and published lesson metadata including `isFree`.

- [ ] **Step 3: Make free lesson detail and playback public**

Change `lessonBySlug` and `createPlaybackToken` to public procedures. Free lessons allow null sessions; paid lessons require active access.

- [ ] **Step 4: Keep signed-in progress restricted correctly**

Keep `updateProgress` protected but allow signed-in free lesson progress without active course access.

- [ ] **Step 5: Run focused API tests**

Run: `vp run --filter @prive-course/api test`

Expected: all API tests pass.

### Task 4: Frontend Free/Gated Wiring

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/index.tsx`
- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`

**Interfaces:**

- Consumes: API lesson metadata `isFree`, course `hasActiveAccess`, free playback response with nullable `playbackSessionId`.
- Produces: visible free/gated lesson state and no regressions in existing player behavior.

- [ ] **Step 1: Show free/gated state on course detail**

Add a lesson access column with `Free`, `Included`, or `Locked` badges. Link free lessons and included paid lessons; leave locked paid lessons as text.

- [ ] **Step 2: Show free status on lesson detail**

Render a `Free preview` badge for free lessons and keep status visible.

- [ ] **Step 3: Run frontend/repo verification**

Run: `vp run check`, `vp run test`, and `vp exec react-doctor --no-telemetry -y --verbose`.

Expected: all commands exit 0.
