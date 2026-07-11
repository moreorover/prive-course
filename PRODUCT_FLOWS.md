# Product Flows

Prive Course is a private video course platform with manual course access management.

Version 1 has three primary actors:

- **Admin users** create course content, manage lessons, upload protected videos, and grant or revoke course access.
- **Students** register, sign in, and view only the published courses they have been granted access to.
- **The backend** owns authorization, Cloudflare Stream upload setup, signed playback tokens, progress writes, and playback-session enforcement.

Payments, organizations, team accounts, certificates, comments, quizzes, and public course catalog flows are out of scope for v1.

## Admin Flow

Admin users can:

1. Sign in with email/password or passkey.
2. Open `/admin`.
3. Create, edit, publish, archive, and list courses.
4. Create, edit, reorder, publish, archive, and list lessons under a course.
5. Upload lesson videos to Cloudflare Stream through direct creator uploads.
6. View Stream UID and processing status in the lesson editor.
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

Admin APIs must use server-side admin authorization. Frontend route visibility is not a security boundary.

## Student Flow

Students can:

1. Register an account.
2. Add and use a passkey.
3. Sign in with email/password or passkey.
4. Open `/courses`.
5. See only published courses where active `course_access` exists.
6. Open a published course they can access.
7. Open published lessons in that course.
8. Watch lessons through backend-issued signed playback tokens.
9. Resume playback from saved progress.
10. Complete lessons while the backend preserves completed progress.

Student route shape:

```txt
/courses
/courses/$courseSlug
/courses/$courseSlug/lessons/$lessonSlug
/dashboard
/profile
```

Student APIs must validate the authenticated session and active course access server-side for course, lesson, progress, and playback operations.

## Video Upload Flow

Lesson uploads use Cloudflare Stream direct creator uploads with tus chunks. Large video files must not be proxied through the application Worker.

Flow:

1. Admin creates or opens a lesson draft.
2. Admin starts a video upload from the lesson editor.
3. Backend creates a Cloudflare Stream tus upload URL with signed playback URL requirements.
4. Browser uploads the video directly to Cloudflare Stream in tus chunks.
5. Backend stores the resulting Stream `video_uid` on the lesson.
6. Admin UI shows upload progress, Stream UID, and processing status.
7. Admin publishes the lesson when content and video state are ready.

## Video Playback Flow

Playback uses backend-issued Cloudflare Stream signed tokens. Stream videos are not public assets.

Flow:

1. Student opens a lesson route.
2. Frontend requests a playback token for the lesson.
3. Backend validates:
   - authenticated session
   - course is published
   - lesson is published
   - user has active course access
   - lesson has a Stream video UID
   - playback concurrency policy
4. Backend creates a Cloudflare Stream signed playback token.
5. Frontend loads the protected player with the signed token.
6. Frontend sends playback heartbeats.
7. Backend records active playback state.
8. Frontend buffers progress locally and flushes progress to the API on page leave or unmount.
9. Backend only moves stored progress forward and preserves completed lessons.

Playback protection:

```txt
- backend-issued signed playback tokens
- 1 active playback session per user/lesson policy
- heartbeat-based active session tracking
- visible account watermark in the protected player
```

## Route Guards And Authorization

The project security rule is:

```txt
Frontend decides what to show.
Backend decides what is allowed.
```

Client route guards improve UX:

- Unauthenticated users are redirected to `/login`.
- Non-admin users cannot use admin screens.
- Students without active course access should not see inaccessible course content.

Backend checks are authoritative:

- Protected tRPC procedures require an authenticated session.
- Admin procedures require an admin user role.
- Course and lesson procedures validate active course access.
- Progress and playback procedures validate active course access and published content.
