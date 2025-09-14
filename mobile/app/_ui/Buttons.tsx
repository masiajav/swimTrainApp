import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import stylesToken, { COLORS, TOKENS } from './styles';

type BtnProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  accessibilityLabel?: string;
};

export function PrimaryButton({ children, onPress, style, accessibilityLabel }: BtnProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[localStyles.primary, style]} accessibilityLabel={accessibilityLabel} accessibilityRole="button" activeOpacity={0.9}>
      <Text style={localStyles.primaryText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ children, onPress, style, accessibilityLabel }: BtnProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[localStyles.secondary, style]} accessibilityLabel={accessibilityLabel} accessibilityRole="button" activeOpacity={0.9}>
      <Text style={localStyles.secondaryText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function TertiaryButton({ children, onPress, style, accessibilityLabel }: BtnProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[localStyles.tertiary, style]} accessibilityLabel={accessibilityLabel} accessibilityRole="button" activeOpacity={0.8}>
      <Text style={localStyles.tertiaryText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function IconButton({ children, onPress, style, accessibilityLabel }: BtnProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[localStyles.iconBtn, style]} accessibilityLabel={accessibilityLabel} accessibilityRole="button" activeOpacity={0.8}>
      <View>{children}</View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.surface,
    borderRadius: TOKENS.radius.lg,
    paddingVertical: TOKENS.spacing.md + 6,
    paddingHorizontal: TOKENS.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...TOKENS.shadow.depth2,
  },
  primaryText: {
    color: COLORS.primary700,
    fontWeight: '800',
    fontSize: 16,
  },
  secondary: {
    backgroundColor: COLORS.primary,
    borderRadius: TOKENS.radius.lg,
    paddingVertical: TOKENS.spacing.md,
    paddingHorizontal: TOKENS.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...TOKENS.shadow.depth1,
  },
  secondaryText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  tertiary: {
    backgroundColor: 'transparent',
    paddingVertical: TOKENS.spacing.sm,
    paddingHorizontal: TOKENS.spacing.md,
  },
  tertiaryText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  iconBtn: {
    padding: TOKENS.spacing.sm,
    borderRadius: TOKENS.radius.sm,
  },
});

export default {};

