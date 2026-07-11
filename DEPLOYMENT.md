# Deployment Notes

## Runtime

The app deploys to Cloudflare through Alchemy:

- Web: Vite static assets from `apps/web`
- API: Cloudflare Worker from `apps/server`
- Database: Cloudflare D1 binding named `DB`
- Video: Cloudflare Stream

## Production URLs

Current Cloudflare Workers URLs:

```txt
Web:    https://prive-course-web-mselvenis.mselvenis.workers.dev
Server: https://prive-course-server-mselvenis.mselvenis.workers.dev
```

Verified after deploy:

```txt
GET / -> OK
GET /trpc/healthCheck -> OK
CORS origin -> https://prive-course-web-mselvenis.mselvenis.workers.dev
```

## Required Environment

Set these before running Cloudflare dev or deploy commands:

```txt
CORS_ORIGIN
BETTER_AUTH_SECRET
BETTER_AUTH_URL
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_STREAM_API_TOKEN
CLOUDFLARE_API_TOKEN
```

`CLOUDFLARE_STREAM_API_TOKEN` is used by the API to create tus upload URLs, check video processing status, and create signed playback tokens.

## Local Development

Start both apps:

```sh
vp run dev
```

Useful separate commands:

```sh
vp run dev:web
vp run dev:server
```

Local D1 helpers:

```sh
vp run db:migrate:local
vp run db:execute:local -- --command "select name from sqlite_master where type = 'table';"
```

Bootstrap a local admin after creating the user through the app:

```sh
vp run admin:bootstrap:local
```

## Migrations

Generate Drizzle migrations after schema changes:

```sh
vp run db:generate
```

Current migrations live in `packages/db/src/migrations`.

Alchemy is configured with:

```ts
migrationsDir: "../../packages/db/src/migrations";
```

Remote migrations have been applied to the Cloudflare D1 database bound as `DB`.

## Deploy

Run:

```sh
vp run deploy
```

The first deploy after manually creating D1 may need adoption:

```sh
vp exec alchemy deploy --adopt
```

Use production deploy values in `packages/infra/.env` so deployed auth and CORS do not inherit local `apps/server/.env` URLs.

Destroy non-production resources only when intentionally tearing down the stack:

```sh
vp run destroy
```

## Stream

Uploads use Cloudflare Stream direct creator uploads with tus chunks:

https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/

Playback uses Cloudflare Stream signed tokens generated through the Stream `/token` endpoint. For higher traffic, move token generation to a Stream signing key or Workers Stream binding.
