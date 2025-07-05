/**
 * Design System - Spacing
 * Consistent spacing definitions for the entire application
 */

export const spacing = {
  // Base spacing scale (rem units)
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// Component-specific spacing
export const componentSpacing = {
  // Button spacing
  button: {
    paddingX: {
      sm: spacing[3],    // 12px
      md: spacing[4],    // 16px
      lg: spacing[6],    // 24px
      xl: spacing[8],    // 32px
    },
    paddingY: {
      sm: spacing[1.5],  // 6px
      md: spacing[2],    // 8px
      lg: spacing[3],    // 12px
      xl: spacing[4],    // 16px
    },
    gap: spacing[2],     // 8px (between icon and text)
  },

  // Input spacing
  input: {
    paddingX: {
      sm: spacing[3],    // 12px
      md: spacing[4],    // 16px
      lg: spacing[5],    // 20px
    },
    paddingY: {
      sm: spacing[2],    // 8px
      md: spacing[3],    // 12px
      lg: spacing[4],    // 16px
    },
  },

  // Card spacing
  card: {
    padding: {
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
      xl: spacing[10],   // 40px
    },
    gap: spacing[4],     // 16px (between card elements)
  },

  // Modal spacing
  modal: {
    padding: {
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
    gap: spacing[6],     // 24px (between modal sections)
  },

  // Table spacing
  table: {
    cellPadding: {
      sm: spacing[2],    // 8px
      md: spacing[3],    // 12px
      lg: spacing[4],    // 16px
    },
    rowGap: spacing[1],  // 4px
  },

  // Form spacing
  form: {
    fieldGap: spacing[4],      // 16px (between form fields)
    sectionGap: spacing[6],    // 24px (between form sections)
    labelGap: spacing[1],      // 4px (between label and input)
  },

  // Layout spacing
  layout: {
    containerPadding: {
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
    sectionGap: {
      sm: spacing[6],    // 24px
      md: spacing[8],    // 32px
      lg: spacing[12],   // 48px
    },
    headerHeight: spacing[16], // 64px
    sidebarWidth: spacing[64], // 256px
  },

  // Grid spacing
  grid: {
    gap: {
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
  },
};

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// Shadow scale
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// CSS custom properties for spacing
export const spacingCssVariables = {
  '--spacing-1': spacing[1],
  '--spacing-2': spacing[2],
  '--spacing-3': spacing[3],
  '--spacing-4': spacing[4],
  '--spacing-5': spacing[5],
  '--spacing-6': spacing[6],
  '--spacing-8': spacing[8],
  '--spacing-10': spacing[10],
  '--spacing-12': spacing[12],
  '--spacing-16': spacing[16],
  '--spacing-20': spacing[20],
  '--spacing-24': spacing[24],
  
  '--border-radius-sm': borderRadius.sm,
  '--border-radius-md': borderRadius.md,
  '--border-radius-lg': borderRadius.lg,
  '--border-radius-xl': borderRadius.xl,
  '--border-radius-2xl': borderRadius['2xl'],
  
  '--shadow-sm': shadows.sm,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  '--shadow-xl': shadows.xl,
};

export default spacing;
