# User Stories And Product Roadmap

This file is the product story map for Prive Course. It tracks completed
behavior, future product stages, and the end-to-end scenarios that should be
covered by automated smoke or e2e tests.

## Status Legend

- **Done**: implemented or already represented in the current backlog as complete.
- **Next**: should be prioritized in the next implementation stages.
- **Later**: planned, but not needed for the next working product milestone.
- **Out of scope**: intentionally excluded unless the product direction changes.

## Current Product Model

Prive Course v1 is a private video course platform with manual course access
management.

- Guests can discover published courses and watch published free lessons.
- Students can sign in and watch paid lessons only when an admin has granted
  active access to the course.
- Admins create courses and lessons, upload protected videos, publish content,
  and grant or revoke course access.
- Cloudflare Stream videos are protected assets. Playback must use backend-issued
  signed playback tokens.
- In-app payments are not part of v1. Until payment flows exist, course pages can
  direct interested users to contact the admin externally, such as through
  Instagram.

## Runtime Flows And Route Shapes

These flows define how the story map is expected to work in the application.
They are part of this file so product behavior, roadmap stages, and e2e
expectations stay in one source of truth.

### Admin Flow

Admin users can:

1. Sign in with email/password or passkey.
2. Open `/admin`.
3. Create, edit, publish, archive, and list courses.
4. Create, edit, reorder, publish, archive, and list lessons under a course.
5. Upload lesson videos to Cloudflare Stream through direct creator uploads.
6. View video upload and processing status in the lesson editor.
7. Search users from a course access screen.
8. Grant a user access to a course.
9. Revoke a user's course access.
10. Use the profile page for account, password, passkey, and session management.

Admin route shape:

```txt
/admin
/admin/courses/new
/admin/courses/$courseId
/admin/courses/$courseId/access
/admin/courses/$courseId/lessons/new
/admin/courses/$courseId/lessons/$lessonId
```

Admin APIs must use server-side admin authorization. Frontend route visibility
is not a security boundary.

### Public Catalog And Student Flow

Public visitors and students can:

1. Open `/courses`.
2. See published courses without signing in.
3. Open a published course detail page without signing in.
4. See published lesson lists with clear free, included, or locked access states.
5. Open and watch published free lessons without signing in.
6. Register or sign in when they need access to paid lessons.
7. Open paid published lessons only when their account has active course access.
8. Resume playback from saved progress after signing in, when the lesson supports
   progress for that user.
9. Complete accessible signed-in lessons while the backend preserves completed
   progress.

Public and student route shape:

```txt
/courses
/courses/$courseSlug
/courses/$courseSlug/lessons/$lessonSlug
/dashboard
/profile
```

Published course summary and detail APIs may allow guest reads. Paid lesson and
paid playback operations must validate the authenticated session and active
course access server-side. Progress writes are signed-in only: paid lesson
progress requires active course access, while free lesson progress requires the
backend to validate published course, published lesson, and free lesson state.

### Video Upload Flow

Lesson uploads use Cloudflare Stream direct creator uploads with tus chunks.
Large video files must not be proxied through the application Worker.

Flow:

1. Admin creates or opens a lesson draft.
2. Admin starts a video upload from the lesson editor.
3. Backend creates a Cloudflare Stream tus upload URL with signed playback URL
   requirements.
4. Browser uploads the video directly to Cloudflare Stream in tus chunks.
5. Backend stores the resulting Stream video UID on the lesson.
6. Admin UI shows upload progress and processing status.
7. Admin publishes the lesson when content and video state are ready.

### Video Playback Flow

Playback uses backend-issued Cloudflare Stream signed tokens. Stream videos are
not public assets.

Flow:

1. Visitor opens a lesson route.
2. Frontend requests a playback token for the lesson.
3. Backend validates:
   - course is published
   - lesson is published
   - lesson has a Stream video UID
   - free lessons allow guest playback
   - paid lessons require an authenticated session with active course access
   - playback concurrency policy when an authenticated playback session exists
