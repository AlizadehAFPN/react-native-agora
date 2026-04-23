import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { theme } from '../theme';

export type SolidButtonVariant = 'primary' | 'secondary' | 'danger' | 'muted' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: SolidButtonVariant;
  style?: StyleProp<ViewStyle>;
  /** When true, button grows to fill a horizontal row (use with flexDirection: 'row'). */
  expand?: boolean;
}

export default function SolidButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  expand,
}: Props): React.JSX.Element {
  const blockPress = !!disabled || !!loading;
  const dimmed = !!disabled && !loading;
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={blockPress}
      style={({ pressed }) => [
        styles.base,
        expand && styles.expand,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && !blockPress && styles.pressed,
        dimmed && styles.disabled,
        style,
      ]}
      android_ripple={{ color: v.ripple }}>
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <Text style={[styles.label, { color: v.text }]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const variantStyles: Record<
  SolidButtonVariant,
  { bg: string; border: string; text: string; ripple: string; spinner: string }
> = {
  primary: {
    bg: theme.colors.accent,
    border: 'transparent',
    text: theme.colors.onAccent,
    ripple: 'rgba(0,0,0,0.12)',
    spinner: theme.colors.onAccent,
  },
  secondary: {
    bg: theme.colors.elevated2,
    border: theme.colors.border,
    text: theme.colors.text,
    ripple: 'rgba(255,255,255,0.08)',
    spinner: theme.colors.text,
  },
  danger: {
    bg: theme.colors.dangerMuted,
    border: 'rgba(255,99,104,0.35)',
    text: theme.colors.danger,
    ripple: 'rgba(255,255,255,0.08)',
    spinner: theme.colors.danger,
  },
  muted: {
    bg: theme.colors.elevated,
    border: theme.colors.border,
    text: theme.colors.textSecondary,
    ripple: 'rgba(255,255,255,0.06)',
    spinner: theme.colors.textSecondary,
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    text: theme.colors.accent,
    ripple: 'rgba(46,230,201,0.12)',
    spinner: theme.colors.accent,
  },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expand: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: theme.font.small,
    fontWeight: '600',
  },
});
