import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  IRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
const APP_ID = 'c30b99d2a68640148f25a0c2f958969f';

interface Props {
  channelId: string;
  onEnd: () => void;
}

export default function CallScreen({ channelId, onEnd }: Props) {
  const engineRef = useRef<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const cleanup = () => {
      if (engineRef.current) {
        engineRef.current.leaveChannel();
        engineRef.current.release();
        engineRef.current = null;
      }
    };

    const init = async () => {
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        const denied = Object.values(grants).some(
          (r) => r !== PermissionsAndroid.RESULTS.GRANTED,
        );
        if (denied) {
          Alert.alert('Permissions required', 'Camera and microphone are needed for calls.');
          onEnd();
          return;
        }
      }

      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      engine.initialize({ appId: APP_ID });
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.enableVideo();

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (active) setJoined(true);
        },
        onUserJoined: (_connection, uid) => {
          if (active) setRemoteUid(uid);
        },
        onUserOffline: () => {
          if (active) setRemoteUid(null);
        },
        onError: (err) => console.warn('RTC error:', err),
      });

      engine.startPreview();
      engine.joinChannel('', channelId, 0, {
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    };

    init().catch((e) => Alert.alert('Error', String(e)));

    return cleanup;
  }, [channelId, onEnd]);

  const endCall = () => {
    if (engineRef.current) {
      engineRef.current.leaveChannel();
      engineRef.current.release();
      engineRef.current = null;
    }
    onEnd();
  };

  return (
    <View style={styles.container}>
      {/* Remote video — full screen */}
      <View style={styles.remoteContainer}>
        {remoteUid !== null ? (
          <RtcSurfaceView style={styles.fill} canvas={{ uid: remoteUid }} />
        ) : (
          <View style={styles.waiting}>
            <Text style={styles.waitingText}>Waiting for other participant...</Text>
          </View>
        )}
      </View>

      {/* Local video — picture-in-picture */}
      {joined && (
        <RtcSurfaceView style={styles.localVideo} canvas={{ uid: 0 }} />
      )}

      <View style={styles.controls}>
        <Button title="End Call" color="red" onPress={endCall} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
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
    color: '#aaa',
    fontSize: 16,
  },
  localVideo: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
  },
});
