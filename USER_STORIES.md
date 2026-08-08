# User Stories And E2E Scenarios

This file is the product behavior contract for Prive Course. It is written so
each story can become an automated e2e test without first translating a roadmap
document into test cases.

Prive Course v1 is a private video course platform with manual course access.
Admins create courses and lessons, upload protected lesson videos, publish
content, and grant or revoke course access. Students can watch paid lessons only
when they have active access to the course. Guests can browse published courses
and watch published free lessons.

In-app payments are out of scope for v1.

## How To Use This File

Each scenario has:

- **ID**: stable test identifier.
- **Status**: `Done`, `Next`, `Later`, or `Out of scope`.
- **Priority**: `P1` for critical access/security behavior, `P2` for core
  admin workflows, `P3` for learner experience, and `P4` for future growth.
- **Story**: user-facing outcome.
- **Given / When / Then**: acceptance steps that can become e2e tests.
- **Checks**: important UI, API, or security assertions.

Prefer one automated test per scenario ID. Split a scenario only when setup,
runtime, or assertions become too large for one reliable e2e test.

## Actors And Fixtures

Use these shared actors when building e2e tests:

- **Guest**: not signed in.
- **Student without access**: signed in, no active access grant for the tested
  course.
- **Student with access**: signed in, active access grant for the tested course.
- **Revoked student**: signed in, previously granted access that has been
  revoked.
- **Admin**: signed in with admin role.

Use these shared course fixtures:

- **Published course**: visible in the public catalog.
- **Draft course**: not visible in the public catalog.
- **Archived course**: not visible in the public catalog.
- **Free published lesson**: published lesson that guests may watch.
- **Paid published lesson**: published lesson requiring active course access.
- **Draft or archived lesson**: not publicly playable.
- **Stream video UID**: stored protected Cloudflare Stream asset identifier.

## Route And Security Contract

Frontend route guards improve UX. Backend authorization is the security
boundary.

Public and student routes:

```txt
/courses
/courses/$courseSlug
/courses/$courseSlug/lessons/$lessonSlug
/dashboard
/profile
```

Admin routes:

```txt
/admin
/admin/courses/new
/admin/courses/$courseId
/admin/courses/$courseId/access
/admin/courses/$courseId/lessons/new
/admin/courses/$courseId/lessons/$lessonId
```

Backend rules:

- Protected procedures require an authenticated session.
- Admin procedures require an admin role server-side.
- Guest catalog reads return only published course and allowed lesson metadata.
- Paid lesson detail, paid progress, and paid playback require active course
  access.
- Free lesson playback validates published course, published lesson, free lesson
  state, and Stream video availability before issuing a signed playback token.
- Signed-in free lesson progress validates published course, published lesson,
  and free lesson state.
- Cloudflare Stream videos are protected assets. Playback must use
  backend-issued signed playback tokens.
- Authenticated playback enforces the configured active-session policy on the
  backend.

## P1 Critical Access And Security

### `GUEST-CATALOG-001` Published Catalog Is Public

- **Status**: Done
- **Story**: As a guest, I can browse published courses without signing in.
- **Given**: at least one published course, one draft course, and one archived
  course exist.
- **When**: a guest opens `/courses`.
- **Then**: the published course is visible.
- **Checks**: draft and archived courses are not visible; protected lesson
  playback data is not exposed to the guest.

### `GUEST-COURSE-DETAIL-001` Published Course Detail Is Public

- **Status**: Done
- **Story**: As a guest, I can evaluate a published course before signing in.
- **Given**: a published course has a description, a free lesson, and a paid
  lesson.
- **When**: a guest opens `/courses/$courseSlug`.
- **Then**: the course description and published lesson outline are visible.
- **Checks**: free, included, and locked states are understandable; no in-app
  checkout action is shown for v1.

### `GUEST-FREE-LESSON-001` Guest Can Watch Free Lesson

- **Status**: Done
- **Story**: As a guest, I can watch a published free lesson.
- **Given**: a published course has a published free lesson with a Stream video
  UID.
- **When**: a guest opens `/courses/$courseSlug/lessons/$lessonSlug`.
- **Then**: the video player loads using a backend-issued signed playback token.
- **Checks**: no sign-in is required; no account progress is created; no
  account watermark is shown.

### `GUEST-LOCKED-LESSON-001` Guest Cannot Watch Paid Lesson

- **Status**: Done
- **Story**: As a guest, I cannot watch paid lessons without course access.
- **Given**: a published course has a published paid lesson.
- **When**: a guest opens the paid lesson route or requests paid playback.
- **Then**: playable video content is not available.
- **Checks**: backend token request fails or requires sign-in; protected Stream
  details are not returned; UI shows a locked access state.

### `STUDENT-PAID-LESSON-001` Granted Student Can Watch Paid Lesson

