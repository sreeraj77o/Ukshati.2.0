/**
 * Design System - Color Palette
 * Consistent color definitions for the entire application
 */

export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info colors
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main info
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Gray scale (for dark theme)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937', // Main background
    900: '#111827', // Darker background
    950: '#030712', // Darkest background
  },

  // Brand colors
  brand: {
    ukshati: '#3b82f6', // Primary brand color
    accent: '#10b981',   // Accent color for highlights
  },

  // Semantic colors for dark theme
  background: {
    primary: '#000000',    // Main background (black)
    secondary: '#111827',  // Card backgrounds
    tertiary: '#1f2937',   // Elevated surfaces
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
  },

  text: {
    primary: '#ffffff',    // Main text
    secondary: '#d1d5db',  // Secondary text
    tertiary: '#9ca3af',   // Muted text
    inverse: '#111827',    // Text on light backgrounds
  },

  border: {
    primary: '#374151',    // Main borders
    secondary: '#4b5563',  // Hover borders
    focus: '#3b82f6',      // Focus borders
  },

  // Status colors with opacity variants
  status: {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: '#4ade80',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#f87171',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      text: '#60a5fa',
    },
  },
};

// CSS custom properties for easy usage
export const cssVariables = {
  '--color-primary': colors.primary[500],
  '--color-primary-hover': colors.primary[600],
  '--color-secondary': colors.secondary[500],
  '--color-success': colors.success[500],
  '--color-warning': colors.warning[500],
  '--color-error': colors.error[500],
  '--color-info': colors.info[500],
  
  '--color-bg-primary': colors.background.primary,
  '--color-bg-secondary': colors.background.secondary,
  '--color-bg-tertiary': colors.background.tertiary,
  
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  
  '--color-border-primary': colors.border.primary,
  '--color-border-secondary': colors.border.secondary,
  '--color-border-focus': colors.border.focus,
};

export default colors;
