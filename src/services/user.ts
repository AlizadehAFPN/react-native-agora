import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import { Platform } from 'react-native';
import { getFCMToken } from './firebase';
import { getDeviceBackedUserId } from './deviceIdentity';
import { PRESENCE_ROOT } from './presence';

/** Profile display name from Firestore only (no local cache). */
export async function restoreUserProfile(userId: string): Promise<string | null> {
  try {
    const snap = await firestore().collection('users').doc(userId).get();
    const fromServer = snap.data()?.displayName;
    if (typeof fromServer === 'string' && fromServer.trim()) {
      return fromServer.trim();
    }
  } catch {
    // offline / permission
  }
  return null;
}

/**
 * Resolve the current session from the device id and Firestore (read-only).
 * No user document is written here; `registerUser` creates/updates the doc when the name is set.
 */
export async function resolveUserSession(): Promise<{
  userId: string;
  displayName: string | null;
}> {
  const userId = await getDeviceBackedUserId();
  const displayName = await restoreUserProfile(userId);
  return { userId, displayName };
}

export async function registerUser(
  userId: string,
  displayName: string,
  fcmToken: string,
): Promise<void> {
  let token = fcmToken?.trim() ?? '';
  if (!token) {
    token = (await getFCMToken()) ?? '';
  }
  await firestore()
    .collection('users')
    .doc(userId)
    .set(
      {
        displayName: displayName.trim(),
        platform: Platform.OS,
        createdAt: firestore.FieldValue.serverTimestamp(),
        fcmToken: token,
      },
      { merge: true },
    );
}

/** Updates only displayName; does not read or write fcmToken. */
export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error('Name cannot be empty');
  }
  await firestore().collection('users').doc(userId).update({ displayName: trimmed });
}

/** Removes displayName from the profile doc; leaves fcmToken and other fields unchanged. */
export async function clearDisplayName(userId: string): Promise<void> {
  try {
    await firestore().collection('users').doc(userId).update({
      displayName: firestore.FieldValue.delete(),
    });
  } catch {
    // doc may not exist yet
  }
}

/**
 * Permanently deletes the user from Firestore and Realtime Database.
 * After this returns, call onProfileCleared() to reset app state.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  await Promise.all([
    firestore().collection('users').doc(userId).delete(),
    database().ref(`${PRESENCE_ROOT}/${userId}`).remove().catch(() => {}),
  ]);
}

/**
 * Deletes every user document from Firestore and wipes the entire presence
 * tree from Realtime Database. Caller must reset app state afterwards.
 */
export async function deleteAllUsers(): Promise<void> {
  const [snap] = await Promise.all([
    firestore().collection('users').get(),
    database().ref(PRESENCE_ROOT).remove().catch(() => {}),
  ]);
  const batch = firestore().batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

export async function updateFCMToken(userId: string, fcmToken: string): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .update({ fcmToken })
    .catch(() => {});
}

/** Writes the current device FCM token to this user's Firestore doc (no-op if unavailable). */
export async function syncFcmTokenForUser(userId: string): Promise<string | null> {
  const t = await getFCMToken();
  if (t) {
    await updateFCMToken(userId, t);
  }
  return t;
}

export interface UserRecord {
  userId: string;
  displayName: string;
  platform: string;
  fcmToken: string;
}

export function subscribeToUsers(
  localUserId: string,
  onChange: (users: UserRecord[]) => void,
): () => void {
  return firestore()
    .collection('users')
    .onSnapshot(snapshot => {
      const users = snapshot.docs
        .filter(doc => doc.id !== localUserId)
        .map(doc => ({
          ...(doc.data() as Omit<UserRecord, 'userId'>),
          userId: doc.id,
        }))
        .filter(
          (u): u is UserRecord =>
            typeof u.displayName === 'string' && u.displayName.trim().length > 0,
        );
      onChange(users);
    });
}
