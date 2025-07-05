/**
 * Design System - Typography
 * Consistent typography definitions for the entire application
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text styles for common use cases
  textStyles: {
    // Headings
    h1: {
      fontSize: '3rem',
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: '600',
      lineHeight: '1.375',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.375',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.5',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.5',
    },

    // Body text
    body: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    bodyLarge: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.625',
    },
    bodySmall: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },

    // Labels and captions
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.25',
    },

    // Interactive elements
    button: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25',
      letterSpacing: '0.025em',
    },
    buttonLarge: {
      fontSize: '1rem',
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: '0.025em',
    },
    buttonSmall: {
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: '1.25',
      letterSpacing: '0.025em',
    },

    // Code and monospace
    code: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
    },
    codeInline: {
      fontSize: '0.875rem',
      fontWeight: '400',
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
    },
  },
};

// CSS custom properties for typography
export const typographyCssVariables = {
  '--font-family-sans': typography.fontFamily.sans.join(', '),
  '--font-family-mono': typography.fontFamily.mono.join(', '),
  '--font-family-display': typography.fontFamily.display.join(', '),
  
  '--font-size-xs': typography.fontSize.xs,
  '--font-size-sm': typography.fontSize.sm,
  '--font-size-base': typography.fontSize.base,
  '--font-size-lg': typography.fontSize.lg,
  '--font-size-xl': typography.fontSize.xl,
  '--font-size-2xl': typography.fontSize['2xl'],
  '--font-size-3xl': typography.fontSize['3xl'],
  '--font-size-4xl': typography.fontSize['4xl'],
  
  '--font-weight-normal': typography.fontWeight.normal,
  '--font-weight-medium': typography.fontWeight.medium,
  '--font-weight-semibold': typography.fontWeight.semibold,
  '--font-weight-bold': typography.fontWeight.bold,
  
  '--line-height-tight': typography.lineHeight.tight,
  '--line-height-normal': typography.lineHeight.normal,
  '--line-height-relaxed': typography.lineHeight.relaxed,
};

// Utility classes for common text styles
export const textUtilities = {
  '.text-h1': typography.textStyles.h1,
  '.text-h2': typography.textStyles.h2,
  '.text-h3': typography.textStyles.h3,
  '.text-h4': typography.textStyles.h4,
  '.text-h5': typography.textStyles.h5,
  '.text-h6': typography.textStyles.h6,
  '.text-body': typography.textStyles.body,
  '.text-body-large': typography.textStyles.bodyLarge,
  '.text-body-small': typography.textStyles.bodySmall,
  '.text-label': typography.textStyles.label,
  '.text-caption': typography.textStyles.caption,
  '.text-button': typography.textStyles.button,
  '.text-code': typography.textStyles.code,
};

export default typography;
