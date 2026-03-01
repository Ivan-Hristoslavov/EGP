---
name: egp-typography
description: Typography and layout tokens for EGP Aesthetics. Use when editing headings, sections, containers, or ensuring responsive design on public or admin pages.
---

# EGP Typography & Layout

## Tokens (config/typography.ts)

- **typography.headingPage** — Page h1: `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`
- **typography.headingHero** — Hero h1 only: adds `xl:text-6xl`
- **typography.headingSection** — Section h2: `text-xl sm:text-2xl md:text-3xl lg:text-4xl`
- **typography.headingCard** — Card h3: `text-lg sm:text-xl md:text-2xl`
- **typography.headingSmall** — h4: `text-base sm:text-lg font-semibold`
- **typography.lead** — Lead paragraph
- **typography.body** — Body text
- **typography.small** — Caption
- **layout.container** — `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- **layout.containerWide** — `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **layout.sectionPy** — Section vertical padding
- **textColors.heading**, **textColors.body**, **textColors.muted**

## Rules

- No raw `text-4xl`, `text-5xl`, `text-6xl` without smaller mobile size.
- Import from `@/config/typography`.
