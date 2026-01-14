"use client";

import { Button as HeroUIButton, ButtonProps } from "@heroui/react";
import { getButtonClasses } from "@/config/design-system";
import { forwardRef } from "react";

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'dark' | 'whatsapp';

interface ButtonPrimaryProps extends Omit<ButtonProps, 'variant'> {
  variant?: ButtonVariant;
  useDesignSystem?: boolean;
}

/**
 * Centralized Button component that uses design system colors
 * All button colors can be changed from one place (config/colors.ts)
 */
const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ variant = 'primary', useDesignSystem = true, className = '', ...props }, ref) => {
    const designSystemClasses = useDesignSystem ? getButtonClasses(variant) : '';
    
    return (
      <HeroUIButton
        ref={ref}
        {...props}
        className={`${designSystemClasses} ${className}`.trim()}
      />
    );
  }
);

ButtonPrimary.displayName = "ButtonPrimary";

export default ButtonPrimary;

