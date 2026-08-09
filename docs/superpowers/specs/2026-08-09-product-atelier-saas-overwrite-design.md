# Product Atelier SaaS Overwrite Design

## Status

Approved direction: full structural overwrite toward a modern SaaS course-selling website.

This replaces the prior Product Atelier direction where the app kept too much of the same structure and mainly changed visual treatment.

## Design Read

This is a conversion-focused SaaS-style course platform for beauty professionals, salon operators, and creators who want to turn skill into paid services and online growth. The homepage must sell three specific course offers, explain the learning path clearly, and collect email interest before the user is ready to buy or enroll.

The product should feel polished, premium, and commercially useful. It should not feel like a generic online course catalog, a salon brochure, or a dashboard with a marketing hero attached.

Design dials:

- `DESIGN_VARIANCE: 7`
- `MOTION_INTENSITY: 4`
- `VISUAL_DENSITY: 4`

Stack direction:

- Use React, Vite, TanStack Router, Mantine, and custom CSS.
- Do not add Tailwind CSS.
- Keep existing routes, auth behavior, tRPC contracts, loaders, and server authorization intact.

## Course Offers

The public site promotes three courses:

1. Hair Extensions Course - Basic
2. Hair Extensions Course - Basic + Pro
3. Social Media Marketing Strategy

Access messaging:

- Buying Basic gives access to Basic.
- Buying Basic + Pro gives access to Basic and Basic + Pro.
- Buying Social Media Marketing Strategy gives access to that course.
- No new purchase logic or access automation is required for this redesign.

## Structural Goal

The redesign must change the page architecture, not just the component styling.

The homepage should no longer read as:

- Hero
- Generic course cards
- Basic update form

It should become:

- A conversion narrative
- A clear product ladder
- Course pathways with visible hierarchy
- Outcome-led selling sections
- A subscription capture point that feels intentional
- A final CTA that reinforces the platform offer

## Homepage Concepts

### Concept 1: Conversion SaaS Funnel

Recommended concept.

The page behaves like a focused SaaS landing page:

- Asymmetric hero with sharp commercial promise and a compact course-path module.
- Product ladder section showing Basic, Basic + Pro, and Social Media as connected offers.
- Outcome section framed around service quality, premium offers, and online demand.
- Course detail blocks with varied layouts instead of identical cards.
- Subscribe section as a strong conversion module, not a footer form.
- Final CTA with browse courses and subscribe actions.

Why this is strongest:

- It makes the three offers immediately legible.
- It supports future payments without needing payment UI now.
- It makes the access relationship for Basic + Pro easy to understand.
- It feels more like a premium product website than a course index.

### Concept 2: Editorial Premium Course Catalog

The page behaves like a refined course magazine:

- Large editorial hero with brand-forward typography.
- Courses shown as feature stories with deep spacing and rich copy.
- Subscribe form framed as an insider list.

Tradeoff:

- Stronger brand mood, weaker direct conversion clarity.
- More dependent on photography or highly specific visual assets.

### Concept 3: Guided Learning Path

The page behaves like a guided pathway:

- Hero asks the visitor to choose a growth track.
- Hair extension courses are presented as a ladder.
- Marketing strategy is presented as the growth engine after service skill.

Tradeoff:

- Very clear education model.
- Can feel more like onboarding than a homepage if overdone.

## Selected Homepage Structure

Use Concept 1, with a small amount of Concept 3 in the course ladder.

### 1. Hero

Purpose: establish Product Atelier as a premium course system, not a generic course website.

Required content:

- Headline about building a sharper beauty business through technique and strategy.
- Supporting copy that names hair extensions and social media growth.
- Primary CTA: view courses.
- Secondary CTA: get updates.
- Right-side or offset visual module that previews the three-course ladder.

Structural requirements:

- Avoid centered generic hero layout.
- Do not show one arbitrary featured course as the main hero object.
- The first viewport must communicate the full three-course platform.

### 2. Course Ladder

Purpose: explain what is sold and how the courses relate.

