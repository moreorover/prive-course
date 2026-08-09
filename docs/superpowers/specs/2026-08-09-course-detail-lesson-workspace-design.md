# Course Detail And Lesson Workspace Design

## Status

Approved direction: Product Detail + Learning Workspace.

This spec extends the Product Atelier SaaS overwrite. The homepage now presents the platform as a three-course product system; individual course pages and lesson pages should carry the same structural quality instead of remaining header/list/player compositions.

## Design Read

This is a product-page and learning-workspace redesign for beauty course buyers and enrolled students. The course page should feel like a premium SaaS product detail page for one course. The lesson page should feel like a focused private learning workspace, not a generic video page.

Design dials:

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 5`

Stack direction:

- Use React, Vite, TanStack Router, Mantine, and custom CSS.
- Do not add Tailwind CSS.
- Keep existing routes, loaders, tRPC contracts, access checks, playback token behavior, progress behavior, and server authorization intact.

## Current Problem

The current course detail page has the correct behavior but still reads structurally as:

- Page header
- Lesson outline
- Access summary card

The current lesson page has the correct behavior but still reads structurally as:

- Page header
- Previous/next buttons
- Video player
- Previous/next buttons
- Notes
- Sidebar lesson list

These pages need the same level of structural redesign as the homepage. The goal is not more decoration; the goal is stronger page architecture, clearer hierarchy, and a learning flow that feels intentional.

## Course Page Target Structure

### 1. Product Hero

Purpose: make one course feel like a complete product.

Required content:

- Course title.
- Course description.
- Access status.
- Lesson count.
- Free preview count.
- Primary CTA:
  - `Start learning` when a lesson can be opened.
  - `Sign in for access` when the user must authenticate.
- Secondary CTA to the syllabus.

Structural requirements:

- Use an asymmetric split layout.
- Do not rely on `PageHeader` alone as the main hero.
- The right-side product panel should summarize access, lesson count, previews, and course grant state.
- The hero should make it obvious whether the visitor is previewing, signed in, or has active access.

### 2. Course Outcomes

Purpose: explain why this course matters before showing the syllabus.

Required content:

- Three concise outcome blocks.
- Outcomes can be generic when course-specific metadata is unavailable:
  - Build a cleaner service method.
  - Understand what is included before starting.
  - Continue through protected private lessons.

Structural requirements:

- Use a horizontal strip on desktop and stacked blocks on mobile.
- Do not use large generic marketing cards.

### 3. Syllabus

Purpose: present lessons as a structured curriculum.

Required content per lesson:

- Position.
- Lesson title.
- Duration or duration pending.
- Access state: free, included, locked.
- Link only when the lesson is open.

Structural requirements:

- Keep `LessonRow` behavior or an equivalent shared component.
- Add stronger section framing so the syllabus feels like a course module list.
- Empty state remains when no lessons exist.

### 4. Sticky Access Panel

Purpose: keep access state and next action visible.

Required content:

- Access status badge.
- Lesson count.
- Free preview count.
- Next action.
- Basic + Pro includes Basic note.

Structural requirements:

- Sticky on desktop.
- Normal flow on mobile.
- Must not imply checkout or automatic purchase logic.

## Lesson Page Target Structure

### 1. Learning Workspace Top Rail

Purpose: replace generic page header with workspace orientation.

Required content:

- Back to course link.
- Course title.
- Lesson title.
- Lesson status: free preview or protected playback.
- Saved progress when available through existing player UI.

Structural requirements:

- Compact enough that the player remains the page focus.
- Avoid oversized marketing headline treatment.

### 2. Player-First Layout

Purpose: make the video the primary learning surface.

Required content:

- Existing `LessonPlayer`.
- Existing protected playback start behavior.
- Existing no-video state.
- Existing active playback state, watermark, heartbeat, progress save, and retry behavior.

Structural requirements:

- Do not change playback-token creation or heartbeat/progress logic.
- Put player and primary navigation in one learning panel.
- Avoid repeating previous/next controls above and below the player.

### 3. Lesson Queue

Purpose: turn the sidebar lesson list into a learning queue.

Required content:

- Current lesson highlighted.
- Free/included/locked state.
- Position and duration.
- Course outline count.

Structural requirements:

- Sticky on desktop.
- Normal stacked panel on mobile.
- Rows must not resize unpredictably.
- Locked lessons stay non-links.

### 4. Lesson Notes

Purpose: make supporting lesson text easier to scan.

Required content:

- Description when available.
- No panel when no description exists.

Structural requirements:

- Notes sit below the player panel.
- Use a clear label such as `Lesson notes`.

### 5. Access Error Page

Purpose: make locked lesson errors consistent with the redesigned course page.

Required content:

- Locked state.
- Explanation that course access is required.
- Sign-in CTA.
- Back to course CTA.

Structural requirements:

- Should feel like part of Product Atelier, not a default error page.

## Implementation Boundaries

In scope:

- `apps/web/src/routes/courses/$courseSlug/index.tsx`
- `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`
- `apps/web/src/features/course/lesson-navigation.tsx`
- `apps/web/src/features/course/lesson-player-ui.tsx` only if panel framing/copy needs small adjustments.
- `apps/web/src/components/ui/lesson-row.tsx` only if the row needs variant/current-state support.
- `apps/web/src/index.css`

Out of scope:

- Payment or checkout UI.
- New access-management rules.
- New course metadata fields.
- New backend endpoints.
- Changing route slugs.
- Changing Cloudflare Stream token, heartbeat, watermark, or progress-save logic.
- Redesigning admin pages again.
- Redesigning the homepage again.

## Data And Behavior

Course page:

- Keep `trpc.courses.bySlug`.
- Keep route loader with `context.queryClient.ensureQueryData`.
- Keep `firstAccessibleLesson` behavior.
- Keep lesson access derivation:
  - free lesson: open
  - active course access: included/open
  - otherwise locked

Lesson page:

- Keep `trpc.courses.lessonBySlug`.
- Keep route loader with `context.queryClient.ensureQueryData`.
- Keep `LessonPlayer` props and progress invalidation.
- Keep `LessonError` access handling.

## Verification Expectations

Before completion:

- Run `vp run check-types`.
- Run `vp exec knip --reporter github-actions`.
- Run `vp run test`.
- Run React Doctor.
- Run browser visual checks for:
  - one course detail page, desktop and mobile, when local data allows.
  - one lesson page, desktop and mobile, when local data allows.
  - locked lesson error page if it can be reached locally.

Visual checks must confirm:

- No horizontal overflow.
- No overflowing buttons.
- Course hero is not just `PageHeader`.
- Course page has product hero, outcomes, syllabus, and sticky access panel.
- Lesson page has compact workspace rail, player-first panel, lesson queue, and notes when available.
