# Product Atelier Redesign Design

## Status

Approved direction: Product Atelier.

Scope: redesign every visible app surface in one pass:

- Public home
- Public course catalog
- Public course detail
- Lesson player
- Login and sign-up
- Profile
- Admin course list
- Admin course create/edit
- Admin lesson create/edit
- Admin course access management

Constraint: do not build the redesign with Tailwind utilities. Use Mantine components plus plain CSS variables and component classes.

## Design Read

This is a full product UI redesign for a private video course platform with two audiences: students learning salon techniques and admins managing protected course access. The visual language should feel like a quiet premium education product, not a decorative marketing page or a dense enterprise dashboard.

Design dials:

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 6`

The app needs clear hierarchy, repeatable patterns, strong accessibility, and a small amount of brand polish. It should not use cinematic animation, image-heavy marketing sections, or ornamental layout tricks.

## Current Audit

### Brand Tokens

Current branch tokens live mostly in `apps/web/src/index.css` with `--pc-*` variables. The palette is rose, sage, warm canvas, and dark warm neutrals. Mantine is configured with a rose primary color and Inter font.

Issues:

- The warm rose salon palette is coherent but too tied to the homepage attempt.
- `gold` is configured as a duplicate rose palette, which makes semantic color use confusing.
- Body background uses multiple decorative gradients. This gives every page a marketing feel, including admin tables.
- Inter is acceptable for product UI, but the theme should intentionally use it as a practical app font, not a default aesthetic choice.

### Information Architecture

Existing route structure is sound and should be preserved:

- `/`
- `/courses`
- `/courses/$courseSlug`
- `/courses/$courseSlug/lessons/$lessonSlug`
- `/login`
- `/profile`
- `/admin`
- `/admin/courses/new`
- `/admin/courses/$courseId`
- `/admin/courses/$courseId/access`
- `/admin/courses/$courseId/lessons/new`
- `/admin/courses/$courseId/lessons/$lessonId`

No route slugs or primary route purposes should change.

### Content Blocks

The app currently has the right functional blocks:

- Header and user menu
- Course cards
- Course detail access summary
- Lesson outline and lock states
- Video player page with lesson navigation
- Auth forms
- Profile account, password, passkey, and session sections
- Admin tables and forms
- Empty states and loading states

Issues:

- Patterns are defined route by route instead of shared as a product system.
- Homepage has a different visual ambition from admin and lesson pages.
- Tables, forms, lesson rows, and cards do not yet share a unified frame language.
- Empty/loading/error states exist, but they are visually basic and inconsistent.

### Patterns To Preserve

- Mantine for forms, tables, buttons, papers, badges, and layout primitives.
- TanStack Router route structure and loaders.
- Backend authorization model.
- Course access states: free, included, locked, access granted.
- Existing mutation behavior and toast error handling.
- Client-side session redirect behavior in `_auth`.

### Patterns To Retire

- Homepage-only academy classes that do not generalize across the product.
- Decorative body gradients across operational surfaces.
- Duplicated section micro-labels and uppercase labels on too many sections.
- Route-local ad hoc grid/header/table patterns.
- Inline style borders such as `borderTop: "3px solid var(--pc-accent)"`.
- Duplicate `gold` color naming that actually maps to rose.
- Numeric decoration such as oversized `01` marks.

## Target System

### Visual Foundation

Use Mantine as the design system. Use plain CSS variables and classes for brand-specific page composition.

Token families:

- `--pc-bg`: app canvas
- `--pc-bg-subtle`: low contrast page band
- `--pc-surface`: primary panel
- `--pc-surface-raised`: elevated panel
- `--pc-border`: default border
- `--pc-border-strong`: stronger separator
- `--pc-text`: primary text
- `--pc-text-muted`: secondary text
- `--pc-accent`: single brand accent
- `--pc-accent-soft`: low contrast accent surface
- `--pc-success`: success/access state
- `--pc-warning`: preview/draft state
- `--pc-danger`: destructive state
- `--pc-shadow-soft`: surface shadow

Theme mode:

- Mantine `defaultColorScheme="auto"` remains.
- Light and dark tokens must be defined together.
- The page stays one coherent theme. No section-level theme inversion.

Shape:

- Cards and panels: `12px`.
- Inputs: Mantine default radius mapped to `sm` or explicit `8px`.
- Buttons: `8px`.
- Badges: pill radius is allowed because badges are status labels.

Typography:

- Keep Inter unless the project later adds a self-hosted brand font.
- Headings should use tighter size steps and less oversized marketing scale.
- Admin headings should be compact and task-oriented.

Motion:

- CSS hover and active states only.
- No Motion, GSAP, or scroll animation dependency.
- Buttons and clickable cards use fast transition on border, shadow, background, and transform.
- Respect reduced motion by disabling transform movement in CSS.

Icons:

- Keep `lucide-react` because it is already installed.
- Use a consistent size scale: `16`, `18`, `20`, `24`.
- Do not hand-roll SVG icons.

## Shared Components

### `PageShell`

Purpose: consistent page width, padding, and optional page tone.

Props:

- `size`: `narrow | default | wide | full`
- `tone`: `default | quiet | player`
- `children`

Usage:

- Auth uses `narrow`.
- Student pages use `default`.
- Admin pages use `wide`.
- Lesson player uses `full` or `player`.

### `PageHeader`

Purpose: consistent title, description, actions, and optional back link.

Props:

- `title`
- `description`
- `eyebrow` optional, used sparingly
- `backTo` optional
- `actions` optional
- `meta` optional

Rules:

- No section numbers.
- No decorative dots.
- No repeated uppercase labels on every page.
- Actions stay on one line on desktop and stack on mobile.

### `Surface`

Purpose: replace ad hoc `Paper` class usage.

Props:

- `variant`: `default | raised | subtle | accent | danger`
- `padding`: `sm | md | lg | xl`
- `interactive` optional

Implementation:

- Wrap Mantine `Paper`.
- Apply CSS classes for border, background, radius, and hover state.

### `StatusBadge`

Purpose: consistent labels for course, lesson, access, and publication state.

States:

- `published`
- `draft`
- `archived`
- `free`
- `included`
- `locked`
- `accessGranted`
- `preview`
- `admin`
- `student`

Rules:

- Use semantic colors from the token system.
- Avoid mixing Mantine color names directly in route files.

### `CourseCard`

Purpose: reusable course summary for home and catalog.

Variants:

- `featured`
- `standard`
- `compact`

Content:

- Title
- Description
- Publication/access status when available
- Lesson count or preview count when available
- Primary action

### `LessonRow`

Purpose: reusable row for lesson outlines, navigation sidebars, and admin lesson lists where table density is not needed.

Content:

- Position
- Title
- Duration or pending duration
- Status/access badge
- Optional action

Rules:

- Clickable rows must have visible focus states.
- Locked rows must look disabled without relying only on opacity.

### `DataTableShell`

Purpose: consistent admin table wrapper.

Features:

- Header slot
- Toolbar slot
- Empty state slot
- Responsive overflow
- Consistent table density

### `FormSection`

Purpose: consistent form card with title, optional description, controls, and submit action.

Rules:

- Labels stay above inputs.
- No placeholder-only labels.
- Submit area aligns consistently.
- Mutation errors remain toast-based where already implemented.

## Page Designs

### Public Home

Job: orient visitors to the private academy and show available courses.

Layout:

- Compact hero with title, short description, and one primary action to courses.
- Featured course panel if a course exists.
- Course preview section using `CourseCard`.
- Course updates form using `FormSection`.

Changes from current branch:

- Remove oversized academy title scale.
- Remove numeric decoration.
- Remove proof pills in the hero.
- Keep the page polished but make it feel connected to the rest of the app.

### Course Catalog

Job: browse all published courses.

Layout:

- `PageHeader` with title and concise description.
- Optional catalog summary surface.
- Course grid using `CourseCard standard`.
- Empty state with clear admin-independent copy.

### Course Detail

Job: explain a course and move the student into the first accessible lesson.

Layout:

- `PageHeader` with back link, title, description, and primary action.
- Side access panel using `Surface raised`.
- Lesson outline using `LessonRow`.

Access states:

- If a first accessible lesson exists, primary action is `Start learning`.
- If not, primary action is `Sign in for access`.
- Secondary action can jump to lesson outline.

### Lesson Player

Job: watch the video and continue through lessons.

Layout:

- Wide player surface with video first.
- Compact lesson title and course context above player.
- Previous/next controls near player.
- Lesson list in a right rail on desktop.
- Right rail collapses below player on mobile.
- Lesson description appears below navigation if present.

Rules:

- Do not let the global page background compete with video playback.
- Player page can use a darker local surface within the same theme family.
- Course/lesson navigation must remain keyboard accessible.

### Login And Sign-Up

Job: authenticate with minimal friction.

Layout:

- `PageShell narrow`.
- Auth panel using `Surface raised`.
- Clear toggle between sign-up and sign-in.
- Passkey sign-in remains prominent.

Rules:

- Keep labels above inputs.
- Improve loading state so it matches the panel size.
- Error messages remain inline for validation and toast-based for auth failures.

### Profile

Job: manage account, password, passkeys, and sessions.

Layout:

- `PageHeader` with account email in description.
- Stacked `FormSection` and `Surface` sections.
- Session/passkey rows use consistent row spacing and actions.

Rules:

- Keep security actions legible and calm.
- Destructive actions use `--pc-danger`.

### Admin Course List

Job: manage course inventory.

Layout:

- `PageShell wide`.
- `PageHeader` with `New course` action.
- `DataTableShell` containing title, slug, status, and edit action.
- Empty state with create action.

Rules:

- Admin density should be tighter than student pages.
- Tables should not use decorative accent borders.

### Admin Course Create/Edit

Job: edit course metadata and manage lessons.

Layout:

- Back link in `PageHeader`.
- Course form in `FormSection`.
- Lesson management in `DataTableShell`.
- Access management action in the header or a compact action row.

Rules:

- Reorder controls stay icon buttons with tooltips.
- Pending reorder state disables only affected controls where practical.

### Admin Lesson Create/Edit

Job: edit lesson metadata and manage video upload.

Layout:

- `PageHeader` with back link and lesson/course context.
- Lesson form in `FormSection`.
- Video upload panel in `Surface raised`.
- Status and upload feedback use shared badge/state components.

### Admin Access Management

Job: grant and revoke course access.

Layout:

- `PageHeader` with back link and course title.
- Two-column desktop layout:
  - Grant access
  - Active access
- Mobile stacks grant access above active access.
- Both panels use `DataTableShell`.

Rules:

- Search field remains above user results.
- Revoke action remains clearly destructive.
- Empty active access state appears inside the table shell.

## Error, Loading, And Empty States

Loading:

- Use skeletons matching the final layout where possible.
- Keep existing loader only for full auth/session waits.

Empty:

- `EmptyState` should support title, description, optional action, and optional tone.
- Empty states should fit inside the surface where data would appear.

Error:

- Route errors use `Surface danger` or `Surface default` with clear title and action.
- Mutation errors continue to use `toast.error(error.message)`.

## Accessibility

Requirements:

- Preserve backend authorization assumptions. UI visibility never replaces server checks.
- Focus visible states use accent tokens and pass contrast.
- Buttons have readable contrast in light and dark mode.
- Table overflow remains keyboard reachable.
- Links wrapping cards must not remove visible focus.
- Status must not rely on color alone. Badge text communicates the state.

## Implementation Boundaries

Do not change:

- Route slugs
- Backend API contracts
- Authorization behavior
- Mutation invalidation behavior except to make it more specific if already required
- Auth redirect behavior
- Stream playback token enforcement

Allowed changes:

- Shared component extraction
- Mantine theme/token cleanup
- CSS variable redesign
- Page composition changes
- Copy cleanup for clarity
- Empty/loading/error state consistency
- Removal of old homepage-specific CSS classes once unused

## Validation Plan

For implementation:

- Run `vp run check`.
- Run `vp run test`.
- Run `vp exec react-doctor --no-telemetry -y --verbose`.
- Run `vp run smoke` because this touches student/admin flows.

Manual visual checks:

- Light mode and dark mode.
- Desktop and mobile widths.
- Public home, catalog, course detail, lesson player.
- Login sign-up toggle.
- Profile sections.
- Admin list, edit, lesson, and access pages.

## Design Pre-Flight Notes

- Zero em-dash characters in visible copy.
- One accent system across the app.
- One radius system across the app.
- No section numbering decoration.
- No decorative status dots.
- No Tailwind utility classes in new redesigned code.
- No new animation dependency.
- No fake screenshots or image placeholders needed for product pages.
- Admin tables remain operational, not ornamental.
