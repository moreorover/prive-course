# Product Atelier SaaS Overwrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Prive Course into a modern SaaS-style Product Atelier course website that sells three specific course offers, captures subscribers, and carries the same system through student, auth, profile, and admin pages.

**Architecture:** Start with homepage structure and reusable marketing data, then update global tokens/header to support the new SaaS direction, then align public/student/auth/admin pages under the same product system. Keep routes, data loaders, tRPC calls, auth redirects, mutations, and backend authorization unchanged.

**Tech Stack:** React, Vite, TanStack Router, TanStack Query, Mantine, Sonner, lucide-react, tRPC, custom CSS in `apps/web/src/index.css`.

## Global Constraints

- Do not add Tailwind CSS.
- Use React, Vite, TanStack Router, Mantine, and custom CSS.
- Keep existing routes, auth behavior, tRPC contracts, loaders, and server authorization intact.
- Preserve all backend contracts.
- Preserve server-side authorization.
- Preserve route loaders for route-critical data.
- Preserve mutation invalidation behavior.
- Show mutation failures with `toast.error(error.message)`.
- Use Mantine for forms, tables, badges, modals, papers, and feedback states.
- Use custom CSS for brand layout and structural page composition.
- No payment flow.
- No new access logic.
- No new backend newsletter endpoint unless one already exists.
- No new Cloudflare Stream behavior.
- Do not change route slugs.
- Do not replace Mantine with another component library.
- Avoid AI-purple gradients, generic glass cards, decorative orbs, bokeh, salon brochure aesthetics, beige and brass luxury defaults, and three equal feature cards as the main page pattern.

---

## File Structure

Create:

- `apps/web/src/features/marketing/course-offers.ts`: static offer copy for the three promoted courses and homepage sections.
- `apps/web/src/features/marketing/subscribe-form.tsx`: Mantine form for the frontend-only subscribe experience.
- `apps/web/src/features/marketing/course-ladder.tsx`: homepage course ladder and offer relationship visualization.
- `apps/web/src/features/marketing/offer-detail-blocks.tsx`: varied course detail sections for the homepage.
- `apps/web/src/features/marketing/platform-trust.tsx`: buyer-facing private platform section.
- `apps/web/src/features/marketing/final-cta.tsx`: final homepage CTA section.

Modify:

- `apps/web/src/routes/index.tsx`: replace the current hero/course/update structure with the full SaaS homepage narrative.
- `apps/web/src/index.css`: replace the current Product Atelier skin with SaaS overwrite tokens and marketing/page classes.
- `apps/web/src/components/header.tsx`: make the header support the marketing homepage and app pages.
- `apps/web/src/components/ui/course-card.tsx`: keep as app/catalog primitive, but stop using it as the primary homepage structure.
- `apps/web/src/routes/courses/index.tsx`: align public catalog with the three-offer homepage direction.
- `apps/web/src/routes/courses/$courseSlug/index.tsx`: align detail page with stronger course positioning and access language.
- `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`: align lesson shell without changing playback behavior.
- `apps/web/src/routes/login.tsx`, `apps/web/src/components/sign-in-form.tsx`, `apps/web/src/components/sign-up-form.tsx`: align auth surfaces with the new product promise.
- `apps/web/src/routes/_auth/profile.tsx`, `apps/web/src/features/profile/*`: align profile surfaces with the new system.
- `apps/web/src/routes/_auth/admin/**/*`, `apps/web/src/components/course-form.tsx`, `apps/web/src/components/lesson-form.tsx`, `apps/web/src/features/admin/video-upload-panel.tsx`: align admin pages as operational SaaS surfaces.

Do not modify `apps/web/src/routeTree.gen.ts` by hand.

---

### Task 1: Marketing Offer Model

**Files:**

- Create: `apps/web/src/features/marketing/course-offers.ts`

**Interfaces:**

