# Course Detail And Lesson Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild individual course detail pages and lesson pages into Product Atelier product-detail and learning-workspace experiences without changing data, access, playback, or routing behavior.

**Architecture:** Keep the current TanStack Router routes and tRPC query boundaries, but replace the page compositions with explicit product hero, outcomes, syllabus, sticky access panel, workspace rail, player panel, lesson queue, and notes sections. Use Mantine for controls and feedback while adding custom CSS classes in `apps/web/src/index.css` for layout, spacing, and responsive behavior.

**Tech Stack:** React, Vite, TanStack Router, TanStack Query, Mantine, Sonner, lucide-react, tRPC, Cloudflare Stream player, custom CSS.

## Global Constraints

- Use React, Vite, TanStack Router, Mantine, and custom CSS.
- Do not add Tailwind CSS.
- Keep existing routes, loaders, tRPC contracts, access checks, playback token behavior, progress behavior, and server authorization intact.
- Do not add payment or checkout UI.
- Do not add new access-management rules.
- Do not add new course metadata fields.
- Do not add new backend endpoints.
- Do not change route slugs.
- Do not change Cloudflare Stream token, heartbeat, watermark, or progress-save logic.
- Do not redesign admin pages again.
- Do not redesign the homepage again.
- Run `vp run check-types`, `vp exec knip --reporter github-actions`, `vp run test`, React Doctor, and browser visual checks before completion.

---

## File Structure

Modify:

- `apps/web/src/routes/courses/$courseSlug/index.tsx`: replace the header/list/access-card course detail composition with product hero, outcome strip, syllabus module, and sticky access panel.
- `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`: replace the generic lesson header/nav/player/nav/sidebar composition with learning workspace top rail, player-first panel, queue, notes, and redesigned access-error state.
- `apps/web/src/features/course/lesson-navigation.tsx`: update lesson queue header and navigation controls so they work inside the new workspace panel.
- `apps/web/src/features/course/lesson-player-ui.tsx`: keep playback behavior, adjust panel class names and copy only if needed for the new workspace frame.
- `apps/web/src/components/ui/lesson-row.tsx`: keep link/locked behavior, add only small class hooks if current implementation is insufficient.
- `apps/web/src/index.css`: add course-product and learning-workspace CSS classes.

Do not modify:

- `apps/web/src/routeTree.gen.ts`
- `apps/web/src/features/course/lesson-player.tsx` unless a type integration requires it.
- Any backend packages.

---

### Task 1: Course Detail Product Page

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/index.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes:
  - `courseQueryOptions(courseSlug: string)`
  - `course.data.lessons`
  - `course.data.hasActiveAccess`
  - `LessonRow`
  - `StatusBadge`
  - `Surface`
- Produces:
  - `.pc-course-product`
  - `.pc-course-product-hero`
  - `.pc-course-product-hero__copy`
  - `.pc-course-product-hero__panel`
  - `.pc-course-outcomes`
  - `.pc-course-outcome`
  - `.pc-course-syllabus`
  - `.pc-course-access-card`

- [ ] **Step 1: Replace the top-level course detail layout**

  In `apps/web/src/routes/courses/$courseSlug/index.tsx`, keep:

  - `courseQueryOptions`
  - route loader
  - `courseSlug`
  - `course`
  - `lessons`
  - `firstAccessibleLesson`
  - `freeLessonCount`

  Replace the returned `Stack` structure with:

  ```tsx
  <div className="pc-course-product">
    <section className="pc-course-product-hero">...</section>
    <section className="pc-course-outcomes">...</section>
    <div className="pc-detail-layout">...</div>
  </div>
  ```

- [ ] **Step 2: Build the product hero**

  Use an asymmetric split hero. The left side contains:

  - back link to `/courses`
  - eyebrow `Private course`
  - course title
  - course description fallback
  - primary CTA:
    - `Start learning` linking to first accessible lesson when present
    - `Sign in for access` linking to `/login` otherwise
  - secondary anchor button to `#syllabus`

  The right side is `Surface variant="raised"` with:

  - access badge
  - `lessons.length`
  - `freeLessonCount`
  - copy explaining preview vs active access

- [ ] **Step 3: Add course outcome strip**

  Add three inline outcome articles:

  ```ts
  const courseOutcomes = [
    {
      title: "Build a cleaner service method",
      description:
        "Move through the course with a structured lesson order instead of scattered tips.",
    },
    {
      title: "Know what opens now",
      description:
        "Free previews, included lessons, and locked lessons are visible before you start.",
    },
    {
      title: "Continue inside protected lessons",
      description: "Private playback and account access keep the learning experience contained.",
    },
  ];
  ```

  Render these in `.pc-course-outcomes`.

- [ ] **Step 4: Reframe the syllabus**

  Change the lesson section to:

  ```tsx
  <section id="syllabus" className="pc-course-syllabus">
    <div className="pc-course-syllabus__header">...</div>
    ...
  </section>
  ```

  Keep the same `LessonRow` access derivation and linking behavior.

