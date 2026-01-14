// EGP Aesthetics Design System
// Centralized design tokens for consistent styling across the site
// Beige + Green color palette

import { aestheticsColors, colorClasses, typography, forms } from './colors';

// Export all design system tokens
export const designSystem = {
  colors: aestheticsColors,
  colorClasses,
  typography,
  forms,
};

// Helper functions for common use cases
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'accent' | 'dark' | 'whatsapp' = 'primary') => {
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
export const getTextClasses = (onDark: boolean = false, onGreen: boolean = false) => {
  if (onGreen || onDark) return typography.onGreen;
  return typography.body;
};

// Export default
export default designSystem;