4. Backend creates a Cloudflare Stream signed playback token.
5. Frontend loads the protected player with the signed token.
6. For authenticated playback sessions, frontend sends playback heartbeats.
7. For authenticated playback sessions, backend records active playback state.
8. For signed-in users, frontend buffers progress locally and flushes progress to
   the API on page leave or unmount.
9. Backend only moves stored progress forward and preserves completed lessons.

Guest free playback receives a backend-issued signed token, but it does not
create user-bound progress, account watermarking, or per-user playback-session
enforcement. Account-specific playback controls apply after sign-in.

Playback protection:

```txt
- backend-issued signed playback tokens
- authenticated playback: 1 active playback session per user/lesson policy
- authenticated playback: heartbeat-based active session tracking
- authenticated playback: visible account watermark in the protected player
- guest free playback: no account watermark or saved progress until sign-in
```

### Route Guards And Authorization

The project security rule is:

```txt
Frontend decides what to show.
Backend decides what is allowed.
```

Client route guards improve UX:

- Guests can open public catalog and published course detail routes.
- Guests are redirected to `/login` only when they try to access
  account-required surfaces.
- Non-admin users cannot use admin screens.
- Users without active course access should see locked paid lesson states
  instead of playable paid content.

Backend checks are authoritative:

- Protected tRPC procedures require an authenticated session.
- Admin procedures require an admin user role.
- Guest-readable catalog procedures return only published course and allowed
  lesson metadata.
- Paid lesson, paid progress, and paid playback procedures validate active course
  access.
- Signed-in free lesson progress validates published course, published lesson,
  and free lesson state.
- Free lesson playback validates published course, published lesson, and free
  lesson state before issuing signed playback tokens.

## Story Map By Stage

### Stage 1: Public Course Discovery

Status: **Done**

Goal: let guests and signed-in users browse the public course catalog.

User stories:

- As a guest, I can see all published courses on the platform.
- As a guest, I cannot see draft or archived courses.
- As a signed-in student, I can see all published courses.
- As a signed-in student, I can tell which published courses I already have
  access to.
- As an admin, I can publish or unpublish courses through course status changes.

Acceptance scenarios:

- Published courses appear on `/courses` without requiring sign-in.
- Draft and archived courses do not appear in the public catalog.
- Signed-in users see server-computed course access state.
- Guest-visible course data does not expose protected lesson playback data.

E2E candidates:

- `GUEST-CATALOG-001`: guest opens `/courses` and sees published courses.
- `GUEST-CATALOG-002`: guest does not see draft or archived courses.
- `STUDENT-CATALOG-001`: signed-in student sees access labels for published
  courses.
- `ADMIN-COURSE-001`: admin changes a course from draft to published and it
  appears in the public catalog.

### Stage 2: Free Lesson Access

Status: **Done**

Goal: allow free published lessons to work as public previews while paid lessons
remain protected.

User stories:

- As a guest, I can see which published lessons are free to watch.
- As a guest, I can open and watch a published free lesson.
- As a guest, I cannot watch a paid lesson without course access.
- As a student with active course access, I can watch free and paid published
  lessons in that course.
- As an admin, I can mark each lesson as free or access-gated.

Acceptance scenarios:

- Published free lessons can issue playback tokens for guests.
- Paid lesson playback requires a signed-in user with active course access.
- Free lesson state is configurable in the admin lesson form.
- Protected playback details are never returned for inaccessible paid lessons.

E2E candidates:

- `GUEST-FREE-LESSON-001`: guest opens a free lesson and video playback loads.
- `GUEST-LOCKED-LESSON-001`: guest cannot open a paid lesson video.
- `STUDENT-PAID-LESSON-001`: student with access opens a paid lesson and video
  playback loads.
- `ADMIN-LESSON-001`: admin marks a lesson free and the guest can open it.

### Stage 3: Course Detail And Lesson States

Status: **Done**

Goal: make course detail pages useful for guests, students without access, and
students with access.

User stories:

- As a guest, I can open a published course detail page.
- As a guest, I can read the course description and lesson outline.
- As a guest, I can distinguish free lessons from locked paid lessons.
- As a student without access, I can understand that course access is required
  for locked lessons.