- Consumes: no app data.
- Produces:
  - `COURSE_OFFERS: CourseOffer[]`
  - `OUTCOME_POINTS: OutcomePoint[]`
  - `PLATFORM_TRUST_POINTS: PlatformTrustPoint[]`
  - `type CourseOffer = { id: "extensions-basic" | "extensions-pro" | "social-strategy"; title: string; shortTitle: string; eyebrow: string; summary: string; audience: string; includes: string[]; accessNote: string; ctaLabel: string; emphasis: "standard" | "primary" | "strategy"; }`
  - `type OutcomePoint = { title: string; description: string; }`
  - `type PlatformTrustPoint = { title: string; description: string; }`

- [ ] **Step 1: Create the marketing data file**

  Add:

  ```ts
  export type CourseOffer = {
    id: "extensions-basic" | "extensions-pro" | "social-strategy";
    title: string;
    shortTitle: string;
    eyebrow: string;
    summary: string;
    audience: string;
    includes: string[];
    accessNote: string;
    ctaLabel: string;
    emphasis: "standard" | "primary" | "strategy";
  };

  export type OutcomePoint = {
    title: string;
    description: string;
  };

  export type PlatformTrustPoint = {
    title: string;
    description: string;
  };

  export const COURSE_OFFERS: CourseOffer[] = [
    {
      id: "extensions-basic",
      title: "Hair Extensions Course - Basic",
      shortTitle: "Basic",
      eyebrow: "Foundation track",
      summary:
        "A focused starting point for stylists who want structured hair extension training before taking on more advanced services.",
      audience: "Best for stylists building extension confidence from the ground up.",
      includes: [
        "Core extension foundations",
        "Service preparation",
        "Client-ready technique basics",
      ],
      accessNote: "Buying Basic gives access to this course.",
      ctaLabel: "View Basic",
      emphasis: "standard",
    },
    {
      id: "extensions-pro",
      title: "Hair Extensions Course - Basic + Pro",
      shortTitle: "Basic + Pro",
      eyebrow: "Expanded track",
      summary:
        "The stronger extension path for learners who want the complete Basic foundation plus advanced pro-level training.",
      audience: "Best for stylists who want the full extension pathway.",
      includes: [
        "Everything in Basic",
        "Advanced extension technique",
        "Premium service positioning",
      ],
      accessNote: "Buying Basic + Pro gives access to Basic and Basic + Pro.",
      ctaLabel: "View Basic + Pro",
      emphasis: "primary",
    },
    {
      id: "social-strategy",
      title: "Social Media Marketing Strategy",
      shortTitle: "Social Strategy",
      eyebrow: "Growth track",
      summary:
        "A strategy course for turning beauty expertise into clearer content, stronger demand, and a more visible online presence.",
      audience: "Best for stylists and creators who want better marketing around their services.",
      includes: ["Content strategy", "Offer messaging", "Marketing habits for service growth"],
      accessNote: "Buying Social Media Marketing Strategy gives access to this course.",
      ctaLabel: "View Social Strategy",
      emphasis: "strategy",
    },
  ];

  export const OUTCOME_POINTS: OutcomePoint[] = [
    {
      title: "Build service confidence",
      description:
        "Move from scattered tips to structured lessons built around client-ready execution.",
    },
    {
      title: "Package premium offers",
      description:
        "Use technique and positioning together so the service feels easier to explain and sell.",
    },
    {
      title: "Create demand online",
      description:
        "Turn salon skill into content that makes the offer visible before a client books.",
    },
  ];

  export const PLATFORM_TRUST_POINTS: PlatformTrustPoint[] = [
    {
      title: "Private course access",
      description: "Students see only the courses granted to their account.",
    },
    {
      title: "Protected lesson playback",
      description:
        "Lessons stay inside the private learning experience instead of public file links.",
    },
    {
      title: "Focused learning library",
      description: "Granted courses, lessons, and progress live in one clean student workspace.",
    },
  ];
  ```

- [ ] **Step 2: Run type check**

  Run: `vp run check-types`

  Expected: pass.

- [ ] **Step 3: Commit**

  ```bash
  git add apps/web/src/features/marketing/course-offers.ts
  git commit -m "feat: add marketing course offer model"
  ```

---