- **Status**: Done
- **Story**: As a student with active course access, I can watch paid lessons in
  that course.
- **Given**: a student has active access to a published course with a published
  paid lesson and Stream video UID.
- **When**: the student opens the paid lesson route.
- **Then**: the video player loads using a backend-issued signed playback token.
- **Checks**: paid lesson state appears included; authenticated playback session
  tracking starts when required.

### `STUDENT-ACCESS-REVOKED-001` Revoked Student Cannot Watch Paid Lesson

- **Status**: Done
- **Story**: As a revoked student, I lose access to paid lessons immediately.
- **Given**: a student previously had access to a course and an admin revokes
  that access.
- **When**: the student refreshes the course page, opens a paid lesson, or
  requests a new playback token.
- **Then**: paid playback is denied.
- **Checks**: stale UI state cannot obtain a token; course detail shows locked
  paid lessons after revocation.

### `AUTHZ-ADMIN-001` Non-Admin Cannot Use Admin APIs

- **Status**: Done
- **Story**: As the backend, I reject admin operations from non-admin users.
- **Given**: a signed-in non-admin user exists.
- **When**: the user opens `/admin` or calls an admin procedure.
- **Then**: admin access is denied.
- **Checks**: client route visibility is not the security boundary; server-side
  admin role checks are enforced.

### `PLAYBACK-SESSION-001` Second Protected Playback Session Is Blocked

- **Status**: Done
- **Story**: As a student, I cannot watch the same protected lesson in multiple
  active sessions when policy forbids it.
- **Given**: a student with access has an active paid lesson playback session.
- **When**: the same student starts playback for the same lesson in another
  browser session.
- **Then**: the second active playback session is denied.
- **Checks**: heartbeats keep the first session active; enforcement happens on
  the backend.

## P2 Admin Content And Access Workflows

### `ADMIN-CONTENT-001` Admin Creates And Publishes Course

- **Status**: Done
- **Story**: As an admin, I can create, edit, and publish a course.
- **Given**: an admin is signed in.
- **When**: the admin creates a course, fills required fields, and publishes it.
- **Then**: the course appears in the public catalog.
- **Checks**: required fields validate; draft courses stay hidden until
  published.

### `ADMIN-CONTENT-002` Admin Manages Lessons

- **Status**: Done
- **Story**: As an admin, I can create, edit, reorder, publish, and archive
  lessons under a course.
- **Given**: an admin is editing a course.
- **When**: the admin creates multiple lessons, changes their order, and
  publishes them.
- **Then**: public course detail and lesson navigation use the saved order.
- **Checks**: archived or draft lessons are not publicly playable.

### `ADMIN-LESSON-ACCESS-001` Admin Configures Free Or Paid Lesson

- **Status**: Done
- **Story**: As an admin, I can mark a lesson as free or access-gated.
- **Given**: an admin is editing a published lesson.
- **When**: the admin marks the lesson free.
- **Then**: guests can open and watch that lesson.
- **Checks**: changing the lesson back to paid prevents guest playback.

### `ADMIN-UPLOAD-001` Admin Starts Protected Video Upload

- **Status**: Done
- **Story**: As an admin, I can upload lesson videos directly to Cloudflare
  Stream.
- **Given**: an admin is editing a lesson draft.
- **When**: the admin starts a video upload.
- **Then**: the backend creates a direct tus upload URL and the browser uploads
  directly to Cloudflare Stream.
- **Checks**: large video files are not proxied through the Worker; external
  provider responses are validated before fields are trusted; admin UI shows
  upload and processing state.

### `ADMIN-ACCESS-001` Admin Grants Course Access

- **Status**: Done
- **Story**: As an admin, I can grant a student access to a course.
- **Given**: a student account and a published paid course exist.
- **When**: an admin finds the student by email or name and grants access.
- **Then**: the student can open paid lessons in that course.
- **Checks**: access change is reflected in course detail, lesson detail, and
  playback authorization.

### `ADMIN-ACCESS-002` Admin Revokes Course Access

- **Status**: Done
- **Story**: As an admin, I can revoke a student's course access.
- **Given**: a student has active access to a paid course.
- **When**: an admin revokes that access.
- **Then**: the student can no longer open paid lesson playback.
- **Checks**: revocation affects new token requests immediately.

## P3 Learner Experience

### `STUDENT-COURSE-DETAIL-001` Course Detail Shows Access State

- **Status**: Done
- **Story**: As a student, I can tell which lessons are available to me.
- **Given**: a published course has free and paid lessons.
- **When**: a student without access opens course detail.
- **Then**: free lessons are available and paid lessons are locked.
- **Checks**: locked lessons do not link to playable paid content.

### `STUDENT-COURSE-DETAIL-002` Granted Course Detail Shows Included Lessons