- As a student with access, I can see paid lessons as included in my course
  access.

Acceptance scenarios:

- `/courses/$courseSlug` works without sign-in for published courses.
- Lesson states are clear: free, included, or locked.
- Locked lessons do not link to playable paid content.
- UI copy avoids in-app purchase or single-lesson purchase language.

E2E candidates:

- `GUEST-COURSE-DETAIL-001`: guest opens a published course detail page.
- `GUEST-COURSE-DETAIL-002`: guest sees free and locked lesson states.
- `STUDENT-COURSE-DETAIL-001`: student without access sees locked paid lessons.
- `STUDENT-COURSE-DETAIL-002`: student with access sees paid lessons as
  included.

### Stage 4: Lesson Viewing Navigation

Status: **Done**

Goal: make lesson watching feel like a course experience rather than isolated
video pages.

User stories:

- As a learner, I can move to the previous or next accessible lesson.
- As a learner, I can see the course lesson list while viewing a lesson.
- As a guest, I am not linked into locked paid lessons.
- As a student without access, I am not linked into locked paid lessons.
- As a student with access, I can navigate through all published lessons in a
  course.

Acceptance scenarios:

- Lesson detail API returns ordered navigation context.
- Previous and next links respect course boundaries.
- Navigation never links a user to inaccessible paid playback.
- Lesson viewing layout works on mobile and desktop.

E2E candidates:

- `LESSON-NAV-001`: learner opens a free lesson and navigates to another free
  lesson.
- `LESSON-NAV-002`: guest cannot navigate into a locked paid lesson.
- `LESSON-NAV-003`: student with access can navigate between paid lessons.
- `LESSON-LAYOUT-001`: lesson viewing page remains usable on mobile and desktop
  viewport sizes.

### Stage 5: Product-Ready Public UI

Status: **Done**

Goal: make browsing, evaluating, and entering courses feel polished and
trustworthy.

User stories:

- As a guest, I can evaluate available courses from a polished catalog.
- As a guest, I can understand course value, lesson availability, and access
  requirements.
- As a learner, I can use the app comfortably in light and dark modes.
- As an admin, I can manage content without user-facing vendor or protocol
  details leaking into the UI.

Acceptance scenarios:

- Public pages look intentional on mobile and desktop.
- Course cards, lesson lists, locked states, empty states, and playback pages are
  visually consistent.
- User-facing copy does not mention Cloudflare Stream, tus, UIDs, or internal
  implementation details.
- Light and dark modes both support the product interface.

E2E candidates:

- `PUBLIC-UI-001`: catalog renders without layout issues on mobile and desktop.
- `PUBLIC-UI-002`: course detail renders lesson states clearly on mobile and
  desktop.
- `PUBLIC-COPY-001`: public UI avoids implementation-detail wording.

### Stage 6: Manual Access Operations

Status: **Done**

Goal: let admins control which students can access paid course lessons.

User stories:

- As an admin, I can find a user by email or name.
- As an admin, I can grant a user access to a course.
- As an admin, I can revoke a user's course access.
- As an admin, I can see which users currently have access to each course.
- As a student, I lose access to paid lessons when an admin revokes my course
  access.

Acceptance scenarios:

- Admin access screens support searching users and changing access state.
- Access changes take effect immediately in student course detail, lesson detail,
  and playback authorization.
- Revoked users cannot reuse stale UI state to obtain paid playback tokens.

E2E candidates:

- `ADMIN-ACCESS-001`: admin grants course access to a student.
- `ADMIN-ACCESS-002`: admin revokes course access from a student.
- `STUDENT-ACCESS-001`: student gains access after admin grant.
- `STUDENT-ACCESS-002`: student loses paid playback after admin revoke.

### Stage 7: Student Progress And Resume

Status: **Done**

Goal: help signed-in learners continue where they left off and preserve lesson
completion state.

User stories:

- As a signed-in student, I can resume a lesson from my latest saved position.
- As a signed-in student, I can see which lessons are completed.
- As a signed-in student, my progress only moves forward unless the product
  intentionally supports resetting progress.
