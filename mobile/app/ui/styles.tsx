import { StyleSheet } from 'react-native';

// Design tokens used across the app. Keep this minimal and stable so screens can
// safely consume them without importing raw color literals.
export const COLORS = {
  primary: '#3b82f6', // main blue brand
  primary600: '#2563eb',
  primary700: '#1e40af',
  accent: '#5eead4',
  success: '#10b981',
  background: '#f6f9ff',
  surface: '#ffffff',
  muted: '#64748b',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e6eefc',
  glass: 'rgba(255,255,255,0.06)',
};

export const TOKENS = {
  spacing: {
    xs: 6,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 999,
  },
  shadow: {
    depth1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    depth2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 10,
    },
  },
};

// Re-export tokens from internal `_ui` so implementations live outside routes.
export * from '../_ui/styles';

// Default placeholder component so Expo Router doesn't warn about missing
// default export for this file inside `app/`.
import React from 'react';
import { View } from 'react-native';

export default function _UIStylesRouterPlaceholder() {
  return <View />;
}