### Task 2: SaaS Homepage Components

**Files:**

- Create: `apps/web/src/features/marketing/subscribe-form.tsx`
- Create: `apps/web/src/features/marketing/course-ladder.tsx`
- Create: `apps/web/src/features/marketing/offer-detail-blocks.tsx`
- Create: `apps/web/src/features/marketing/platform-trust.tsx`
- Create: `apps/web/src/features/marketing/final-cta.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: `COURSE_OFFERS`, `OUTCOME_POINTS`, `PLATFORM_TRUST_POINTS`, and `CourseOffer` from `course-offers.ts`.
- Produces:
  - `<SubscribeForm />`
  - `<CourseLadder />`
  - `<OfferDetailBlocks />`
  - `<PlatformTrust />`
  - `<FinalCta />`
  - CSS classes prefixed with `.pc-marketing-`, `.pc-ladder-`, `.pc-offer-`, `.pc-subscribe-`, `.pc-trust-`, and `.pc-final-cta-`.

- [ ] **Step 1: Create `SubscribeForm`**

  Use Mantine form state and Sonner:

  ```tsx
  import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
  import { useForm } from "@mantine/form";
  import { Mail, UserRound } from "lucide-react";
  import { toast } from "sonner";

  export function SubscribeForm() {
    const form = useForm({
      initialValues: { email: "", name: "" },
      validate: {
        email: (value) =>
          /^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Enter a valid email address",
      },
    });

    return (
      <form
        className="pc-subscribe-form"
        onSubmit={form.onSubmit(() => {
          toast.success("You are on the Product Atelier update list.");
          form.reset();
        })}
      >
        <Stack gap="md">
          <Group align="flex-start" grow wrap="wrap">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              type="email"
              leftSection={<Mail size={16} />}
              key={form.key("email")}
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Name"
              placeholder="Your name"
              leftSection={<UserRound size={16} />}
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
          </Group>
          <Group justify="space-between" align="center" gap="md">
            <Text size="sm" c="dimmed">
              Course release notes, private enrollment windows, and new lesson updates.
            </Text>
            <Button type="submit">Subscribe</Button>
          </Group>
        </Stack>
      </form>
    );
  }
  ```

- [ ] **Step 2: Create `CourseLadder`**

  Render `COURSE_OFFERS` with Basic + Pro as the primary emphasized item. Use `Link` to `/courses`.

- [ ] **Step 3: Create `OfferDetailBlocks`**

  Render three varied blocks from `COURSE_OFFERS`. Use different class modifiers for `standard`, `primary`, and `strategy`; do not render identical equal cards.

- [ ] **Step 4: Create `PlatformTrust`**

  Render `PLATFORM_TRUST_POINTS` in a compact trust section with buyer-facing language only.

- [ ] **Step 5: Create `FinalCta`**

  Render two CTAs: `Link` to `/courses` and anchor link to `#updates`.

- [ ] **Step 6: Add marketing CSS**

  In `apps/web/src/index.css`, add responsive classes for:

  ```css
  .pc-marketing-section {
  }
  .pc-marketing-section__header {
  }
  .pc-ladder {
  }
  .pc-ladder__item {
  }
  .pc-ladder__item--primary {
  }
  .pc-offer-blocks {
  }
  .pc-offer {
  }
  .pc-offer--primary {
  }
  .pc-offer--strategy {
  }
  .pc-subscribe {
  }
  .pc-subscribe-form {
  }
  .pc-trust {
  }
  .pc-final-cta {
  }
  ```

  Requirements:

  - Use CSS Grid for desktop layouts.
  - Collapse to one column below `48rem`.
  - Keep buttons and form fields from overlapping on mobile.
  - Use a monochrome or cold-neutral base with one accent.
  - Do not add gradients, orbs, bokeh, or Tailwind utilities.

- [ ] **Step 7: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 8: Commit**

  ```bash
  git add apps/web/src/features/marketing apps/web/src/index.css
  git commit -m "feat: add product atelier marketing sections"
  ```

---

### Task 3: Homepage Structural Overwrite

