// EGP Aesthetics Design System
// Centralized design tokens for consistent styling across the site
// Beige + Green color palette

import { aestheticsColors, colorClasses, typography, forms } from "./colors";

// Export all design system tokens
export const designSystem = {
  colors: aestheticsColors,
  colorClasses,
  typography,
  forms,
};

// Helper functions for common use cases
export const getButtonClasses = (
  variant: "primary" | "secondary" | "accent" | "dark" | "whatsapp" = "primary",
) => {
  const variants = {
    primary: colorClasses.btnPrimary,
    secondary: colorClasses.btnSecondary,
    accent: colorClasses.btnAccent,
    dark: colorClasses.btnDark,
    whatsapp: colorClasses.btnWhatsApp,
  };

  return variants[variant] || variants.primary;
};

// Section background classes
export const getSectionClasses = (dark: boolean = false) => {
  return dark ? colorClasses.sectionDark : colorClasses.section;
};

// Card background classes
export const getCardClasses = (dark: boolean = false) => {
  return dark ? colorClasses.cardDark : colorClasses.card;
};

// Text color classes based on background
export const getTextClasses = (
  onDark: boolean = false,
  onGreen: boolean = false,
) => {
  if (onGreen || onDark) return typography.onGreen;

  return typography.body;
};

// Form layout - consistent spacing for admin forms
export const formLayout = {
  /** Modal body padding - mobile first */
  modalBody: "p-4 sm:p-6",
  /** Form section spacing */
  sectionGap: "space-y-4 sm:space-y-6",
  /** Grid for 2-column layout on desktop */
  gridFields: "grid grid-cols-1 md:grid-cols-2 gap-4",
  /** Full-width field (spans both columns) */
  fullWidth: "md:col-span-2",
  /** Form field gap within a row */
  fieldGap: "gap-4",
};

/** Booking flow CTAs — compact on mobile (~44px), full size from `sm` */
export const bookingCtaButtonClassName =
  "min-h-11 inline-flex items-center justify-center touch-manipulation text-sm font-semibold rounded-lg px-4 py-2 [-webkit-tap-highlight-color:transparent] sm:min-h-14 sm:text-base sm:rounded-xl sm:px-5";

/** Secondary pill controls (filters, clear selection) */
export const bookingCtaCompactClassName =
  "min-h-10 touch-manipulation rounded-full px-3.5 text-xs font-semibold [-webkit-tap-highlight-color:transparent] sm:min-h-11 sm:px-4 sm:text-sm";

// Input component - label outside, no blue ring, single green border on focus
export const inputClassNames = {
  base: "input-egp",
  label: "text-base font-medium",
  input: "text-base outline-none focus:outline-none focus-visible:outline-none",
  inputWrapper: [
    "shadow-none !shadow-[none]",
    "!ring-0 !ring-transparent",
    "data-[focus-within]:!shadow-none data-[focus-within]:!ring-0",
    "data-[focus-within]:border-2 data-[focus-within]:border-[#464C45]",
  ].join(" "),
};

// Export default
export default designSystem;
