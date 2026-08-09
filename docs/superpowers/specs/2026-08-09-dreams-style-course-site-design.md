# Dreams-Style Course Site Design

## Status

Approved direction: simplify Product Atelier toward a creator-led course site similar in structure to Dreams of Code.

This replaces the broader SaaS-funnel direction for public pages.

## Design Read

This is a small creator-led course website for beauty professionals. The site should introduce the teacher, explain what the courses teach, and get visitors into the course catalog or updates list.

The site should not feel like a SaaS platform homepage, a dashboard, a blog, or a large marketplace.

Design dials:

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 2`
- `VISUAL_DENSITY: 4`

Stack direction:

- Keep React, Vite, TanStack Router, Mantine, and custom CSS.
- Do not add Tailwind CSS.
- Preserve existing routes, loaders, tRPC contracts, and backend authorization.

## Page Architecture

### Home

Purpose: introduce the teacher and the course library.

Structure:

- Simple navigation.
- Teacher-first hero with portrait or image slot.
- Short course-library positioning.
- Course preview list for all three courses.
- High-level “what you will learn” summary.
- Subscribe form for course updates.
- CTA to the courses page.

The home page should not include a blog section.

### Courses

Purpose: help the visitor choose one course path.

Structure:

- Short page intro.
- Three course entries:
  - Hair Extensions Course - Basic.
  - Hair Extensions Course - Basic + Pro.
  - Social Media Marketing Strategy.
- Basic + Pro should be visibly marked as the expanded extension path and should say that it includes Basic.
- Each entry links to the course page.

Avoid a generic three-card grid if the cards all have equal weight.

### Individual Course Page

Purpose: explain one course before the lesson list.

Structure:

- Course title.
- Teacher framing.
- What this course teaches.
- Who it is for.
- Lesson outline.
- Access or preview CTA.

The course page should not look like a SaaS product detail page with platform metrics.

### Lesson Page

Purpose: let the user watch the video and read lesson notes.

Structure:

- Compact course and lesson context.
- Video player as the primary surface.
- Lesson description or notes below the video.
- Simple lesson list and previous/next navigation.
- Locked state when access is missing.

The lesson page should feel like a quiet learning view, not a marketing page.

## Content Boundaries

Keep:

- Teacher/about framing.
- Course summaries.
- Lesson outlines.
- Subscribe/update form.
- Private access behavior.

Remove or avoid:

- Blog page.
- Large SaaS funnel sections.
- Platform trust blocks.
- Dashboard-style public panels.
- Fake metrics or fake urgency.
- Payment or checkout UI.

## Wiremock

Use this board for the next planning pass:

- `docs/wiremocks/product-atelier-dreams-style-redesign.excalidraw`

The older structural board remains useful as history, but this Dreams-style board is the current direction.

## Self-Review

- No unresolved placeholders.
- Scope is limited to home, courses, course detail, and lesson page.
- Admin/profile are intentionally excluded from this design pass.
- Payment and purchase logic remain out of scope.
- Route and API behavior remain unchanged.
