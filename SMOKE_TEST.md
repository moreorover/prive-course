# Smoke Test Checklist

Run this after local D1 migrations are applied and the app is running.

## Automated Smoke

Local:

```sh
vp run db:migrate:local
vp run dev
vp run smoke
```

Production:

```sh
vp run smoke:production
```

The automated smoke script verifies:

- server health endpoint
- web app shell
- built static asset loading
- client-route fallback
- CORS from web to server
- protected course API rejects anonymous access

The authenticated admin/student flows below still need manual browser coverage because they rely on
real account state, passkeys, Cloudflare Stream, and multiple playback sessions.

## Setup

Start the app:

```sh
vp run dev
```

Open:

```txt
http://localhost:3001
```

Create two users through the UI:

```txt
admin@example.com
student@example.com
```

Promote the admin account locally:

```sh
vp run admin:bootstrap:local admin@example.com
```

## Admin Flow

- Sign in as `admin@example.com`.
- Open `/admin`.
- Create a published course.
- Open the course edit page.
- Create at least one published lesson.
- Upload a small test video or paste a known Cloudflare Stream UID.
- Confirm the panel reports tus upload progress.
- Confirm the Video panel shows a Stream UID and processing status.
- Open the course access screen.
- Search for `student@example.com`.
- Grant access to the course.
- Sign out.

## Student Flow

- Sign in as `student@example.com`.
- Open `/courses`.
- Confirm the granted course appears.
- Open the course detail page.
- Open the lesson.
- Start playback.
- Confirm the protected player renders.
- Confirm the visible account watermark appears over the player.
- Save progress seconds.
- Mark the lesson complete.

## Access Control Checks

- Sign in as a user without access and confirm the course is not visible in `/courses`.
- Try opening a lesson URL for a course without access and confirm the app does not render lesson content.
- Start playback as `student@example.com`, then try to start playback from a second browser/session for the same account and confirm the second session is rejected.

## Current Limitations

- Tus uploads do not yet persist the tus upload URL across browser refreshes.
- Fully automated browser smoke is deferred until there is a test-auth path or seeded test users that
  do not require passkey prompts.
