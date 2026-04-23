import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {createAgoraRtmClient, RtmConfig} from 'agora-react-native-rtm';
import {AGORA_APP_ID as APP_ID} from '../../config';
import {subscribeToUsers, deleteUserAccount, deleteAllUsers} from '../../services/user';
import {initiateCall} from '../../services/lambda';
import {theme, elevationCard} from '../../theme';
import SolidButton from '../../components/SolidButton';
import EditNameModal from '../../components/EditNameModal';
import UserCard, {UserCardSeparator, type PeopleRow} from '../../components/UserCard';
import {styles} from './styles';
import type {HomeScreenProps, RTMCallSignal, UserRecord} from './types';
import {initialsFromName, rtmPayloadToUint8Array} from './utils';

const SIGNAL_CHANNEL = 'call-signaling';

export default function HomeScreen({
  userId,
  username,
  peerOnlineById,
  incomingFCMCall,
  postCallBanner,
  onCall,
  onRejoinFromBanner,
  onDismissPostCall,
  onDeclineFCMCall,
  onUsernameChanged,
  onProfileCleared,
}: HomeScreenProps) {
  const rtmClientRef = useRef<ReturnType<typeof createAgoraRtmClient> | null>(null);
  const [rtmConnected, setRtmConnected] = useState(false);
  const [rtmFailed, setRtmFailed] = useState(false);
  const [rtmIncomingCall, setRtmIncomingCall] = useState<RTMCallSignal | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [callingUserId, setCallingUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  /** Merge Firestore users + RTDB presence so FlatList updates when peers go online/offline. */
  const peopleRows = useMemo<PeopleRow[]>(
    () => users.map(u => ({...u, isAvailable: peerOnlineById[u.userId] === true})),
    [users, peerOnlineById],
  );

  useEffect(() => {
    return subscribeToUsers(userId, setUsers);
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const client = createAgoraRtmClient(
          new RtmConfig({appId: APP_ID, userId}),
        );
        rtmClientRef.current = client;

        client.addEventListener('message', event => {
          if (!mounted) {
            return;
          }
          try {
            const raw = event.message;
            const text =
              typeof raw === 'string'
                ? raw
                : new TextDecoder().decode(rtmPayloadToUint8Array(raw));
            const signal: RTMCallSignal = JSON.parse(text);
            if (signal.type === 'CALL_STARTED' && signal.callerName !== username) {
              setRtmIncomingCall(signal);
            }
          } catch {}
        });

        await client.login();
        await client.subscribe(SIGNAL_CHANNEL);
        if (mounted) {
          setRtmConnected(true);
        }
      } catch {
        if (mounted) {
          setRtmFailed(true);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      setRtmConnected(false);
      setRtmFailed(false);
      rtmClientRef.current?.unsubscribe(SIGNAL_CHANNEL).catch(() => {});
      rtmClientRef.current?.logout().catch(() => {});
      rtmClientRef.current?.release();
      rtmClientRef.current = null;
    };
  }, [userId]);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently remove you from Firestore, presence, and this device session. You can re-register by entering a name again.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserAccount(userId);
              onProfileCleared();
            } catch (e) {
              Alert.alert('Could not delete account', String(e));
            }
          },
        },
      ],
    );
  };

  const confirmDeleteAllUsers = () => {
    Alert.alert(
      'Delete all users?',
      'This will permanently remove every user from Firestore and Realtime Database. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllUsers();
              onProfileCleared();
            } catch (e) {
              Alert.alert('Could not delete all users', String(e));
            }
          },
        },
      ],
    );
  };

  const callUser = async (callee: UserRecord) => {
    if (callingUserId) {
      return;
    }
    setCallingUserId(callee.userId);
    try {
      const channelName = `call-${Date.now().toString(36)}`;
      await initiateCall({
        callerUserId: userId,
        calleeUserId: callee.userId,
        channelName,
        callerDisplayName: username,
      });
      onCall({channelName, peerDisplayName: callee.displayName, role: 'caller'});
    } catch (e) {
      Alert.alert('Call failed', String(e));
    } finally {
      setCallingUserId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.canvas} />
      <View style={styles.body}>

        {/* Profile card */}
        <View style={[styles.profileCard, elevationCard(6)]}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsFromName(username)}</Text>
            </View>
            <View style={styles.profileTextCol}>
              <View style={styles.nameToolbarRow}>
                <Text style={[styles.name, styles.nameFlex]} numberOfLines={1}>
                  {username}
                </Text>
                <View style={styles.headerTools}>
                  {!rtmFailed && (
                    <View
                      accessible
                      accessibilityRole="image"
                      accessibilityLabel={rtmConnected ? 'Signaling ready' : 'Signaling connecting'}
                      style={styles.iconHit}>
                      {rtmConnected ? (
                        <Text style={styles.signalDot}>●</Text>
                      ) : (
                        <ActivityIndicator size="small" color={theme.colors.warning} />
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Edit display name"
                    onPress={() => setEditOpen(true)}
                    hitSlop={8}
                    style={styles.iconHit}>
                    <Text style={styles.editIcon}>{'✏'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Remove your profile from the list"
                    onPress={confirmDeleteAccount}
                    hitSlop={8}
                    style={styles.iconHit}>
                    <Text style={styles.removeIcon}>{'✕'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <EditNameModal
          visible={editOpen}
          initialName={username}
          userId={userId}
          onSaved={name => {
            onUsernameChanged(name);
            setEditOpen(false);
          }}
          onCancel={() => setEditOpen(false)}
        />

        {/* People list */}
        <Text style={styles.sectionLabel}>People</Text>

        {peopleRows.length === 0 ? (
          <View style={styles.listArea}>
            <View style={[styles.emptyCard, elevationCard(4)]}>
              <Text style={styles.emptyTitle}>No one else online</Text>
              <Text style={styles.emptySub}>
                When another device registers, they will appear here so you can start a call.
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={peopleRows}
            extraData={peerOnlineById}
            keyExtractor={item => item.userId}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={UserCardSeparator}
            renderItem={({item}) => (
              <UserCard item={item} callingUserId={callingUserId} onCall={callUser} />
            )}
          />
        )}

        {/* Incoming call via FCM */}
        {incomingFCMCall && (
          <View style={[styles.incomingCard, elevationCard(8)]}>
            <Text style={styles.incomingLabel}>Incoming call</Text>
            <Text style={styles.incomingText}>
              {incomingFCMCall.callerDisplayName} is calling…
            </Text>
            <View style={styles.row}>
              <SolidButton
                title="Accept"
                onPress={() =>
                  onCall({
                    channelName: incomingFCMCall.channelName,
                    peerDisplayName: incomingFCMCall.callerDisplayName,
                    role: 'callee',
                  })
                }
                expand
              />
              <View style={styles.spacer} />
              <SolidButton title="Decline" variant="danger" onPress={onDeclineFCMCall} expand />
            </View>
          </View>
        )}

        {/* Incoming call via RTM (fallback when FCM is not available) */}
        {rtmIncomingCall && !incomingFCMCall && (
          <View style={[styles.incomingCard, elevationCard(8)]}>
            <Text style={styles.incomingLabel}>Incoming call</Text>
            <Text style={styles.incomingText}>From {rtmIncomingCall.callerName}</Text>
            <View style={styles.row}>
              <SolidButton
                title="Accept"
                onPress={() => {
                  const {channelId, callerName} = rtmIncomingCall;
                  setRtmIncomingCall(null);
                  onCall({channelName: channelId, peerDisplayName: callerName, role: 'callee'});
                }}
                expand
              />
              <View style={styles.spacer} />
              <SolidButton
                title="Decline"
                variant="danger"
                onPress={() => setRtmIncomingCall(null)}
                expand
              />
            </View>
          </View>
        )}

        {/* Post-call rejoin banner */}
        {postCallBanner && !incomingFCMCall && !rtmIncomingCall && (
          <View style={[styles.postCallCard, elevationCard(8)]}>
            <Text style={styles.postCallLabel}>Recent session</Text>
            <Text style={styles.postCallTitle}>
              Call with {postCallBanner.peerDisplayName}
            </Text>
            <Text style={styles.postCallHint}>
              Same Agora channel until you dismiss. Rejoin if the other person is still there.
            </Text>
            <View style={styles.row}>
              <SolidButton title="Rejoin" onPress={onRejoinFromBanner} expand />
              <View style={styles.spacer} />
              <SolidButton title="Dismiss" variant="muted" onPress={onDismissPostCall} expand />
            </View>
          </View>
        )}

        {/* Delete all users (admin) */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Delete all users"
          onPress={confirmDeleteAllUsers}
          style={styles.deleteAllBtn}>
          <Text style={styles.deleteAllBtnText}>Delete all users</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
