import {StyleSheet} from 'react-native';
import {theme, typography} from '../../theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  flex: {
    flex: 1,
  },

  // Decorative background blobs
  decorTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.accentMuted,
    opacity: 0.5,
  },
  decorGlow: {
    position: 'absolute',
    top: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },

  // Content layout
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.space.xxl,
    paddingBottom: theme.space.xl,
  },
  wordmark: {
    fontSize: theme.font.micro,
    fontWeight: '700',
    letterSpacing: 4,
    color: theme.colors.textMuted,
    marginBottom: theme.space.md,
  },
  headline: {
    marginBottom: theme.space.sm,
  },
  sub: {
    marginBottom: theme.space.xxl,
    maxWidth: 400,
  },

  // Form card
  card: {
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radii.xl,
    padding: theme.space.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  fieldLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.space.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    fontSize: theme.font.body,
    color: theme.colors.text,
    marginBottom: theme.space.lg,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.md,
    minHeight: 50,
  },
  loadingHint: {
    fontSize: theme.font.small,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
