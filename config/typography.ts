/**
 * EGP typography and layout design tokens.
 * Use these classes across the app for consistent responsive typography and spacing.
 * Mobile-first: base = mobile, sm/md/lg = larger breakpoints.
 */

export const typography = {
  /** Page title (e.g. hero h1, page h1) - same size on all viewports for consistency */
  headingPage:
    "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
  /** Hero-only: slightly larger on desktop, still readable on mobile */
  headingHero:
    "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight",
  /** Section title (h2) on landing and inner pages */
  headingSection:
    "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight",
  /** Card / block title (h3) */
  headingCard: "text-lg sm:text-xl md:text-2xl font-bold",
  /** Small heading (h4) */
  headingSmall: "text-base sm:text-lg font-semibold",
  /** Lead paragraph under a heading */
  lead: "text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed",
  /** Body text */
  body: "text-sm sm:text-base leading-relaxed",
  /** Small / caption */
  small: "text-xs sm:text-sm text-gray-500 dark:text-gray-400",
} as const;

/** Container max-width and horizontal padding - use on section wrappers */
export const layout = {
  /** Outer wrapper: max-width + horizontal padding */
  container:
    "w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
  /** Narrow content (forms, single column) */
  containerNarrow: "w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
  /** Wide (hero, full-width sections that need inner constraint) */
  containerWide: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  /** Section vertical padding - consistent between sections */
  sectionPy: "py-10 sm:py-12 md:py-16 lg:py-20",
  /** Section vertical padding - smaller (between related blocks) */
  sectionPySm: "py-8 sm:py-10 md:py-12",
} as const;

/** Text color utilities for headings/body that work in light and dark */
export const textColors = {
  heading: "text-gray-900 dark:text-white",
  body: "text-gray-700 dark:text-gray-300",
  muted: "text-gray-600 dark:text-gray-400",
} as const;
