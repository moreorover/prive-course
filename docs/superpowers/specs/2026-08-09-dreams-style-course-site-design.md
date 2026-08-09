# Dreams-Style Course Site Design

## Status

Approved direction: simplify Product Atelier toward a creator-led course site similar in structure and information architecture to Dreams of Code.

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

- Focused course catalog inspired by Dreams of Code structure, not its color scheme.
- Short page intro: “Deep-dive into practical beauty skills with focused video courses.”
- Three media-backed course cards with:
  - Course image or image slot.
  - Availability or emphasis label.
  - Course title.
  - One-sentence description.
  - Topic tags.
  - Primary action: `Start Learning`.
  - Secondary action: `Course Details`.
- Basic + Pro should be visibly marked as the expanded extension path and should say that it includes Basic.
- Each entry links to the course page.

Avoid:

- Equal-weight generic cards with only text.
- Old course-list structure with header, cards, and repeated dashboard styling.
- Catalog filters or marketplace controls.

### Individual Course Page

Purpose: explain one course before the lesson list.

Structure:

- Large course media banner at the top.
- Availability label and topic tags near the course title.
- Course title and direct description.
- Primary action: `Start Learning`.
- Secondary action: `Back to Courses`.
- Article-like sections:
  - What this course teaches.
  - Who it is for.
  - Course contents.
- Course contents should feel like the Dreams of Code course detail pattern, not a lesson table with an access summary card.

The course page should not look like:

- A SaaS product detail page with platform metrics.
- A two-column “content plus sticky access card” layout.
- The old `PageHeader` plus lesson list plus side card structure.

### Lesson Page

Purpose: let the user watch the video and read lesson notes.

Structure:

- Mantine `AppShell` layout for the learning view.
- `AppShell.Navbar` sidebar listing all lessons in the current course.
- Sidebar should show lesson number, title, current lesson state, watched state, and locked state when access is missing.
- On desktop, keep the lesson sidebar visible so students can move through the course without returning to the course detail page.
- On mobile, collapse the lesson sidebar behind a lesson-list control so the video remains primary.
- Main area contains compact course and lesson context.
- Video player as the dominant surface inside the main content area.
- Lesson description or notes directly below the video, like a course article.
- Next lesson block below the notes.
- Locked state when access is missing.

The lesson page should feel like a quiet learning view, not a marketing page.

Avoid:

- A floating card-style sidebar competing visually with the video.
- Repeating previous/next controls above and below the player.
- Dashboard-like lesson queue panels on the public learning surface.

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

The older structural board remains useful as history, but this Dreams-style board is the current direction for layout and page architecture only. Color, typography, and final brand treatment remain Product Atelier decisions.

## Self-Review

- No unresolved placeholders.
- Scope is limited to home, courses, course detail, and lesson page.
- Admin/profile are intentionally excluded from this design pass.
- Payment and purchase logic remain out of scope.
- Route and API behavior remain unchanged.
