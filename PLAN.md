# Prive Course Plan

## Product Scope

Prive Course is a private video course platform.

Version 1 focuses on manual course access management:

- Admin users can create courses and lessons.
- Admin users can upload lesson videos to Cloudflare Stream.
- Admin users can manually grant or revoke a user's access to a specific course.
- Regular users can register, sign in, and view only courses they have been granted access to.
- Payment implementation is intentionally out of scope for v1.

## Recommended Stack

- Monorepo scaffolded with Better-T-Stack. Done.
- React frontend. Done.
- TanStack Router for client-side routing. Done.
- TanStack Query for API data fetching and cache management.
- Mantine v9 for UI components. Installed and provider wired.
- Hono backend API. Done.
- tRPC API layer. Done.
- Better Auth for authentication. Done.
- Better Auth passkey plugin for passkey-first login. Installed and wired.
- Better Auth admin plugin for user and session administration. Wired.
- Drizzle ORM. Done.
- Cloudflare D1 for SQLite-compatible database storage. Scaffolded via Better-T-Stack D1 setup.
- Cloudflare Workers deployed with Cloudflare/Alchemy. Scaffolded.
- Cloudflare Stream for video hosting.

Do not use the Better Auth organization plugin in v1. It is better reserved for a later B2B/team/classroom licensing model.

## Starter

Use Better-T-Stack to scaffold the project in:

```txt
/Users/mselvenis/dev/prive-course
```

Target scaffold options:

```txt
frontend: tanstack-router
backend: hono
runtime: workers
database: sqlite
orm: drizzle
auth: better-auth
api: trpc
package-manager: pnpm
db-setup: d1
web-deploy: cloudflare
server-deploy: cloudflare
addons: vite-plus
```

Actual scaffold command used:

```txt
vp dlx create-better-t-stack@latest . --frontend tanstack-router --backend hono --runtime workers --api trpc --auth better-auth --payments none --database sqlite --orm drizzle --db-setup d1 --package-manager pnpm --git --web-deploy cloudflare --server-deploy cloudflare --install --addons vite-plus --examples none --directory-conflict merge --disable-analytics
```

The generated app created an initial Git commit and installed dependencies. A generated Vite config typing issue was fixed by wrapping Vite plugins with Vite+ `lazyPlugins`.

## Current Status

Completed:

- Better-T-Stack monorepo scaffolded in `/Users/mselvenis/dev/prive-course`.
- Vite+ local tooling is active.
- pnpm is installed through Vite+ managed tooling.
- Baseline `vp check` passes.
- Baseline `vp run -r check-types` passes.
- Better Auth admin plugin added server-side and client-side.
- Better Auth passkey plugin added server-side and client-side.
- Better Auth schema updated for admin fields, session impersonation, and passkeys.
- Mantine v9 packages installed and `MantineProvider` wired in the root route.
- Course-domain Drizzle schema added.
- Drizzle migrations generated.
- `.pnpm-store` ignored.

Generated migrations:

```txt
packages/db/src/migrations/0000_lonely_young_avengers.sql
packages/db/src/migrations/0001_flowery_ben_urich.sql
```

Current validation:

```txt
vp check
vp run -r check-types
```

Both commands pass. The web build emits only the generated app's large chunk warning.

## Security Model

The app can be a client-side React application calling a backend API.

The security rule is:

```txt
Frontend decides what to show.
Backend decides what is allowed.
```

Every protected API route must validate the authenticated session server-side.

Every admin API route must validate the authenticated user has an admin role server-side.

Every course, lesson, progress, and playback route must validate course access server-side.

Cloudflare Stream videos must not be treated as public assets. Playback should use backend-issued, short-lived signed playback tokens.

## Authentication

Use Better Auth with:

- Passkey plugin.
- Admin plugin.
- Secure HTTP-only cookies.
- SameSite cookie policy.
- Strict CORS configuration.
- Session revocation support.

The admin plugin should handle generic user administration:

- list users
- view user details
- set roles
- ban/unban users
- revoke user sessions
- optional impersonation for support/debugging

Course access remains a custom domain concept and should be implemented separately with a `course_access` table.

## Core Data Model

Better Auth owns auth-related tables.

Better Auth admin/passkey schema is already represented in Drizzle:

```txt
user
- role
- banned
- ban_reason
- ban_expires

session
- impersonated_by

passkey
- id
- name
- public_key
- user_id
- credential_id
- counter
- device_type
- backed_up
- transports
- created_at
- aaguid
```

Application tables:

```txt
course
- id
- title
- slug
- description
- status: draft | published
- created_at
- updated_at

lesson
- id
- course_id
- title
- slug
- description
- position
- video_uid
- duration_seconds
- status: draft | published
- created_at
- updated_at

course_access
- id
- user_id
- course_id
- granted_by_user_id
- granted_at
- revoked_at

lesson_progress
- id
- user_id
- lesson_id
- progress_seconds
- completed_at
- updated_at

playback_session
- id
- user_id
- lesson_id
- auth_session_id
- started_at
- last_heartbeat_at
- expires_at
```

Indexes to plan for:

```txt
courses.slug unique
lessons.course_id
lessons.course_id + lessons.slug unique
lessons.course_id + lessons.position
course_access.user_id + course_id unique
course_access.course_id
lesson_progress.user_id + lesson_id unique
playback_sessions.user_id
playback_sessions.lesson_id
```

## Admin Flows

Admin users can:

