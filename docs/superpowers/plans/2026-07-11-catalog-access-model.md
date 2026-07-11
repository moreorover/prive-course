# Catalog Access Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `PRODUCT_FLOWS.md` so it documents guest catalog access, guest free lesson access, and account-required paid lesson access.

**Architecture:** This is a documentation-only change. The existing product flow document remains the source of truth, with the public catalog model folded into the actor overview, student/public flow, playback flow, and authorization rules.

**Tech Stack:** Markdown documentation, repo validation through `vp run check`.

## Global Constraints

- Keep payment flows and single-lesson purchases out of scope.
- Keep backend authorization authoritative; frontend route guards and hidden UI are only UX.
- Cloudflare Stream videos are not public assets. Playback must use backend-issued signed playback tokens.
- Do not change API, database, frontend route, or playback implementation in this pass.

---

### Task 1: Update Product Flow Documentation

**Files:**

- Modify: `PRODUCT_FLOWS.md`
- Reference: `TODO.md`
- Reference: `docs/superpowers/specs/2026-07-11-catalog-access-model-design.md`

**Interfaces:**

- Consumes: The public catalog requirements from `TODO.md` Phase 1.
- Produces: Updated documentation that later API and UI tasks can implement against.

- [ ] **Step 1: Read the current flow document**

Run: `sed -n '1,220p' PRODUCT_FLOWS.md`

Expected: The output includes these outdated claims:

```txt
Students register, sign in, and view only the published courses they have been granted access to.
Payments, organizations, team accounts, certificates, comments, quizzes, and public course catalog flows are out of scope for v1.
```

- [ ] **Step 2: Replace the v1 actor and scope summary**

Edit the opening section so it explicitly names guests, signed-in students, admins, and backend authorization. Use this wording:

```markdown
Version 1 has four primary actors:

- **Guests** discover published courses, open published course detail pages, and view published free lessons without signing in.
- **Students** register, sign in, and view paid lesson content only for courses where active access has been granted.
- **Admin users** create course content, manage lessons, upload protected videos, and grant or revoke course access.
- **The backend** owns authorization, Cloudflare Stream upload setup, signed playback tokens, progress writes, and playback-session enforcement.

Payments, single-lesson purchases, organizations, team accounts, certificates, comments, and quizzes are out of scope for v1.
```

- [ ] **Step 3: Replace the student-only flow with a public catalog and student access flow**

Edit the section currently titled `## Student Flow` so it becomes `## Public Catalog And Student Flow`. Use this route shape and access model:

````markdown
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
````

- [ ] **Step 4: Update playback flow authorization language**

In `## Video Playback Flow`, keep the protected Stream-token model and change the validation bullets to distinguish free from paid lesson access:

```markdown
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
```

Keep the existing heartbeat and progress details, but make sure progress writes remain signed-in behavior.

- [ ] **Step 5: Update route guard and backend authorization bullets**

In `## Route Guards And Authorization`, replace student-only route language with guest-aware UX and backend rules:

```markdown
Client route guards improve UX:

- Guests can open public catalog and published course detail routes.
- Guests are redirected to `/login` only when they try to access account-required surfaces.
- Non-admin users cannot use admin screens.
- Users without active course access should see locked paid lesson states instead of playable paid content.

Backend checks are authoritative:

- Guest-readable catalog procedures return only published course and allowed lesson metadata.
- Protected tRPC procedures require an authenticated session.
- Admin procedures require an admin user role.
- Paid lesson, progress, and paid playback procedures validate active course access.
- Free lesson playback validates published course, published lesson, and free lesson state before issuing signed playback tokens.
```

- [ ] **Step 6: Validate the documentation**

Run: `vp run check`

Expected: The command exits with code 0. Markdown formatting changes from the checker are acceptable and should be included in the final diff.

- [ ] **Step 7: Review the final diff**

Run: `git diff -- PRODUCT_FLOWS.md`

Expected: The diff updates only `PRODUCT_FLOWS.md` for the product flow change. It clearly distinguishes guest-visible catalog/free content from account-required paid lesson access.

- [ ] **Step 8: Commit the docs change**

Run:

```bash
git add PRODUCT_FLOWS.md
git commit -m "docs: update catalog access flows"
```

Expected: A commit is created for the product flow documentation update.