- **Status**: Done
- **Story**: As a student with access, I can see paid lessons as included in my
  course access.
- **Given**: a student has active access to a published course.
- **When**: the student opens course detail.
- **Then**: paid published lessons are shown as included.
- **Checks**: lesson links open playable lesson pages.

### `LESSON-NAV-001` Lesson Navigation Respects Access

- **Status**: Done
- **Story**: As a learner, I can move between accessible lessons without being
  linked into locked content.
- **Given**: a course has ordered free and paid published lessons.
- **When**: a guest or student without access views a free lesson.
- **Then**: previous and next links only target accessible lessons.
- **Checks**: a student with access can navigate through all published lessons;
  navigation respects course boundaries.

### `LESSON-LAYOUT-001` Lesson Page Works On Mobile And Desktop

- **Status**: Done
- **Story**: As a learner, I can use the lesson page on mobile and desktop.
- **Given**: a published accessible lesson exists.
- **When**: the lesson page is opened on mobile and desktop viewport sizes.
- **Then**: the player, lesson list, and navigation remain usable.
- **Checks**: text does not overlap; controls remain reachable; light and dark
  modes remain readable.

### `PROGRESS-001` Signed-In Student Resumes Lesson

- **Status**: Done
- **Story**: As a signed-in student, I can resume a lesson from my latest saved
  position.
- **Given**: a signed-in student can access a lesson.
- **When**: the student watches part of the lesson, leaves, and returns later.
- **Then**: playback resumes from the saved position.
- **Checks**: paid lesson progress requires active course access; free lesson
  progress validates published free lesson state.

### `PROGRESS-002` Completed Lesson Stays Completed

- **Status**: Done
- **Story**: As a signed-in student, my completed lessons remain completed.
- **Given**: a signed-in student has completed a lesson.
- **When**: the student later replays a shorter segment.
- **Then**: the lesson remains completed.
- **Checks**: backend only moves stored progress forward unless reset behavior
  is intentionally added.

### `PROGRESS-003` Guest Free Playback Has No Account Progress

- **Status**: Done
- **Story**: As a guest, I can watch free lessons without saved account progress.
- **Given**: a published free lesson exists.
- **When**: a guest watches the free lesson.
- **Then**: no user-bound progress is created.
- **Checks**: signing in later does not inherit anonymous progress unless a
  future feature explicitly supports it.

### `PUBLIC-UI-001` Public UI Is Product-Ready

- **Status**: Done
- **Story**: As a visitor, I can evaluate courses through a polished public UI.
- **Given**: public catalog and course detail data exist.
- **When**: the pages render on mobile and desktop in light and dark modes.
- **Then**: course cards, lesson states, empty states, and playback entry points
  are visually consistent.
- **Checks**: user-facing copy does not mention Cloudflare Stream, tus, UIDs, or
  internal implementation details.

## P4 Later And Future Growth

### `ACCESS-REQUEST-001` Manual Access Request Copy Is Clear

- **Status**: Next
- **Story**: As an interested guest, I can understand how to request course
  access outside the app.
- **Given**: a paid course is published.
- **When**: a guest sees locked course or lesson access.
- **Then**: the UI shows clear external contact instructions.
- **Checks**: copy is centralized enough to change later; the UI does not imply
  that in-app checkout exists.

### `ADMIN-METRICS-001` Admin Sees Access Counts

- **Status**: Later
- **Story**: As an admin, I can see current access counts for a course.
- **Given**: a course has granted, revoked, and never-granted students.
- **When**: an admin opens course metrics.
- **Then**: the access counts distinguish those states.
- **Checks**: metrics are not exposed to non-admin users.

### `ADMIN-METRICS-002` Admin Sees Lesson Engagement

- **Status**: Later
- **Story**: As an admin, I can see lesson watch and completion activity.
- **Given**: signed-in students have watched lessons.
- **When**: an admin opens lesson metrics.
- **Then**: approximate watch time and completion behavior are visible.
- **Checks**: metrics are based on backend-owned playback or progress events;
  anonymous guest free-lesson views are handled separately.

### `PAYMENT-FUTURE-001` Future Payments Grant Course Access

- **Status**: Later
- **Story**: As a future customer, I may be able to purchase course access in
  the app.
- **Given**: in-app payments are added in a future version.
- **When**: a payment is confirmed.
- **Then**: course access is created or updated for the buyer.
- **Checks**: payment status is connected to course access; single-lesson
  purchases remain out of scope unless explicitly added.

## Out Of Scope For V1

These stories are intentionally excluded unless the product direction changes:

- In-app checkout.
- Single-lesson purchases.
- Organizations and team accounts.
- Certificates.
- Comments and discussions.
- Quizzes.
- Public video assets that bypass backend-issued signed playback tokens.
