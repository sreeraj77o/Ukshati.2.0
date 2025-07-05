/**
 * Design System - Main Export
 * Central export for all design system tokens and utilities
 */

import { colors, cssVariables } from './colors';
import { typography, typographyCssVariables, textUtilities } from './typography';
import { spacing, componentSpacing, borderRadius, shadows, spacingCssVariables } from './spacing';
import { componentVariants } from './components';

// Complete design system object
export const designSystem = {
  colors,
  typography,
  spacing,
  componentSpacing,
  borderRadius,
  shadows,
  componentVariants,
};

// All CSS custom properties combined
export const allCssVariables = {
  ...cssVariables,
  ...typographyCssVariables,
  ...spacingCssVariables,
};

// Utility functions for applying design system values
export const utils = {
  // Get color with opacity
  getColorWithOpacity: (color, opacity) => {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },

  // Get responsive spacing
  getResponsiveSpacing: (base, sm, md, lg) => ({
    [base]: spacing[base],
    [`@media (min-width: 640px)`]: { [base]: spacing[sm] },
    [`@media (min-width: 768px)`]: { [base]: spacing[md] },
    [`@media (min-width: 1024px)`]: { [base]: spacing[lg] },
  }),

  // Get component variant styles
  getComponentStyles: (component, variant, size) => {
    const baseStyles = componentVariants[component]?.base || {};
    const variantStyles = componentVariants[component]?.variants?.[variant] || {};
    const sizeStyles = componentVariants[component]?.sizes?.[size] || {};
    
    return {
      ...baseStyles,
      ...variantStyles,
      ...sizeStyles,
    };
  },

  // Generate CSS custom properties
  generateCssVariables: (variables) => {
    return Object.entries(variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  },
};

// Theme configuration
export const theme = {
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Animation easings
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// CSS-in-JS theme object (for styled-components, emotion, etc.)
export const styledTheme = {
  colors: colors,
  typography: typography,
  spacing: spacing,
  borderRadius: borderRadius,
  shadows: shadows,
  breakpoints: theme.breakpoints,
  zIndex: theme.zIndex,
  duration: theme.duration,
  easing: theme.easing,
};

// Tailwind CSS configuration extension
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        gray: colors.gray,
        brand: colors.brand,
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
        display: typography.fontFamily.display,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
      zIndex: theme.zIndex,
      transitionDuration: theme.duration,
      transitionTimingFunction: theme.easing,
    },
  },
};

// Export individual modules
export {
  colors,
  typography,
  spacing,
  componentSpacing,
  borderRadius,
  shadows,
  componentVariants,
  textUtilities,
};

// Default export
export default designSystem;
