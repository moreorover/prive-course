# TODO

This backlog tracks intentionally open product work. Execute it in small,
reviewable steps; each checkbox should leave the app in a working state.

## Execution Rules

- [ ] Keep each implementation pass focused on one checkbox or one tightly coupled group.
- [ ] Keep backend authorization authoritative; frontend route guards and hidden UI are only UX.
- [ ] Allow guests to view published courses and free published lessons.
- [ ] Require an account only when a user needs granted access to course paid lessons.
- [ ] Keep payment flows and single-lesson purchases out of scope for this backlog.
- [ ] Use `$frontend-design` before starting the UI facelift phase.
- [ ] For frontend behavior changes, run `vp run check`, `vp run test`, and `vp exec react-doctor --no-telemetry -y --verbose`.
- [ ] For API, auth, database, or security-sensitive changes, run `vp run check`, `vp run test`, and the relevant smoke command.
- [ ] After schema changes, run `vp run db:generate` and keep generated migrations in `packages/db/src/migrations`.

## Phase 1: Public Course Catalog

- [x] Document the updated catalog access model.
  - Scope: Update `PRODUCT_FLOWS.md` so published courses are discoverable by guests, free lessons are viewable by guests, and paid lessons require an account with active course access.
  - Acceptance: The docs clearly distinguish guest-visible catalog/free content from account-required paid lesson access.
  - Validate: `vp run check`.
- [x] Add API coverage for published courses visible to guests.
  - Scope: Add or adjust course API tests before changing implementation.
  - Acceptance: Tests cover guest catalog access, published courses, unpublished courses, granted access state, and revoked access state.
  - Validate: `vp run test`.
- [x] Add a course catalog API that returns all published courses.
  - Scope: Return course summary fields for guests and include active access state when a session exists.
  - Acceptance: Draft and archived courses are excluded; guest responses do not require authentication; active access is computed server-side for signed-in users.
  - Validate: `vp run check` and `vp run test`.
- [x] Update `/courses` to show the public catalog.
  - Scope: Replace the granted-only listing with all published courses and clear access state labels.
  - Acceptance: Guests can see every published course; signed-in users can also tell which courses they already have access to.
  - Validate: `vp run check`, `vp run test`, and React Doctor.

## Phase 2: Free Lesson Access

- [x] Add a lesson-level free access field.
  - Scope: Add a boolean-style Drizzle field to lessons for free preview access.
  - Acceptance: Existing lessons default to access-gated behavior.
  - Validate: `vp run db:generate`, `vp run check`, and `vp run test`.
- [x] Add admin UI support for configuring free lessons.
  - Scope: Add the field to lesson create/edit validation, API input, and the lesson form.
  - Acceptance: Admins can mark a lesson free or gated and see the saved value when reopening the lesson.
  - Validate: `vp run check`, `vp run test`, and React Doctor.
- [x] Update course detail API authorization for free lessons.
  - Scope: Allow guests to view published course detail and published free lesson metadata without active course access.
  - Acceptance: Gated lesson metadata is visible enough to label it locked, but protected playback details are not exposed.
  - Validate: `vp run check` and `vp run test`.
- [x] Update lesson detail and playback authorization for free lessons.
  - Scope: Allow guest playback for published free lessons without active course access; keep paid lessons restricted to signed-in users with active course access.
  - Acceptance: Free lesson playback succeeds for guests, paid lesson playback requires an account with active course access, and granted users can play all published paid lessons.
  - Validate: `vp run check`, `vp run test`, and relevant smoke checks.

## Phase 3: Course Detail UX

- [x] Show course description and published lesson list for every published course.
  - Scope: Update the course detail route to work for guests, signed-in users without access, and signed-in users with active course access.
  - Acceptance: The page never implies a published course is unavailable just because access has not been granted.
  - Validate: `vp run check`, `vp run test`, and React Doctor.
