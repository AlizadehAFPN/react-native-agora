import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  View,
  StatusBar,
  type AppStateStatus,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import SetupScreen from './src/screens/SetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallScreen, {
  type CallPresentation,
} from './src/screens/CallScreen';
import { initFirebaseMessaging } from './src/services/firebase';
import { attachMyPresence, subscribePeerPresence } from './src/services/presence';
import { resolveUserSession, syncFcmTokenForUser, updateFCMToken } from './src/services/user';
import type { IncomingCallData, CallSessionMeta } from './src/services/lambda';
import SolidButton from './src/components/SolidButton';
import { theme } from './src/theme';

type Screen = 'setup' | 'home';

function AppContent(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('setup');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [incomingFCMCall, setIncomingFCMCall] = useState<IncomingCallData | null>(null);
  const [activeCall, setActiveCall] = useState<CallSessionMeta | null>(null);
  const [postCallBanner, setPostCallBanner] = useState<CallSessionMeta | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [callPresentation, setCallPresentation] =
    useState<CallPresentation>('fullscreen');
  const [peerOnlineById, setPeerOnlineById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeCall) {
      setCallPresentation('fullscreen');
    }
  }, [activeCall]);
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootAttempt, setBootAttempt] = useState(0);

  // Device id + Firestore read for returning profile; first write is registerUser (name + token).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootError(null);
      setHydrating(true);
      try {
      const token = await initFirebaseMessaging();
      if (cancelled) {
        return;
      }
      setFcmToken(token);

        const { userId: id, displayName } = await resolveUserSession();
      if (cancelled) {
        return;
      }
        setUserId(id);
        if (displayName) {
          setUsername(displayName);
          setScreen('home');
        }
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : 'Could not start the app.');
        }
      } finally {
        if (!cancelled) {
          setHydrating(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootAttempt]);

  // Messaging listeners (token already requested during bootstrap)
  useEffect(() => {
    if (!userId) {
      return;
    }

    syncFcmTokenForUser(userId)
      .then(t => {
        if (t) {
          setFcmToken(t);
        }
      })
      .catch(() => {});

    const tokenRefreshUnsub = messaging().onTokenRefresh(newToken => {
      setFcmToken(newToken);
      updateFCMToken(userId, newToken);
    });

    const foregroundUnsub = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data?.type === 'INCOMING_CALL') {
        setPostCallBanner(null);
        setIncomingFCMCall({
          channelName: remoteMessage.data.channelName as string,
          callerDisplayName: remoteMessage.data.callerDisplayName as string,
          callerUserId: remoteMessage.data.callerUserId as string,
        });
      }
    });

    const openCallFromNotificationData = (data: Record<string, string>) => {
      const channelName = data.channelName as string;
      const peerDisplayName = (data.callerDisplayName as string) || 'Someone';
      setPostCallBanner(null);
      setIncomingFCMCall(null);
      setActiveCall({
        channelName,
        peerDisplayName,
        role: 'callee',
      });
      setCallPresentation('fullscreen');
    };

    messaging()
      .getInitialNotification()
      .then(initial => {
        if (initial?.data?.type === 'INCOMING_CALL') {
          openCallFromNotificationData(initial.data as Record<string, string>);
        }
      })
      .catch(() => {});

    const bgTapUnsub = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage.data?.type === 'INCOMING_CALL') {
        openCallFromNotificationData(remoteMessage.data as Record<string, string>);
      }
    });

    return () => {
      tokenRefreshUnsub();
      foregroundUnsub();
      bgTapUnsub();
    };
  }, [userId]);

  // Token can become available after permission is granted in system settings.
  useEffect(() => {
    if (!userId) {
      return;
    }
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        syncFcmTokenForUser(userId)
          .then(t => {
            if (t) {
              setFcmToken(t);
            }
          })
          .catch(() => {});
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [userId]);

  // Realtime DB presence: same userId as Firestore; stays active during calls (not tied to Home mount).
  useEffect(() => {
    if (!userId || !username) {
      return undefined;
    }
    return attachMyPresence(userId);
  }, [userId, username]);

  // Peer presence listener in App so it stays active when HomeScreen unmounts (e.g. fullscreen call).
  useEffect(() => {
    if (!userId || !username) {
      setPeerOnlineById({});
      return undefined;
    }
    return subscribePeerPresence(userId, setPeerOnlineById);
  }, [userId, username]);

  const handleSetupReady = (name: string) => {
    setUsername(name);
    setScreen('home');
    syncFcmTokenForUser(userId)
      .then(t => {
        if (t) {
          setFcmToken(t);
        }
      })
      .catch(() => {});
  };

  const handleUsernameChanged = (name: string) => {
    setUsername(name);
  };

  const handleProfileCleared = () => {
    setUsername('');
    setPostCallBanner(null);
    setActiveCall(null);
    setScreen('setup');
  };

  const handleCall = useCallback((meta: CallSessionMeta) => {
    setIncomingFCMCall(null);
    setPostCallBanner(null);
    setActiveCall(meta);
    setCallPresentation('fullscreen');
  }, []);

  const handleLeaveCall = useCallback((opts?: { skipRejoinBanner?: boolean }) => {
    setActiveCall(prev => {
      if (prev && !opts?.skipRejoinBanner) {
        setPostCallBanner(prev);
      }
      return null;
    });
    setScreen('home');
  }, []);

  const handleDismissPostCall = useCallback(() => {
    setPostCallBanner(null);
  }, []);

  const handleRejoinFromBanner = useCallback(() => {
    setPostCallBanner(current => {
      if (!current) {
        return current;
      }
      setActiveCall(current);
      setCallPresentation('fullscreen');
      return null;
    });
  }, []);

  if (hydrating) {
    return (
      <SafeAreaView style={styles.boot} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.canvas} />
        <View style={styles.bootInner}>
          <Text style={styles.bootWordmark}>Agora</Text>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.bootHint}>Starting up…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bootError) {
    return (
      <SafeAreaView style={styles.boot} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.canvas} />
        <View style={styles.bootMessage}>
          <Text style={styles.bootErrorTitle}>Could not start</Text>
          <Text style={styles.bootErrorText}>{bootError}</Text>
          <SolidButton title="Try again" onPress={() => setBootAttempt(a => a + 1)} />
        </View>
      </SafeAreaView>
    );
  }

  const homeScreen = (
    <HomeScreen
      userId={userId}
      username={username}
      peerOnlineById={peerOnlineById}
      incomingFCMCall={incomingFCMCall}
      postCallBanner={postCallBanner}
      onCall={handleCall}
      onRejoinFromBanner={handleRejoinFromBanner}
      onDismissPostCall={handleDismissPostCall}
      onDeclineFCMCall={() => setIncomingFCMCall(null)}
      onUsernameChanged={handleUsernameChanged}
      onProfileCleared={handleProfileCleared}
    />
  );

  if (activeCall) {
    return (
      <CallScreen
        channelId={activeCall.channelName}
        peerDisplayName={activeCall.peerDisplayName}
        presentation={callPresentation}
        onPresentationChange={setCallPresentation}
        onEnd={handleLeaveCall}>
        {callPresentation === 'minimized' ? homeScreen : null}
      </CallScreen>
    );
  }

  if (screen === 'setup') {
    return (
      <SetupScreen
        userId={userId}
        fcmToken={fcmToken}
        onReady={handleSetupReady}
      />
    );
  }

  return homeScreen;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.canvas,
  },
  bootInner: {
    alignItems: 'center',
    gap: 16,
  },
  bootWordmark: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  bootHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  bootMessage: {
    maxWidth: 340,
    paddingHorizontal: 24,
    gap: 20,
    alignItems: 'stretch',
  },
  bootErrorTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  bootErrorText: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
