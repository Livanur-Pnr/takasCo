/**
 * Ultimate Scout Design System
 * Clean, minimal aesthetic with strategic accent colors.
 *
 * Usage: Copy this folder into your project and adjust imports.
 * - React Native/Expo: use as-is
 * - Web (React): replace Platform.select with web equivalents
 */

// ── Brand Colors ──
export const Brand = {
  primary: '#111827',       // near-black — primary buttons, text
  primaryDark: '#0d1016',   // tab bar, deepest dark
  accent: '#10b981',        // emerald green — success, active, CTA
  accentLight: '#d1fae5',   // light green background
  danger: '#ef4444',        // red — errors, risk
  warning: '#f59e0b',       // amber — pending, warning
  info: '#3b82f6',          // blue — info, links
  purple: '#9C27B0',        // accent for special cards
  orange: '#FF9800',        // secondary accent
  success: '#10b981',       // added for status badges
} as const;

export const Colors = {
  light: {
    text: '#111827',
    background: '#fafafa',
    backgroundElement: '#ffffff',
    backgroundSelected: '#f3f4f6',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    inputBg: '#ffffff',
    cardBg: '#ffffff',
  },
  dark: {
    text: '#f9fafb',
    background: '#111827',
    backgroundElement: '#1f2937',
    backgroundSelected: '#374151',
    textSecondary: '#9ca3af',
    border: '#374151',
    inputBg: '#1f2937',
    cardBg: '#1f2937',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ── Fonts ──
// Adjust per platform/framework as needed
export const Fonts = {
  sans: 'system-ui',
  serif: 'ui-serif',
  rounded: 'ui-rounded',
  mono: 'ui-monospace',
};

// ── Spacing (4, 8, 12, 16, 20, 24, 32, 64) ──
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 64,
} as const;

// ── Border Radius ──
export const Radius = {
  sm: 8,      // inputs, buttons
  md: 12,     // search, filter
  lg: 16,     // cards, list items
  xl: 20,     // plan cards
  full: 40,   // pill, tab bar
  modal: 24,  // modal top corners
} as const;

// ── Shadows (React Native style) ──
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
