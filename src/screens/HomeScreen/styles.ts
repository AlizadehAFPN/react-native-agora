import {StyleSheet} from 'react-native';
import {theme, typography} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.space.lg,
    backgroundColor: theme.colors.canvas,
  },
  body: {
    flex: 1,
  },

  // Profile card
  profileCard: {
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radii.xl,
    padding: theme.space.lg,
    marginBottom: theme.space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderFocus,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.space.md,
  },
  avatarText: {
    fontSize: theme.font.small,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 0.5,
  },
  profileTextCol: {
    flex: 1,
    minWidth: 0,
  },
  nameToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    gap: theme.space.sm,
  },
  name: {
    fontSize: theme.font.headline,
    fontWeight: '700',
    color: theme.colors.text,
  },
  nameFlex: {
    flex: 1,
    minWidth: 0,
  },
  headerTools: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconHit: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalDot: {
    fontSize: 15,
    color: theme.colors.success,
    lineHeight: 18,
  },

  editIcon: {
    fontSize: 20,
    color: theme.colors.accent,
  },
  removeIcon: {
    fontSize: 18,
    color: theme.colors.danger,
  },

  // People list
  sectionLabel: {
    ...typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.space.sm,
    marginLeft: theme.space.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  listArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.space.lg,
  },
  emptyCard: {
    marginTop: theme.space.lg,
    padding: theme.space.xl,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: theme.font.headline,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.space.sm,
    textAlign: 'center',
  },
  emptySub: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 320,
  },

  // Incoming call card
  incomingCard: {
    marginTop: theme.space.lg,
    padding: theme.space.xl,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderFocus,
    alignItems: 'stretch',
  },
  incomingLabel: {
    fontSize: theme.font.caption,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.space.xs,
    textAlign: 'center',
  },
  incomingText: {
    fontSize: theme.font.headline,
    fontWeight: '600',
    marginBottom: theme.space.lg,
    textAlign: 'center',
    color: theme.colors.text,
  },

  // Post-call banner
  postCallCard: {
    marginTop: theme.space.lg,
    padding: theme.space.xl,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245, 200, 76, 0.35)',
    alignItems: 'stretch',
  },
  postCallLabel: {
    fontSize: theme.font.caption,
    fontWeight: '700',
    color: theme.colors.warning,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.space.xs,
    textAlign: 'center',
  },
  postCallTitle: {
    fontSize: theme.font.body,
    fontWeight: '600',
    marginBottom: theme.space.sm,
    textAlign: 'center',
    color: theme.colors.text,
  },
  postCallHint: {
    fontSize: theme.font.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.space.lg,
    lineHeight: 20,
  },

  // Shared
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  spacer: {
    width: theme.space.md,
  },

  // Admin
  deleteAllBtn: {
    alignSelf: 'center',
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    marginTop: theme.space.md,
    marginBottom: theme.space.xs,
  },
  deleteAllBtnText: {
    fontSize: theme.font.small,
    color: theme.colors.danger,
    fontWeight: '500',
  },
});
