import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { createAgoraRtmClient, RtmConfig } from 'agora-react-native-rtm';

const APP_ID = 'c30b99d2a68640148f25a0c2f958969f';
const SIGNAL_CHANNEL = 'poc-signaling';

interface CallSignal {
  type: 'CALL_STARTED';
  channelId: string;
  callerName: string;
}

interface Props {
  username: string;
  onStartCall: (channelId: string) => void;
  onJoinCall: (channelId: string) => void;
}

export default function HomeScreen({ username, onStartCall, onJoinCall }: Props) {
  const rtmClientRef = useRef<ReturnType<typeof createAgoraRtmClient> | null>(null);
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<CallSignal | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const client = createAgoraRtmClient(
          new RtmConfig({ appId: APP_ID, userId: username })
        );
        rtmClientRef.current = client;

        client.addEventListener('message', (event) => {
          if (!mounted) return;
          try {
            const raw = event.message;
            let text: string;
            if (typeof raw === 'string') {
              text = raw;
            } else {
              // Android RTM delivers messages as Buffer/Uint8Array
              const bytes =
                raw instanceof Uint8Array
                  ? raw
                  : new Uint8Array((raw as any).data ?? raw);
              text = new TextDecoder().decode(bytes);
            }
            const signal: CallSignal = JSON.parse(text);
            if (signal.type === 'CALL_STARTED' && signal.callerName !== username) {
              setIncomingCall(signal);
            }
          } catch {}
        });

        await client.login();
        await client.subscribe(SIGNAL_CHANNEL);
        if (mounted) setConnected(true);
      } catch (e) {
        Alert.alert('Connection error', String(e));
      }
    };

    init();

    return () => {
      mounted = false;
      rtmClientRef.current?.unsubscribe(SIGNAL_CHANNEL).catch(() => {});
      rtmClientRef.current?.logout().catch(() => {});
      rtmClientRef.current?.release();
      rtmClientRef.current = null;
    };
  }, [username]);

  const startCall = async () => {
    try {
      const channelId = `call-${Date.now().toString(36)}`;
      const signal: CallSignal = {
        type: 'CALL_STARTED',
        channelId,
        callerName: username,
      };
      await rtmClientRef.current?.publish(SIGNAL_CHANNEL, JSON.stringify(signal));
      onStartCall(channelId);
    } catch (e) {
      Alert.alert('Error starting call', String(e));
    }
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    const { channelId } = incomingCall;
    setIncomingCall(null);
    onJoinCall(channelId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{username}</Text>
      <Text style={styles.status}>{connected ? '● Online' : '○ Connecting...'}</Text>

      <Button title="Start Call" onPress={startCall} disabled={!connected} />

      {incomingCall && (
        <View style={styles.incomingCard}>
          <Text style={styles.incomingText}>
            Incoming call from {incomingCall.callerName}
          </Text>
          <View style={styles.row}>
            <Button title="Accept" onPress={acceptCall} />
            <View style={styles.spacer} />
            <Button
              title="Decline"
              color="red"
              onPress={() => setIncomingCall(null)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  incomingCard: {
    marginTop: 40,
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    width: '100%',
  },
  incomingText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    width: 16,
  },
});