Required content:

- Basic: foundational hair extension training.
- Basic + Pro: advanced extension training and includes Basic.
- Social Media Marketing Strategy: independent marketing course.

Structural requirements:

- Do not use three identical cards with equal weight.
- Basic + Pro should be visibly positioned as the strongest or expanded offer.
- Include a short access note: Basic + Pro includes Basic.

### 3. Outcomes

Purpose: shift from course names to buyer outcomes.

Possible outcomes:

- Learn structured extension technique.
- Build confidence with real client services.
- Package a stronger premium offer.
- Create social content that brings attention to services.

Structural requirements:

- Use concise content blocks with strong hierarchy.
- Avoid generic feature labels such as "Flexible learning" unless tied to real product behavior.

### 4. Course Detail Blocks

Purpose: give each course enough room to sell.

Required content per course:

- Course title.
- Target learner.
- What the learner gets.
- Relationship to other courses when relevant.
- CTA to browse or open course.

Structural requirements:

- Use varied block composition.
- Basic + Pro can use a larger split block.
- Social Media can use a distinct strategy/marketing visual language while staying in the same system.

### 5. Subscribe Form

Purpose: capture interested visitors who are not ready to enroll.

Fields:

- Email required.
- Name optional only if the layout has room.

Behavior:

- Frontend-only submission is acceptable unless an existing endpoint is available.
- Show success with Sonner toast.
- Show validation errors in the form.

Structural requirements:

- It should appear before the final CTA, not only in the footer.
- It should feel like a product update list, launch list, or private course list.

### 6. Platform Trust

Purpose: explain the private course platform in buyer-facing language.

Content themes:

- Private protected lessons.
- Admin-managed course access.
- Course library for granted courses.
- Focused lesson watching experience.

Structural requirements:

- Do not expose backend implementation details.
- Keep copy commercial and plain.

### 7. Final CTA

Purpose: close the page with the offer structure.

Required content:

- Reinforce the three-course system.
- CTA to view courses.
- CTA to subscribe for updates.

## App-Wide Redesign Requirements

All pages should be brought into the new structural system:

- Home page
- Login and registration
- Student course library
- Public course catalog
- Course detail page
- Lesson player
- Profile and session pages
- Admin course list
- Admin course forms
- Admin lesson forms
- Admin access management

Rules:

- Preserve existing routes.
- Preserve all backend contracts.
- Preserve server-side authorization.
- Preserve route loaders for route-critical data.
- Preserve mutation invalidation behavior.
- Show mutation failures with `toast.error(error.message)`.
- Use Mantine for forms, tables, badges, modals, papers, and feedback states.
- Use custom CSS for brand layout and structural page composition.

## Visual System

The system should feel like Product Atelier:

- Premium SaaS education platform.
- Sharp, structured layout.
- High contrast neutral base.
- One restrained accent.
- Crisp typography.
- Intentional asymmetry on the homepage.
- Calm operational pages for students and admins.

Avoid:

- AI-purple gradients.
- Generic glass cards.
- Decorative orbs or bokeh.
- Three equal feature cards as the main page pattern.
- Salon brochure aesthetics.
- Beige and brass luxury defaults.
- Tailwind utility dependency.

## Implementation Boundaries

In scope:

- Full homepage structural rewrite.
- Shared visual primitives if they support the new structure.
- App-wide page layout updates so logged-in and admin pages match the new product.
- Subscribe form UI with frontend validation and success state.

Out of scope:

- Payment flow.
- New access logic.
- New backend newsletter endpoint unless one already exists.
- New Cloudflare Stream behavior.
- Changing route slugs.
- Replacing Mantine with another component library.

## Verification Expectations

Before completion:

- Run type checking.
- Run tests.
- Run Knip or the repo check command that includes Knip.
- Run React Doctor.
- Use browser or Playwright visual verification for desktop and mobile homepage layouts when browser support is available.

The final review should specifically check whether the homepage structure has changed, not only whether colors and components changed.