**Files:**

- Modify: `apps/web/src/routes/index.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: marketing components from Task 2.
- Produces: homepage with sections in this order:
  - hero
  - course ladder
  - outcomes
  - course detail blocks
  - subscribe
  - platform trust
  - final CTA

- [ ] **Step 1: Replace homepage composition**

  Rewrite `HomeComponent` so it no longer uses `featuredCourse`, `visibleCourses`, or `CourseCard` as the homepage structure. Keep the existing `publishedCoursesQueryOptions` loader and `useQuery` call only if needed to link real course data.

- [ ] **Step 2: Build the hero**

  Use an asymmetric structure:

  ```tsx
  <section className="pc-home-hero">
    <div className="pc-home-hero__copy">...</div>
    <div className="pc-home-hero__panel">...</div>
  </section>
  ```

  Required copy themes:

  - Product Atelier is a private course system.
  - It covers hair extension technique and social media strategy.
  - It promotes all three courses in the first viewport.

- [ ] **Step 3: Add the full section sequence**

  Render:

  ```tsx
  <CourseLadder />
  <section className="pc-marketing-section">outcomes from OUTCOME_POINTS</section>
  <OfferDetailBlocks />
  <section id="updates" className="pc-subscribe"><SubscribeForm /></section>
  <PlatformTrust />
  <FinalCta />
  ```

- [ ] **Step 4: Remove old homepage imports**

  Remove unused imports such as `CourseCard`, `FormSection`, `PageHeader`, `StatusBadge`, `TextInput`, `SimpleGrid`, `AtSign`, and `Phone` if they are no longer used.

- [ ] **Step 5: Add hero CSS**

  Add `.pc-home-hero`, `.pc-home-hero__copy`, `.pc-home-hero__panel`, `.pc-home-hero__actions`, and responsive rules to `index.css`.

- [ ] **Step 6: Verify the structure in source**

  Run:

  ```bash
  rg -n "CourseLadder|OfferDetailBlocks|SubscribeForm|PlatformTrust|FinalCta|featuredCourse|visibleCourses" apps/web/src/routes/index.tsx
  ```

  Expected:

  - New components appear.
  - `featuredCourse` does not appear.
  - `visibleCourses` does not appear.

- [ ] **Step 7: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 8: Commit**

  ```bash
  git add apps/web/src/routes/index.tsx apps/web/src/index.css
  git commit -m "feat: overwrite homepage structure"
  ```

---

### Task 4: Header And Public Course Pages

**Files:**

- Modify: `apps/web/src/components/header.tsx`
- Modify: `apps/web/src/routes/courses/index.tsx`
- Modify: `apps/web/src/routes/courses/$courseSlug/index.tsx`
- Modify: `apps/web/src/components/ui/course-card.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: `COURSE_OFFERS` for public positioning copy when static marketing context is needed.
- Produces: public navigation and course pages that match the SaaS homepage while preserving data-loaded courses.

- [ ] **Step 1: Update header information architecture**

  Keep links to home, courses, profile/admin when available, and auth actions. Make the brand read as `Product Atelier` in the visible brand text while preserving app routing behavior.

- [ ] **Step 2: Rework `/courses` page**

  Keep route loader and course query. Change the page from a plain catalog into a public course library with:

  - Header copy that mirrors the three-offer ladder.
  - Data-backed course list.
  - Empty state that says course releases are being prepared.

- [ ] **Step 3: Rework course detail page**

  Keep access checks and lesson queries. Update copy/layout to make course access, preview, and private playback clearer to buyers/students.

- [ ] **Step 4: Keep `CourseCard` as an app/catalog primitive**

  Ensure `CourseCard` remains useful for public catalog and student library pages, but do not make it the homepage's primary structure.