- [x] Label lesson access states clearly.
  - Scope: Show free, included, and locked states in the lesson list.
  - Acceptance: Free lessons are visibly open to guests, granted-course paid lessons are visibly included, and locked paid lessons do not link to playable content.
  - Validate: `vp run check`, `vp run test`, and React Doctor.

## Phase 4: Lesson Viewing Navigation

- [x] Return ordered lesson navigation context from the lesson API.
  - Scope: Include enough published lesson summary data to render a sidebar and previous/next links.
  - Acceptance: The current lesson, previous lesson, next lesson, and locked/free states are computed consistently by the backend.
  - Validate: `vp run check` and `vp run test`.
- [x] Add previous and next lesson navigation.
  - Scope: Add navigation controls to the lesson route using TanStack Router `Link`.
  - Acceptance: Controls are disabled or absent at course boundaries and never link guests or users without access to locked paid lessons.
  - Validate: `vp run check`, `vp run test`, and React Doctor.
- [x] Add a responsive lesson viewing layout.
  - Scope: On laptop and wider viewports, show the lesson list on the left and video plus description on the right; on mobile, keep a single-column flow.
  - Acceptance: The video, lesson description, and navigation remain usable on mobile and laptop widths without fixed-width layout assumptions.
  - Validate: `vp run check`, `vp run test`, React Doctor, and `vp run smoke` when practical.
- [x] Hide implementation details from user-facing copy.
  - Scope: Remove public publish-state labels and Cloudflare Stream/tus/UID wording from public and admin UI copy.
  - Acceptance: Users see course, lesson, playback, upload, and processing states without vendor or protocol details.
  - Validate: `vp run check`, `vp run test`, and React Doctor.

## Phase 5: UI Facelift

- Constraints:
  - Existing UI can change freely when it improves the product.
  - Light and dark modes must both look intentional.
  - Prefer Mantine v9 components and props before creating custom complex components.
  - The main reading flow should be mobile-first and single-column; desktop can use two columns, but no more.

- [ ] Use `$frontend-design` to define the visual direction.
  - Scope: Establish a premium, trustworthy, clean interface direction before changing app styling.
  - Acceptance: The design direction is specific enough to guide Mantine theme, spacing, typography, and page composition.
  - Validate: Design review before implementation.
- [ ] Reposition public pages as a course marketing platform.
  - Scope: Make guest-facing course catalog and course detail pages feel product-ready for browsing, evaluating, and entering courses.
  - Acceptance: Guests can view all published courses, inspect individual course details, understand the lesson outline, and clearly distinguish free previews from locked lessons.
  - Validate: `vp run check`, `vp run test`, React Doctor, and visual review at mobile and desktop widths.
- [ ] Replace current palette with a gold-led light/dark visual system.
  - Scope: Use gold as the main accent with supporting colors that avoid a flat beige/yellow-heavy look.
  - Acceptance: CTAs, badges, section markers, focus states, and key course surfaces use the palette consistently in both light and dark modes.
  - Validate: `vp run check`, `vp run test`, and React Doctor.
- [ ] Refine global Mantine styling.
  - Scope: Update global styling in `apps/web/src/index.css` and theme-level choices rather than making components describe their own style intent.
  - Acceptance: Styling remains mobile-first, responsive, and consistent with Mantine conventions.
  - Validate: `vp run check`, `vp run test`, and React Doctor.
- [ ] Improve course and lesson surfaces.
  - Scope: Polish course cards, course detail lesson lists, locked/free indicators, empty states, and lesson playback pages.
  - Acceptance: The app feels premium, trustworthy, and clean without marketing-page treatment or decorative clutter.
  - Validate: `vp run check`, `vp run test`, React Doctor, and visual review at mobile and laptop widths.

## Deferred / Out Of Scope

- [ ] Payment flows.
- [ ] Single-lesson purchases.
- [ ] Organizations and team accounts.
- [ ] Certificates.
- [ ] Comments and discussions.
- [ ] Quizzes.
