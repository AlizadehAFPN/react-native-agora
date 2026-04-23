import {Platform, StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  // Minimized (PiP) layout
  shell: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  homeSlot: {
    flex: 1,
  },
  pipAnchor: {
    position: 'absolute',
  },
  pipTile: {
    width: 112,
    height: 168,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.pipStroke,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },
  pipRtc: {
    width: '100%',
    height: '100%',
  },
  pipPlaceholder: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 12,
    backgroundColor: theme.colors.surface,
  },
  pipPlaceholderHint: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Fullscreen layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  callHeader: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: theme.colors.callBar,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  headerIconBtnSpacer: {
    width: 76,
  },
  headerIconBtnLabel: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  peerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  peerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  // Remote video
  remoteContainer: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  waiting: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 32,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Local video PiP (stacks above remote — iOS zIndex, Android elevation + zOrderMediaOverlay)
  localVideoWrap: {
    position: 'absolute',
    right: 16,
    width: 104,
    height: 148,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.pipStroke,
    zIndex: 20,
    elevation: Platform.OS === 'android' ? 12 : 0,
    backgroundColor: theme.colors.surface,
  },
  localVideoFill: {
    width: '100%',
    height: '100%',
  },
});
