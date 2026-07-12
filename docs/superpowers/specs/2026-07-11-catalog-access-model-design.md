# Catalog Access Model Design

## Goal

Update `PRODUCT_FLOWS.md` so it reflects the planned public catalog model:
published courses are discoverable without signing in, free published lessons are
viewable without course access, and paid lessons require a signed-in account with
active course access.

## Scope

This pass is documentation-only. It updates product flow language and does not
change API, database, frontend route, or playback implementation.

## Access Model

The documentation should describe three visitor states:

1. Guests can open `/courses`, see published courses, and open published course
   detail pages.
2. Guests can view published lessons that are marked free once lesson-level free
   access exists.
3. Signed-in users with active course access can view paid lessons and playback
   for that course.

Draft and archived courses remain hidden from public catalog views. Draft and
archived lessons remain unavailable to students and guests.

## Product Flow Changes

`PRODUCT_FLOWS.md` should no longer state that public course catalog flows are
out of scope. The actor overview should distinguish guests from signed-in
students, while preserving admins and backend-owned authorization.

The student/public flow should explain:

- `/courses` lists published courses for guests and signed-in users.
- Course detail pages show published course information without requiring access.
- Free published lessons are open to guests.
- Paid lesson playback requires a signed-in account with active course access.
- Payment and single-lesson purchase flows remain out of scope.

The playback flow should clarify that Cloudflare Stream videos remain protected
assets. The backend still issues signed playback tokens; free lessons relax the
course-access requirement, while paid lessons keep the account and access
requirement.

The authorization section should keep the existing security rule: frontend
visibility is user experience only, and backend checks decide what is allowed.

## Validation

Run `vp run check` after editing `PRODUCT_FLOWS.md` when practical, matching the
backlog acceptance criteria for the documentation checkbox.
