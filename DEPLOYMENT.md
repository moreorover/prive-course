# Deployment Notes

## Runtime

The app deploys to Cloudflare through the root `alchemy.run.ts`:

- Web: Vite static assets from `apps/web`
- API: Cloudflare Worker from `apps/server`
- Database: Cloudflare D1 binding named `DB`
- Video: Cloudflare Stream

## Cloudflare Environments

- Dev stage: `dev`
- Prod stage: `prod`
- PRs deploy to dev.
- Pushes to `main` deploy to prod.
- `vp run deploy` is dev by default. Prod requires `vp run deploy:prod`.

Alchemy provisions separate D1 databases and Workers per stage:

```txt
Dev web Worker:     prive-course-web-dev
Dev server Worker:  prive-course-server-dev
Dev D1 database:    prive-course-dev
Prod web Worker:    prive-course-web-prod
Prod server Worker: prive-course-server-prod
Prod D1 database:   prive-course-prod
```

After deploy, Alchemy prints the generated `workers.dev` URLs. Smoke-check the active stage:

```txt
GET / -> OK
GET /trpc/healthCheck -> OK
CORS origin -> deployed web URL for the same stage
```

## Required Environment

Set these before running Cloudflare dev or deploy commands:

```txt
ALCHEMY_PASSWORD
ALCHEMY_STATE_TOKEN
CORS_ORIGIN
BETTER_AUTH_SECRET
BETTER_AUTH_URL
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_STREAM_API_TOKEN
CLOUDFLARE_API_TOKEN
```

`ALCHEMY_PASSWORD` encrypts Alchemy-managed secrets in state. `ALCHEMY_STATE_TOKEN` authenticates the Cloudflare-backed Alchemy state store used by CI deploys. `CLOUDFLARE_STREAM_API_TOKEN` is used by the API to create tus upload URLs, check video processing status, and create signed playback tokens.

Root environment files are loaded in this order:

```txt
.env
.env.dev or .env.prod
```

Stage-specific files override `.env`. App-local files such as `apps/server/.env` and `apps/web/.env` are for local app commands, not Alchemy deploys.

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
migrationsDir: "./packages/db/src/migrations";
```

Remote migrations have been applied to the Cloudflare D1 database bound as `DB`.

## Deploy

Run:

```sh
vp run deploy
```

This deploys the dev stage. Production is explicit:

```sh
vp run deploy:prod
```

The first deploy after manually creating D1 may need adoption:

```sh
vp exec alchemy deploy --stage dev --adopt
vp exec alchemy deploy --stage prod --adopt
```

Use root `.env.dev` and `.env.prod` files for local deploys so deployed auth and CORS do not inherit local `apps/server/.env` URLs.

Destroy non-production resources only when intentionally tearing down the stack:

```sh
vp run destroy
```

Destroy production only with the explicit prod command:

```sh
vp run destroy:prod
```

## GitHub Actions

Create GitHub environments named `cloudflare-dev` and `cloudflare-prod`. Store the 1Password service account token as the only GitHub secret needed by the deploy workflows:

```txt
OP_SERVICE_ACCOUNT_TOKEN
```

Use a `prive-course` service account with `read_items` access to the `prive-course` vault. A token copied from another project will authenticate but fail when the workflow resolves `op://prive-course/...` secret references.

Deployment secrets are loaded from the `prive-course` 1Password vault:

```txt
prive-course-cloudflare-dev
prive-course-cloudflare-prod
```

Each item uses the same section layout as `prive-admin`: `cloudflare`, `workers`, `better-auth`, `web`, and `d1`. `prive-course` also includes an `alchemy` section for `ALCHEMY_PASSWORD` and `ALCHEMY_STATE_TOKEN`, plus `cloudflare/stream-api-token` for Cloudflare Stream.

The PR workflow deploys dev after checks. The main workflow deploys prod after checks.

## Stream

Uploads use Cloudflare Stream direct creator uploads with tus chunks:

https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/

Playback uses Cloudflare Stream signed tokens generated through the Stream `/token` endpoint. For higher traffic, move token generation to a Stream signing key or Workers Stream binding.