- [ ] **Step 5: Build the sticky access panel**

  Replace the existing `pc-access-panel` use with `pc-course-access-card pc-access-panel`. Include:

  - `Private access`
  - lesson count
  - free preview count
  - status badge
  - next action button
  - Basic + Pro includes Basic note

  The next action button must use the same decision as the hero CTA.

- [ ] **Step 6: Add CSS**

  Add CSS in `apps/web/src/index.css`:

  ```css
  .pc-course-product {
  }
  .pc-course-product-hero {
  }
  .pc-course-product-hero__copy {
  }
  .pc-course-product-hero__panel {
  }
  .pc-course-product-hero__stats {
  }
  .pc-course-outcomes {
  }
  .pc-course-outcome {
  }
  .pc-course-syllabus {
  }
  .pc-course-syllabus__header {
  }
  .pc-course-access-card {
  }
  ```

  Requirements:

  - Desktop hero uses two columns.
  - Outcome strip uses three columns on desktop and one column on mobile.
  - Access panel is sticky on desktop and normal flow under `64rem`.
  - No horizontal overflow at `390px` width.

- [ ] **Step 7: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 8: Commit**

  ```bash
  git add 'apps/web/src/routes/courses/$courseSlug/index.tsx' apps/web/src/index.css
  git commit -m "feat: redesign course detail as product page"
  ```

---

### Task 2: Lesson Workspace Route

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`
- Modify: `apps/web/src/features/course/lesson-navigation.tsx`
- Modify: `apps/web/src/features/course/lesson-player-ui.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes:
  - `lessonQueryOptions(courseSlug: string, lessonSlug: string)`
  - `LessonPlayer`
  - `LessonList`
  - `LessonNavControls`
  - `queryClient.invalidateQueries`
- Produces:
  - `.pc-learning-workspace`
  - `.pc-learning-rail`
  - `.pc-learning-rail__content`
  - `.pc-learning-rail__meta`
  - `.pc-learning-stage`
  - `.pc-learning-stage__header`
  - `.pc-learning-stage__nav`
  - `.pc-learning-notes`
  - `.pc-lesson-queue`

- [ ] **Step 1: Keep lesson data and playback behavior unchanged**

  In `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`, keep:

  - route loader
  - `lessonQueryOptions`
  - `lesson = useQuery(...)`
  - `LessonPlayer` props exactly equivalent to the current props
  - progress invalidation with `trpc.courses.lessonBySlug.queryKey({ courseSlug, lessonSlug })`

- [ ] **Step 2: Replace the generic lesson page composition**

  Replace:

  - `PageHeader`
  - top `LessonNavControls`
  - `LessonPlayer`
  - bottom `LessonNavControls`
  - optional notes
  - sidebar list

  With:

  ```tsx
  <div className="pc-learning-workspace">
    <section className="pc-learning-stage">
      <div className="pc-learning-rail">...</div>
      <Surface className="pc-learning-stage__panel">...</Surface>
      {lesson.data.lesson.description ? <Surface className="pc-learning-notes">...</Surface> : null}
    </section>
    <LessonList courseSlug={courseSlug} lessons={lesson.data.navigation.lessons} />
  </div>
  ```

- [ ] **Step 3: Build the compact workspace top rail**

  The rail must include:

  - back link to the course
  - eyebrow `Learning workspace`
  - lesson title
  - course title
  - badge `Free preview` or `Protected playback`

  Keep title sizes compact enough that the player stays the page focus.

- [ ] **Step 4: Place navigation once**

  Put `LessonNavControls` inside the player stage header or immediately under the rail, only once.

  Do not render duplicate previous/next controls above and below the player.

- [ ] **Step 5: Update `LessonList` as a queue**

  In `apps/web/src/features/course/lesson-navigation.tsx`, change visible copy:

  - eyebrow: `Learning queue`
  - title: `Course lessons`

  Keep:

  - current lesson class
  - locked lessons as non-links
  - position, duration, and status behavior

- [ ] **Step 6: Add CSS**

  Add CSS in `apps/web/src/index.css`:

  ```css
  .pc-learning-workspace {
  }
  .pc-learning-rail {
  }
  .pc-learning-rail__content {
  }
  .pc-learning-rail__meta {
  }
  .pc-learning-stage {
  }
  .pc-learning-stage__panel {
  }
  .pc-learning-stage__header {
  }
  .pc-learning-stage__nav {
  }
  .pc-learning-notes {
  }
  .pc-lesson-queue {
  }
  ```

  Requirements:

  - Desktop layout uses wide player column plus right queue.
  - Mobile layout stacks rail, player, notes, queue.
  - Player panel has stable width and no layout jump.
  - Buttons wrap without overflow.

