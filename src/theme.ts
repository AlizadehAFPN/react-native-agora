import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens — visual layer only (no runtime logic).
 */
export const theme = {
  colors: {
    canvas: '#030508',
    surface: '#0B1016',
    elevated: '#111923',
    elevated2: '#161F2C',
    border: 'rgba(255,255,255,0.08)',
    borderFocus: 'rgba(46, 230, 201, 0.45)',
    text: '#F2F5F8',
    textSecondary: '#9AA7B6',
    textMuted: '#5E6C7C',
    accent: '#2EE6C9',
    accentMuted: 'rgba(46, 230, 201, 0.16)',
    onAccent: '#03120F',
    danger: '#FF6368',
    dangerMuted: 'rgba(255, 99, 104, 0.16)',
    warning: '#F5C84C',
    warningMuted: 'rgba(245, 200, 76, 0.14)',
    success: '#3DDC97',
    successMuted: 'rgba(61, 220, 151, 0.14)',
    overlay: 'rgba(2, 4, 8, 0.78)',
    callBar: 'rgba(6, 10, 16, 0.82)',
    pipStroke: 'rgba(255,255,255,0.22)',
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 36 },
  radii: { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 },
  font: {
    display: 28,
    title: 22,
    headline: 18,
    body: 16,
    small: 14,
    caption: 12,
    micro: 11,
  },
} as const;

export function elevationCard(level: number = 4): ViewStyle {
  const h = Math.min(Math.max(level, 2), 16);
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: h },
      shadowOpacity: 0.28,
      shadowRadius: h * 2.5,
    },
    android: { elevation: Math.min(h, 12) },
    default: {},
  }) ?? {};
}

export const typography = {
  display: {
    fontSize: theme.font.display,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  title: {
    fontSize: theme.font.title,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: theme.font.headline,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text,
  },
  body: {
    fontSize: theme.font.body,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  caption: {
    fontSize: theme.font.caption,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.textMuted,
  },
};
