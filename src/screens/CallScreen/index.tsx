import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  Alert,
  Pressable,
  StatusBar,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  IRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AGORA_APP_ID as APP_ID} from '../../config';
import {theme} from '../../theme';
import CallControls from './CallControls';
import {styles} from './styles';
import type {CallScreenProps} from './types';

export type {CallPresentation} from './types';

export default function CallScreen({
  channelId,
  peerDisplayName,
  presentation,
  onPresentationChange,
  onEnd,
  children,
}: CallScreenProps) {
  const insets = useSafeAreaInsets();
  const engineRef = useRef<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [everHadRemote, setEverHadRemote] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  useEffect(() => {
    setEverHadRemote(false);
    setMicMuted(false);
  }, [channelId]);

  const teardownEngine = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.leaveChannel();
      engineRef.current.release();
      engineRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        const denied = Object.values(grants).some(
          r => r !== PermissionsAndroid.RESULTS.GRANTED,
        );
        if (denied) {
          Alert.alert('Permissions required', 'Camera and microphone are needed for calls.');
          onEnd({skipRejoinBanner: true});
          return;
        }
      }

      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      engine.initialize({appId: APP_ID});
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.enableVideo();

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (active) {
            setJoined(true);
          }
        },
        onUserJoined: (_connection, uid) => {
          if (active) {
            setEverHadRemote(true);
            setRemoteUid(uid);
          }
        },
        onUserOffline: () => {
          if (active) {
            setRemoteUid(null);
          }
        },
        onError: err => console.warn('RTC error:', err),
      });

      engine.startPreview();
      engine.joinChannel('', channelId, 0, {
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    };

    init().catch(e => Alert.alert('Error', String(e)));

    return () => {
      active = false;
      teardownEngine();
    };
  }, [channelId, onEnd, teardownEngine]);

  const endCall = useCallback(() => {
    teardownEngine();
    onEnd();
  }, [onEnd, teardownEngine]);

  const toggleMic = useCallback(() => {
    if (!joined || !engineRef.current) {
      return;
    }
    setMicMuted(prev => {
      const next = !prev;
      engineRef.current!.muteLocalAudioStream(next);
      return next;
    });
  }, [joined]);

  const statusLine = useMemo(() => {
    if (remoteUid !== null) {
      return 'In call';
    }
    if (!joined) {
      return `Connecting with ${peerDisplayName}…`;
    }
    if (everHadRemote) {
      return `${peerDisplayName} left — same room if they rejoin`;
    }
    return `Waiting for ${peerDisplayName}…`;
  }, [remoteUid, joined, everHadRemote, peerDisplayName]);

  const minimize = useCallback(() => onPresentationChange('minimized'), [onPresentationChange]);
  const maximize = useCallback(() => onPresentationChange('fullscreen'), [onPresentationChange]);

  // ── Minimized (PiP) ──────────────────────────────────────────────────────
  if (presentation === 'minimized') {
    const pipBottom = Math.max(insets.bottom, 10) + 8;
    const pipRight = Math.max(insets.right, 12);

    return (
      <View style={styles.shell}>
        <View style={styles.homeSlot}>{children}</View>
        <View
          style={[styles.pipAnchor, {bottom: pipBottom, right: pipRight}]}
          pointerEvents="box-none">
          <Pressable
            onPress={maximize}
            style={styles.pipTile}
            android_ripple={{color: 'rgba(255,255,255,0.08)'}}>
            {remoteUid !== null ? (
              <RtcSurfaceView style={styles.pipRtc} canvas={{uid: remoteUid}} />
            ) : (
              <View style={styles.pipPlaceholder}>
                <Text style={styles.pipPlaceholderHint} numberOfLines={4}>
                  {statusLine}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Fullscreen ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.callHeader, {paddingTop: insets.top + 8}]}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={minimize}
            style={styles.headerIconBtn}
            hitSlop={12}
            android_ripple={{color: 'rgba(255,255,255,0.15)'}}>
            <Text style={styles.headerIconBtnLabel}>Minimize</Text>
          </Pressable>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.peerTitle} numberOfLines={1}>
              {peerDisplayName}
            </Text>
            <Text style={styles.peerSubtitle}>{statusLine}</Text>
          </View>
          <View style={styles.headerIconBtnSpacer} />
        </View>
      </View>

      <View style={styles.remoteContainer}>
        {remoteUid !== null ? (
          <RtcSurfaceView style={styles.fill} canvas={{uid: remoteUid}} />
        ) : (
          <View style={styles.waiting}>
            <Text style={styles.waitingText}>{statusLine}</Text>
          </View>
        )}
      </View>

      {joined && (
        <View style={[styles.localVideoWrap, {top: insets.top + 72}]} collapsable={false}>
          <RtcSurfaceView
            style={styles.localVideoFill}
            zOrderMediaOverlay={Platform.OS === 'android'}
            canvas={{uid: 0}}
          />
        </View>
      )}

      <CallControls
        joined={joined}
        micMuted={micMuted}
        bottomInset={insets.bottom}
        onToggleMic={toggleMic}
        onEndCall={endCall}
      />
    </View>
  );
}