- [ ] **Step 5: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/components/header.tsx apps/web/src/routes/courses apps/web/src/components/ui/course-card.tsx apps/web/src/index.css
  git commit -m "feat: align public course pages with saas structure"
  ```

---

### Task 5: Student And Lesson Experience Alignment

**Files:**

- Modify: `apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx`
- Modify: `apps/web/src/features/course/lesson-player-ui.tsx`
- Modify: `apps/web/src/features/course/lesson-navigation.tsx`
- Modify: `apps/web/src/features/course/lesson-player.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: existing lesson playback token behavior and lesson navigation props.
- Produces: lesson/player experience that feels like the same premium private platform.

- [ ] **Step 1: Inspect playback behavior**

  Read the current player components and identify which component requests playback tokens. Do not move token enforcement to the client or bypass backend checks.

- [ ] **Step 2: Rework player chrome**

  Keep playback logic unchanged. Update surrounding layout, lesson metadata, and navigation surfaces with Product Atelier classes.

- [ ] **Step 3: Rework lesson navigation**

  Keep locked/current/completed behavior. Make rows easier to scan and match the new surface/radius/token system.

- [ ] **Step 4: Add player CSS**

  Add or update `.pc-player-*` and `.pc-lesson-*` classes. Use stable dimensions so the player and lesson list do not shift during loading/error states.

- [ ] **Step 5: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/routes/courses/$courseSlug/lessons/$lessonSlug.tsx apps/web/src/features/course apps/web/src/index.css
  git commit -m "feat: align lesson player experience"
  ```

---

### Task 6: Auth And Profile Surfaces

**Files:**

- Modify: `apps/web/src/routes/login.tsx`
- Modify: `apps/web/src/components/sign-in-form.tsx`
- Modify: `apps/web/src/components/sign-up-form.tsx`
- Modify: `apps/web/src/routes/_auth/profile.tsx`
- Modify: `apps/web/src/features/profile/account-section.tsx`
- Modify: `apps/web/src/features/profile/password-section.tsx`
- Modify: `apps/web/src/features/profile/passkeys-section.tsx`
- Modify: `apps/web/src/features/profile/sessions-section.tsx`
- Modify: `apps/web/src/features/profile/passkey-row.tsx`
- Modify: `apps/web/src/features/profile/session-row.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: existing Better Auth client forms and mutation behavior.
- Produces: auth/profile pages aligned with the course platform positioning.

- [ ] **Step 1: Rework login page layout**

  Keep sign-in/sign-up behavior. Make the page read as entry into the private Product Atelier learning workspace.

- [ ] **Step 2: Rework form containers**

  Keep validation and submission behavior. Use Mantine form controls and shared surfaces consistently.

- [ ] **Step 3: Rework profile page**

  Keep account, password, passkeys, and sessions behavior. Reduce marketing flourish and make the page feel like a premium SaaS account area.

- [ ] **Step 4: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 5: Commit**

  ```bash
  git add apps/web/src/routes/login.tsx apps/web/src/components/sign-in-form.tsx apps/web/src/components/sign-up-form.tsx apps/web/src/routes/_auth/profile.tsx apps/web/src/features/profile apps/web/src/index.css
  git commit -m "feat: align auth and profile surfaces"
  ```

---

### Task 7: Admin Operational SaaS Alignment

**Files:**

- Modify: `apps/web/src/routes/_auth/admin/index.tsx`
- Modify: `apps/web/src/routes/_auth/admin/route.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/new.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/index.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/access.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/new.tsx`
- Modify: `apps/web/src/routes/_auth/admin/courses/$courseId/lessons/$lessonId.tsx`
- Modify: `apps/web/src/components/course-form.tsx`
- Modify: `apps/web/src/components/lesson-form.tsx`
- Modify: `apps/web/src/features/admin/video-upload-panel.tsx`
- Modify: `apps/web/src/index.css`

**Interfaces:**

- Consumes: existing admin procedures, forms, mutations, invalidation, and `toast.error(error.message)` handling.
- Produces: admin pages that feel like operational SaaS tools rather than marketing cards.

- [ ] **Step 1: Rework admin index**

  Preserve loaded data and admin-only behavior. Update table/header/empty states for a clean operational dashboard.

- [ ] **Step 2: Rework course and lesson forms**

  Preserve fields, validation, submit handlers, and invalidation. Improve grouping, spacing, and helper copy.