- As a guest, I can watch free lessons without saved account progress.
- As the backend, I validate access before accepting progress writes.

Acceptance scenarios:

- Paid lesson progress requires active course access.
- Free lesson progress for signed-in users validates published course, published
  lesson, and free lesson state.
- Guest free playback does not create user-bound progress.
- Completed progress is preserved and not overwritten by shorter playback
  sessions.

E2E candidates:

- `PROGRESS-001`: signed-in student watches part of a lesson and resumes later.
- `PROGRESS-002`: completed lesson remains completed after replaying a shorter
  segment.
- `PROGRESS-003`: guest watches a free lesson without creating account progress.
- `PROGRESS-AUTH-001`: revoked student cannot write paid lesson progress.

### Stage 8: Playback Protection And Session Enforcement

Status: **Done**

Goal: keep protected video access controlled by backend-issued playback sessions.

User stories:

- As a student with access, I can watch protected video through a signed playback
  token.
- As a student, I cannot watch the same protected lesson in multiple active
  browser sessions if the concurrency policy forbids it.
- As an admin, I can trust that hiding UI controls is not the security boundary.
- As the backend, I validate course state, lesson state, access state, video
  state, and playback session state before issuing tokens.

Acceptance scenarios:

- Playback token requests validate access server-side.
- Authenticated playback creates or updates an active playback session.
- Playback heartbeats keep the current session active.
- A second active playback session is denied according to the configured policy.
- Guest free playback can receive a signed token without account watermarking or
  per-user session enforcement.

E2E candidates:

- `PLAYBACK-TOKEN-001`: paid lesson token request succeeds for a granted student.
- `PLAYBACK-TOKEN-002`: paid lesson token request fails for a guest.
- `PLAYBACK-TOKEN-003`: paid lesson token request fails for a revoked student.
- `PLAYBACK-SESSION-001`: second active playback session is blocked.
- `PLAYBACK-FREE-001`: guest free playback succeeds without a user session.

### Stage 9: Admin Content Operations

Status: **Done**

Goal: make course and lesson authoring dependable for real admin use.

User stories:

- As an admin, I can create and edit courses.
- As an admin, I can publish, archive, and restore courses according to supported
  course statuses.
- As an admin, I can create and edit lessons under a course.
- As an admin, I can reorder lessons.
- As an admin, I can publish or archive lessons.
- As an admin, I can upload lesson videos directly to Cloudflare Stream.
- As an admin, I can see whether a lesson video is still processing or ready.

Acceptance scenarios:

- Admin routes require server-side admin authorization.
- Course and lesson forms validate required fields.
- Lesson ordering is stable in course detail and lesson navigation.
- Upload setup returns only validated external provider fields.
- Admin UI shows upload and processing state without exposing low-level provider
  terminology to end users.

E2E candidates:

- `ADMIN-CONTENT-001`: admin creates, edits, and publishes a course.
- `ADMIN-CONTENT-002`: admin creates, edits, reorders, and publishes lessons.
- `ADMIN-CONTENT-003`: non-admin user cannot access admin content routes or
  APIs.
- `ADMIN-UPLOAD-001`: admin starts a lesson video upload and sees processing
  state.

### Stage 10: Admin Metrics And Insights

Status: **Later**

Goal: help admins understand course demand, access, and learner engagement.

User stories:

- As an admin, I can see all customers or registered students.
- As an admin, I can see which customers have access to which courses.
- As an admin, I can see how many times each course has been accessed.
- As an admin, I can see who accessed a course when a user is known.
- As an admin, I can see how often each lesson video has been watched.
- As an admin, I can see approximate watch time and completion behavior.

Acceptance scenarios:

- Metrics avoid exposing data to non-admin users.
- Course access metrics distinguish granted, revoked, and never-granted users.
- Lesson watch metrics are based on backend-owned playback or progress events,
  not client-only assumptions.
- Admin reporting handles anonymous guest free-lesson views separately from
  signed-in student activity.

E2E candidates:

