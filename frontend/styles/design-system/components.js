/**
 * Design System - Component Variants
 * Consistent component styling definitions
 */

import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { typography } from './typography';

export const componentVariants = {
  // Button variants
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      textDecoration: 'none',
      userSelect: 'none',
      '&:focus': {
        outline: '2px solid',
        outlineColor: colors.primary[500],
        outlineOffset: '2px',
      },
      '&:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[600],
        color: colors.text.primary,
        '&:hover': {
          backgroundColor: colors.primary[700],
        },
        '&:active': {
          backgroundColor: colors.primary[800],
        },
      },
      secondary: {
        backgroundColor: colors.gray[600],
        color: colors.text.primary,
        '&:hover': {
          backgroundColor: colors.gray[700],
        },
        '&:active': {
          backgroundColor: colors.gray[800],
        },
      },
      danger: {
        backgroundColor: colors.error[600],
        color: colors.text.primary,
        '&:hover': {
          backgroundColor: colors.error[700],
        },
        '&:active': {
          backgroundColor: colors.error[800],
        },
      },
      success: {
        backgroundColor: colors.success[600],
        color: colors.text.primary,
        '&:hover': {
          backgroundColor: colors.success[700],
        },
        '&:active': {
          backgroundColor: colors.success[800],
        },
      },
      warning: {
        backgroundColor: colors.warning[600],
        color: colors.text.primary,
        '&:hover': {
          backgroundColor: colors.warning[700],
        },
        '&:active': {
          backgroundColor: colors.warning[800],
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.text.secondary,
        border: `1px solid ${colors.border.primary}`,
        '&:hover': {
          backgroundColor: colors.gray[700],
          color: colors.text.primary,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.primary[400],
        border: `1px solid ${colors.primary[600]}`,
        '&:hover': {
          backgroundColor: colors.primary[600],
          color: colors.text.primary,
        },
      },
    },
    sizes: {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
        minHeight: '2rem',
      },
      md: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.sm,
        minHeight: '2.5rem',
      },
      lg: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        minHeight: '3rem',
      },
      xl: {
        padding: `${spacing[4]} ${spacing[8]}`,
        fontSize: typography.fontSize.lg,
        minHeight: '3.5rem',
      },
    },
  },

  // Input variants
  input: {
    base: {
      width: '100%',
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.border.primary}`,
      backgroundColor: colors.background.secondary,
      color: colors.text.primary,
      fontSize: typography.fontSize.base,
      transition: 'all 0.2s ease-in-out',
      '&::placeholder': {
        color: colors.text.tertiary,
      },
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 3px ${colors.primary[500]}20`,
      },
      '&:hover': {
        borderColor: colors.border.secondary,
      },
      '&:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
    },
    sizes: {
      sm: {
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
      },
      md: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
      },
      lg: {
        padding: `${spacing[4]} ${spacing[5]}`,
        fontSize: typography.fontSize.lg,
      },
    },
    states: {
      error: {
        borderColor: colors.error[500],
        '&:focus': {
          borderColor: colors.error[500],
          boxShadow: `0 0 0 3px ${colors.error[500]}20`,
        },
      },
      success: {
        borderColor: colors.success[500],
        '&:focus': {
          borderColor: colors.success[500],
          boxShadow: `0 0 0 3px ${colors.success[500]}20`,
        },
      },
    },
  },

  // Card variants
  card: {
    base: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.border.primary}`,
      transition: 'all 0.3s ease-in-out',
    },
    variants: {
      default: {
        boxShadow: shadows.sm,
      },
      elevated: {
        boxShadow: shadows.lg,
        '&:hover': {
          boxShadow: shadows.xl,
          transform: 'translateY(-2px)',
        },
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `2px solid ${colors.border.primary}`,
      },
      glass: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colors.border.primary}`,
      },
      gradient: {
        background: `linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.background.tertiary} 100%)`,
      },
    },
    padding: {
      none: '0',
      sm: spacing[3],
      md: spacing[6],
      lg: spacing[8],
      xl: spacing[10],
    },
  },

  // Modal variants
  modal: {
    overlay: {
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: '50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
    },
    content: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.xl,
      boxShadow: shadows['2xl'],
      border: `1px solid ${colors.border.primary}`,
      width: '100%',
      position: 'relative',
    },
    sizes: {
      sm: { maxWidth: '28rem' },
      md: { maxWidth: '32rem' },
      lg: { maxWidth: '48rem' },
      xl: { maxWidth: '64rem' },
      full: { maxWidth: '100%', margin: spacing[4] },
    },
  },

  // Alert variants
  alert: {
    base: {
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      border: '1px solid',
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[3],
    },
    variants: {
      success: {
        backgroundColor: colors.status.success.bg,
        borderColor: colors.status.success.border,
        color: colors.status.success.text,
      },
      warning: {
        backgroundColor: colors.status.warning.bg,
        borderColor: colors.status.warning.border,
        color: colors.status.warning.text,
      },
      error: {
        backgroundColor: colors.status.error.bg,
        borderColor: colors.status.error.border,
        color: colors.status.error.text,
      },
      info: {
        backgroundColor: colors.status.info.bg,
        borderColor: colors.status.info.border,
        color: colors.status.info.text,
      },
    },
  },

  // Table variants
  table: {
    base: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    header: {
      backgroundColor: colors.background.tertiary,
      borderBottom: `1px solid ${colors.border.primary}`,
    },
    cell: {
      padding: spacing[3],
      borderBottom: `1px solid ${colors.border.primary}50`,
      color: colors.text.secondary,
    },
    row: {
      '&:hover': {
        backgroundColor: colors.background.tertiary + '50',
      },
    },
  },
};

export default componentVariants;