- [ ] **Step 3: Rework access management**

  Preserve grant/revoke behavior. Improve scanning with clearer user/course/access status layout.

- [ ] **Step 4: Rework upload panel**

  Preserve upload behavior. Align upload progress, errors, and successful video states with the product system.

- [ ] **Step 5: Run verification**

  Run:

  ```bash
  vp run check-types
  vp exec knip --reporter github-actions
  ```

  Expected: both pass.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/routes/_auth/admin apps/web/src/components/course-form.tsx apps/web/src/components/lesson-form.tsx apps/web/src/features/admin/video-upload-panel.tsx apps/web/src/index.css
  git commit -m "feat: align admin course management"
  ```

---

### Task 8: Visual QA, Build Verification, And PR Update

**Files:**

- Modify only if verification reveals defects.

**Interfaces:**

- Consumes: all previous tasks.
- Produces: verified branch pushed to PR #11.

- [ ] **Step 1: Run source verification**

  Run:

  ```bash
  vp run check
  vp run test
  vp exec react-doctor --no-telemetry -y --verbose
  ```

  Expected:

  - `vp run check` passes.
  - `vp run test` passes.
  - React Doctor reports no errors.

- [ ] **Step 2: Run smoke when local environment is available**

  Run:

  ```bash
  vp run smoke
  ```

  Expected: pass, unless the existing smoke suite has known dev-only limitations. If it fails, record the exact failing check and whether it is caused by this redesign.

- [ ] **Step 3: Start the web app for visual QA**

  Run:

  ```bash
  vp run dev:web
  ```

  Expected: local Vite URL is printed.

- [ ] **Step 4: Inspect desktop homepage**

  Open the homepage at desktop width. Verify:

  - First viewport promotes all three courses.
  - Hero is asymmetric.
  - Basic + Pro is visually emphasized.
  - Subscribe form appears before the final CTA.
  - Text does not overlap.
  - Buttons and form fields fit their containers.

- [ ] **Step 5: Inspect mobile homepage**

  Open the homepage at mobile width. Verify:

  - Course ladder stacks cleanly.
  - Buttons wrap without overflow.
  - Form fields fit.
  - No section feels like three generic equal cards.

- [ ] **Step 6: Inspect app pages**

  Visit:

  - `/courses`
  - one course detail page
  - one lesson page when access/dev data allows
  - `/login`
  - `/profile` when authenticated
  - `/admin` when authenticated as admin

  Verify visual alignment and unchanged route behavior.

- [ ] **Step 7: Fix verification defects**

  If any verification fails because of this redesign, make the smallest focused fix and rerun the failing command.

- [ ] **Step 8: Commit verification fixes if needed**

  ```bash
  git add apps/web/src
  git commit -m "fix: polish product atelier saas overwrite"
  ```

- [ ] **Step 9: Push**

  ```bash
  git push
  ```

- [ ] **Step 10: Check PR status**

  Run:

  ```bash
  gh pr checks 11
  ```

  Expected: Source Build and React Doctor are passing or pending on the new head commit.

---

## Self-Review

Spec coverage:

- Three course offers are covered in Task 1 and rendered in Tasks 2 and 3.
- Basic + Pro access hierarchy is covered in the static offer model and Course Ladder.
- Subscribe form is covered in Task 2 and placed in homepage order in Task 3.
- Full structural homepage overwrite is covered in Task 3.
- Public, student, lesson, auth, profile, and admin pages are covered in Tasks 4 through 7.
- No Tailwind dependency is preserved as a global constraint and CSS requirement.
- Verification expectations are covered in Task 8.

Placeholder scan:

- No placeholder instructions are intentionally used.
- Each task has concrete files, interfaces, verification, and commit commands.

Type consistency:

- `CourseOffer`, `OutcomePoint`, `PlatformTrustPoint`, `COURSE_OFFERS`, `OUTCOME_POINTS`, and `PLATFORM_TRUST_POINTS` are introduced once in Task 1 and consumed consistently in later tasks.