- `ADMIN-METRICS-001`: admin sees current access counts for a course.
- `ADMIN-METRICS-002`: admin sees lesson watch activity for signed-in students.
- `ADMIN-METRICS-003`: non-admin user cannot access metrics APIs.

### Stage 11: Payment Handoff And Future Payments

Status: **Next / Later**

Goal: support the current manual payment handoff clearly now, while preserving a
later path to in-app payments.

User stories:

- As an interested guest, I can understand that access is currently requested
  outside the app.
- As an interested guest, I can see clear instructions for how to request course
  access through the configured external contact path.
- As a student, I can register or sign in after contacting the admin.
- As an admin, I can manage course access manually after receiving payment
  externally.
- As a future customer, I may be able to purchase course access through an
  in-app payment flow.
- As an admin, I may be able to see payment status connected to course access.

Acceptance scenarios:

- Current UI does not imply that checkout exists inside the app.
- Manual payment/contact copy is clear and centralized enough to change later.
- Future payment work remains course-access based unless single-lesson purchases
  are explicitly brought into scope.

E2E candidates:

- `ACCESS-REQUEST-001`: guest sees contact instructions for a locked course.
- `PAYMENT-HANDOFF-001`: locked course pages show external contact instructions.
- `PAYMENT-HANDOFF-002`: no in-app checkout route or payment action is presented
  in v1.
- `PAYMENT-FUTURE-001`: future checkout creates or updates course access after a
  confirmed payment.

## Cross-Cutting Stories

### Authentication And Account Management

Status: **Done**

User stories:

- As a user, I can register and sign in.
- As a user, I can manage my account, password, passkeys, and sessions.
- As an admin, I can sign in and access admin-only areas.
- As a non-admin user, I cannot access admin-only areas.

E2E candidates:

- `AUTH-001`: user registers and signs in.
- `AUTH-002`: user signs out and protected account routes redirect to login.
- `AUTH-ADMIN-001`: admin reaches `/admin`.
- `AUTH-ADMIN-002`: non-admin cannot reach `/admin`.

### Authorization And Security

Status: **Done**

User stories:

- As the backend, I enforce authentication for protected operations.
- As the backend, I enforce admin role checks for admin operations.
- As the backend, I enforce active course access for paid lesson, progress, and
  playback operations.
- As the frontend, I present helpful route guards and UI states, but never act as
  the source of authorization truth.

E2E candidates:

- `AUTHZ-ADMIN-001`: non-admin admin API calls fail.
- `AUTHZ-COURSE-001`: paid lesson API calls fail without active access.
- `AUTHZ-COURSE-002`: revoked access blocks playback token creation.
- `AUTHZ-GUEST-001`: guest can only read published, guest-allowed data.

## E2E Scenario Priorities

Use these priorities when turning the story map into automated e2e coverage.

### Priority 1: Critical Access Model

- Guest can browse published courses.
- Guest can watch published free lessons.
- Guest cannot watch paid lessons.
- Student with active access can watch paid lessons.
- Revoked student cannot watch paid lessons.
- Non-admin cannot perform admin actions.

### Priority 2: Core Admin Workflow

- Admin creates and publishes a course.
- Admin creates, configures, reorders, and publishes lessons.
- Admin grants course access.
- Admin revokes course access.
- Access changes are reflected in student UI and backend playback authorization.

### Priority 3: Learning Experience

- Course detail shows correct lesson states.
- Lesson navigation respects access.
- Signed-in progress is saved and resumed.
- Completed lessons stay completed.
- Mobile and desktop lesson layouts remain usable.

### Priority 4: Reporting And Future Growth

- Admin sees course access counts.
- Admin sees lesson engagement metrics.
- Manual payment handoff is clear.
- Future in-app payments grant course access only after confirmation.

## Deferred Or Out Of Scope

These stories are intentionally excluded from the current v1 roadmap unless they
are explicitly promoted into scope.

- Single-lesson purchases.
- Organizations and team accounts.
- Certificates.
- Comments and discussions.
- Quizzes.
- Public video assets that bypass backend-issued signed playback tokens.
