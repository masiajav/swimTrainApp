import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#3b82f6',
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

export default StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: TOKENS ? COLORS.background : '#fff',
  },
  container: {
    paddingHorizontal: TOKENS.spacing.lg,
    paddingVertical: TOKENS.spacing.lg,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: TOKENS.spacing.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderBottomLeftRadius: TOKENS.radius.lg,
    borderBottomRightRadius: TOKENS.radius.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: TOKENS.radius.md,
    padding: TOKENS.spacing.lg,
    ...TOKENS.shadow.depth1,
  },
});

