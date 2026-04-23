import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {theme} from '../../theme';

interface CallControlsProps {
  joined: boolean;
  micMuted: boolean;
  bottomInset: number;
  onToggleMic: () => void;
  onEndCall: () => void;
}

export default function CallControls({
  joined,
  micMuted,
  bottomInset,
  onToggleMic,
  onEndCall,
}: CallControlsProps) {
  return (
    <View style={[styles.bar, {bottom: bottomInset + 14}]}>
      <View style={styles.row}>
        <Pressable
          style={[
            styles.micBtn,
            micMuted && styles.micBtnMuted,
            !joined && styles.micBtnDisabled,
          ]}
          onPress={onToggleMic}
          disabled={!joined}
          android_ripple={{color: 'rgba(255,255,255,0.15)'}}>
          <Text style={styles.micBtnLabel}>{micMuted ? 'Unmute' : 'Mute'}</Text>
        </Pressable>
        <Pressable
          style={styles.endCallBtn}
          onPress={onEndCall}
          android_ripple={{color: 'rgba(255,255,255,0.2)'}}>
          <Text style={styles.endCallBtnLabel}>End call</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.callBar,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  micBtn: {
    backgroundColor: theme.colors.elevated2,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: theme.radii.pill,
    minWidth: 118,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  micBtnMuted: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: 'rgba(255,99,104,0.35)',
  },
  micBtnDisabled: {
    opacity: 0.45,
  },
  micBtnLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  endCallBtn: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: theme.radii.pill,
    minWidth: 200,
    alignItems: 'center',
  },
  endCallBtnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
