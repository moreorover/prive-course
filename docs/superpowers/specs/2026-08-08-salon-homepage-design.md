# Salon Homepage Design

## Goal

Change the public homepage from a platform feature pitch into a soft salon course storefront for a single small business using `priauginimas.lt`.

## Scope

- Show published courses on the homepage using the existing public course catalog query.
- Add a visually complete subscription interest form with required email and optional full name, Instagram, and phone number.
- Keep the form UI-only for now. It must not call a public API or persist data.
- Refresh the global visual tone to feel softer and more salon-oriented while keeping the existing Mantine, Tailwind utility, and TanStack Router patterns.

## Content Direction

- Lead with available beauty course content, not platform infrastructure.
- Use gentle, practical copy for women browsing salon education.
- Keep calls to action focused on viewing courses and registering interest in future course updates or promotions.
- Use `priauginimas.lt` as the public domain signal.

## Visual Direction

- Palette: soft ivory canvas, blush panels, muted berry accents, rose-clay borders, sage support color, espresso text.
- Typography: keep Inter for implementation simplicity, with a more editorial display treatment through scale, weight, and line-height.
- Layout: course cards should feel like a salon treatment menu, with compact labels and calm spacing.
- Signature element: a featured course panel styled like an appointment/course card, making the first available course the first-viewport signal.

## Interaction

- Homepage loader preloads published courses via TanStack Query.
- Empty course state says new classes are being prepared.
- Subscription form validates email locally and shows a success toast. Optional fields are accepted but not submitted anywhere.
