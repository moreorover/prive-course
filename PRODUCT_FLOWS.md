# Product Flows

Prive Course is a private video course platform with manual course access management.

Version 1 has four primary actors:

- **Guests** discover published courses, open published course detail pages, and view published free lessons without signing in.
- **Students** register, sign in, and view paid lesson content only for courses where active access has been granted.
- **Admin users** create course content, manage lessons, upload protected videos, and grant or revoke course access.
- **The backend** owns authorization, Cloudflare Stream upload setup, signed playback tokens, progress writes, and playback-session enforcement.

Payments, single-lesson purchases, organizations, team accounts, certificates, comments, and quizzes are out of scope for v1.

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

## Public Catalog And Student Flow

Public visitors and students can:

1. Open `/courses`.
2. See published courses without signing in.
3. Open a published course detail page without signing in.
4. See published lesson lists with clear free, included, or locked access states.
5. Open and watch published free lessons without signing in.
6. Register or sign in when they need access to paid lessons.
7. Open paid published lessons only when their account has active course access.
8. Resume playback from saved progress after signing in.
9. Complete lessons while the backend preserves completed progress.

Public and student route shape:

```txt
/courses
/courses/$courseSlug
/courses/$courseSlug/lessons/$lessonSlug
/dashboard
/profile
```

Published course summary and detail APIs may allow guest reads. Paid lesson, progress, and paid playback operations must validate the authenticated session and active course access server-side.

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
6. Frontend sends playback heartbeats.
7. Backend records active playback state.
8. Frontend buffers progress locally and flushes progress to the API on page leave or unmount.
9. Backend only moves stored progress forward and preserves completed lessons.

Progress writes remain a signed-in behavior.

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

- Guests can open public catalog and published course detail routes.
- Guests are redirected to `/login` only when they try to access account-required surfaces.
- Non-admin users cannot use admin screens.
- Users without active course access should see locked paid lesson states instead of playable paid content.

Backend checks are authoritative:

- Protected tRPC procedures require an authenticated session.
- Admin procedures require an admin user role.
- Guest-readable catalog procedures return only published course and allowed lesson metadata.
- Paid lesson, progress, and paid playback procedures validate active course access.
- Free lesson playback validates published course, published lesson, and free lesson state before issuing signed playback tokens.