- [ ] **Step 7: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 8: Commit**

  ```bash
  git add 'apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx' apps/web/src/features/course/lesson-navigation.tsx apps/web/src/features/course/lesson-player-ui.tsx apps/web/src/index.css
  git commit -m "feat: redesign lesson page as learning workspace"
  ```

---

### Task 3: Locked Lesson Error Experience

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes:
  - `LessonError`
  - `isCourseAccessError(error)`
  - `Route.useParams()`
- Produces:
  - `.pc-lesson-error`
  - `.pc-lesson-error__panel`
  - `.pc-lesson-error__actions`

- [ ] **Step 1: Redesign non-access error fallback lightly**

  Keep the non-access error content but wrap it in a Product Atelier style panel. Do not hide the actual error message.

- [ ] **Step 2: Redesign course-access error**

  Replace the current `PageHeader` + `Surface` structure with:

  ```tsx
  <PageShell>
    <section className="pc-lesson-error">
      <Surface className="pc-lesson-error__panel">...</Surface>
    </section>
  </PageShell>
  ```

  Include:

  - locked badge
  - heading `This lesson is part of a private course`
  - explanation that course access is required
  - sign-in CTA
  - back to course CTA

- [ ] **Step 3: Add CSS**

  Add CSS for centered but not generic error state:

  ```css
  .pc-lesson-error {
  }
  .pc-lesson-error__panel {
  }
  .pc-lesson-error__actions {
  }
  ```

  Requirements:

  - Panel width is constrained.
  - Buttons wrap on mobile.
  - No horizontal overflow.

- [ ] **Step 4: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 5: Commit**

  ```bash
  git add 'apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx' apps/web/src/index.css
  git commit -m "feat: align locked lesson error state"
  ```

---

### Task 4: Final Verification And PR Update

**Files:**

- Modify only if verification reveals defects.

**Interfaces:**

- Consumes: all previous tasks.
- Produces: pushed branch and PR #11 updated.

- [ ] **Step 1: Run source verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  vp run test
  vp exec react-doctor --no-telemetry -y --verbose
  ```

  Expected:

  - type/build passes
  - Knip exits 0
  - tests pass
  - React Doctor reports no issues

- [ ] **Step 2: Run repo check if unrelated local files are not blocking it**

  Run:

  ```bash
  vp run check
  ```

  Expected: pass when only repo source files are considered.

  If it fails only because of existing unrelated untracked `.agents/skills/*` or `skills-lock.json` files, record the exact file and do not edit those user-owned files.

- [ ] **Step 3: Run smoke**

  Run:

  ```bash
  vp run smoke
  ```

  Expected: pass, unless the existing dev smoke limitations recur. If it fails, record whether failures are the known dev HTML static asset check or protected API invalid-input-before-auth check.

- [ ] **Step 4: Start local dev stack for visual QA**

  Run in separate sessions:

  ```bash
  vp run dev:web
  vp run dev:server
  ```

  Expected:

  - web available at local Vite URL
  - server available on `http://localhost:3000`

- [ ] **Step 5: Visual check course page**

  Use browser automation or manual browser inspection for a real course slug when local data exists.

  Confirm:

  - no horizontal overflow at desktop and `390px`
  - no overflowing buttons
  - hero is a product hero, not only `PageHeader`
  - outcomes strip exists
  - syllabus exists
  - access panel is sticky on desktop and normal flow on mobile

- [ ] **Step 6: Visual check lesson page**

  Use browser automation or manual browser inspection for a real lesson route when local data exists.

  Confirm:

  - no horizontal overflow at desktop and `390px`
  - no overflowing buttons
  - workspace rail exists
  - player is the primary stage
  - previous/next controls appear once
  - lesson queue is visible
  - notes render below the player when description exists

- [ ] **Step 7: Fix verification defects**

  If any defect is caused by this work, make the smallest focused fix and rerun the failing command or visual check.

- [ ] **Step 8: Commit verification fixes if needed**

  ```bash
  git add apps/web/src
  git commit -m "fix: polish course lesson workspace"
  ```

- [ ] **Step 9: Push**

  ```bash
  git push
  ```

- [ ] **Step 10: Check PR status**

  Run:

  ```bash
  gh pr checks 11
  ```

  Expected: Source Build and React Doctor are passing or pending on the new head commit.

---

## Self-Review

Spec coverage:

- Course product hero, outcomes, syllabus, and sticky access panel are covered in Task 1.
- Learning workspace rail, player-first layout, single navigation placement, queue, and notes are covered in Task 2.
- Locked lesson error page is covered in Task 3.
- Data and behavior constraints are carried through each task and global constraints.
- Final source and visual verification are covered in Task 4.

Placeholder scan:

- No placeholder instructions are intentionally used.
- Each task has explicit files, interfaces, steps, verification commands, and commit commands.

Type consistency:

- CSS class names introduced in task interfaces match the task CSS steps.
- Existing component names and route paths match the current codebase.