1. Sign in with passkey.
2. Create, edit, publish, and archive courses.
3. Create, edit, reorder, publish, and archive lessons.
4. Upload a lesson video to Cloudflare Stream.
5. Search/list users via Better Auth admin capabilities.
6. Grant a user access to a course.
7. Revoke a user's access to a course.
8. Revoke suspicious user sessions.
9. View basic course access and progress information.

## Student Flows

Regular users can:

1. Register an account.
2. Add/sign in with a passkey.
3. See only courses where active `course_access` exists.
4. Open published lessons in accessible published courses.
5. Watch lesson videos through signed playback tokens.
6. Resume progress.

## Video Upload Flow

Use Cloudflare Stream direct upload.

Recommended flow:

1. Admin creates or opens a lesson draft.
2. Admin clicks upload.
3. Backend creates a Cloudflare Stream direct upload URL.
4. Browser uploads the video directly to Cloudflare Stream.
5. Backend stores the resulting `video_uid` on the lesson.
6. Backend displays processing/ready state in the lesson editor.

Large video files should never be proxied through the application Worker.

## Video Playback Flow

Recommended flow:

1. Student opens a lesson.
2. Frontend asks backend for a playback token.
3. Backend validates:
   - authenticated session
   - user is not banned
   - course is published
   - lesson is published
   - user has active course access
   - playback concurrency policy
4. Backend creates a short-lived Cloudflare Stream signed token.
5. Frontend loads the player with the signed token.
6. Frontend sends a heartbeat every 30 seconds.
7. Backend records progress and active playback state.

MVP playback protection:

```txt
- 1 active playback session per user
- signed token expiry around 10 minutes
- heartbeat every 30 seconds
- optional visible dynamic watermark using email or account id
```

## Frontend Route Plan

```txt
/login
/register

/app
/app/courses
/app/courses/$courseSlug
/app/courses/$courseSlug/lessons/$lessonSlug

/admin
/admin/courses
/admin/courses/new
/admin/courses/$courseId
/admin/courses/$courseId/lessons/$lessonId
/admin/users
/admin/users/$userId
```

Use route guards:

- Unauthenticated users go to `/login`.
- Non-admin users cannot enter `/admin`.
- Users without course access cannot open protected course/lesson routes.

## API Route Plan

```txt
/auth/*

/api/me
/api/courses
/api/courses/:courseId
/api/lessons/:lessonId/progress
/api/lessons/:lessonId/playback-token
/api/lessons/:lessonId/playback-heartbeat

/api/admin/courses
/api/admin/courses/:courseId
/api/admin/lessons
/api/admin/lessons/:lessonId
/api/admin/lessons/:lessonId/upload-url
/api/admin/users
/api/admin/users/:userId/access
```

## Implementation Phases

### Phase 1: Scaffold

- [x] Create the Better-T-Stack monorepo.
- [x] Confirm local dev commands.
- [x] Add Mantine v9.
- [x] Establish base app shell and route layout from the starter.
- [x] Fix generated Vite config type issue.

### Phase 2: Cloudflare Foundation

- [x] Scaffold Cloudflare/Alchemy deployment setup.
- [x] Scaffold Cloudflare D1 setup.
- [x] Add Drizzle migrations for auth/admin/passkey schema.
- [x] Add Drizzle migrations for course-domain schema.
- [ ] Create/bind real Cloudflare D1 resource.
- [ ] Confirm local and remote D1 migration workflow.

### Phase 3: Auth

- [x] Configure Better Auth.
- [x] Add passkey plugin.
- [x] Add admin plugin.
- [x] Add client plugins for passkey/admin.
- [x] Add required Drizzle schema fields/tables.
- [ ] Add passkey-first UI flows.
- [ ] Add admin route/API protection.
- [ ] Add first-admin bootstrap path or documented seed command.

### Phase 4: Course Admin

- [x] Add database schema for courses and lessons.
- [ ] Course CRUD.
- [ ] Lesson CRUD.
- [ ] Lesson ordering.
- [ ] Draft/published states.

### Phase 5: Stream Upload

- Cloudflare Stream direct upload URL endpoint.
- Lesson video UID persistence.
- Upload and processing state UI.

### Phase 6: Student Experience

- [x] Add database schema for lesson progress.
- Granted courses list.
- Course detail page.
- Lesson viewer.
- Progress tracking.

### Phase 7: Access Control

- [x] Add database schema for manual course access.
- Admin user search.
- Grant/revoke access UI.
- Server-side access checks across all relevant APIs.

### Phase 8: Playback Protection

- [x] Add database schema for playback sessions.
- Signed playback token endpoint.
- Active playback session enforcement.
- Heartbeat endpoint.
- Optional watermark.

### Phase 9: Verification And Polish

- Loading, error, and empty states.
- Basic responsive layout.
- API tests for authorization boundaries.
- Smoke test admin and student flows.
- Deployment notes.

## Credentials Needed Later

Implementation can start without Cloudflare credentials if using local development and placeholders.

Deployment and Stream integration will need:

```txt
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
BETTER_AUTH_SECRET
BETTER_AUTH_URL
D1 database name/id
Cloudflare Stream API access
Cloudflare Stream signing configuration
```

The Cloudflare API token should be scoped as narrowly as practical for Workers, D1, and Stream.

## Deferred Features

Do not include in v1:

- Payments.
- Better Auth organization plugin.
- Telegram login.
- Team/company accounts.
- Coupons.
- Certificates.
- Comments/discussions.
- Quizzes.
- Public marketing site.
- SEO-heavy public catalog.

Likely future additions:

- Payments and automatic access grants.
- Telegram social login.
- Organization/team licenses.
- Course bundles.
- Certificates.
- Admin audit log.
- More sophisticated account-sharing detection.
