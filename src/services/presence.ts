import '@react-native-firebase/database';
import database from '@react-native-firebase/database';
import {AppState, type AppStateStatus} from 'react-native';

/** RTDB path; keep in sync with `database.rules.json`. */
export const PRESENCE_ROOT = 'presence';

const onlinePayload = () => ({state: 'online' as const});
const offlinePayload = () => ({state: 'offline' as const});

function isPresenceNodeOnline(node: unknown): boolean {
  if (node == null || typeof node !== 'object') {
    return false;
  }
  const s = (node as {state?: unknown}).state;
  if (typeof s === 'string') {
    return s.trim().toLowerCase() === 'online';
  }
  if (typeof s === 'boolean') {
    return s;
  }
  return false;
}

function rtdb() {
  return database();
}

function myPresenceRef(userId: string) {
  return rtdb().ref(`${PRESENCE_ROOT}/${userId}`);
}

function armOnline(userId: string): Promise<void> {
  const ref = myPresenceRef(userId);
  return ref
    .onDisconnect()
    .set(offlinePayload())
    .then(() => ref.set(onlinePayload()));
}

/**
 * Publishes availability for `userId` while the app is registered (has a profile).
 * - Uses Realtime Database `onDisconnect` so the server flips to offline when the
 *   socket drops (app killed, network lost, OS suspended long enough).
 * - Sets offline on `inactive` / `background` so peers update quickly when the
 *   user leaves the app, not only after transport teardown.
 */
export function attachMyPresence(userId: string): () => void {
  const ref = myPresenceRef(userId);
  const connectedRef = rtdb().ref('.info/connected');

  const applyTransportConnected = (connected: boolean) => {
    if (!connected) {
      return;
    }
    armOnline(userId).catch(() => {});
  };

  const onConnectedSnap = connectedRef.on('value', snap => {
    applyTransportConnected(snap.val() === true);
  });

  const onAppState = (next: AppStateStatus) => {
    if (next === 'active') {
      armOnline(userId).catch(() => {});
      return;
    }
    ref.set(offlinePayload()).catch(() => {});
  };

  const appSub = AppState.addEventListener('change', onAppState);

  if (AppState.currentState === 'active') {
    armOnline(userId).catch(() => {});
  } else {
    ref.set(offlinePayload()).catch(() => {});
  }

  return () => {
    connectedRef.off('value', onConnectedSnap);
    appSub.remove();
    ref
      .onDisconnect()
      .cancel()
      .catch(() => {})
      .then(() => ref.set(offlinePayload()))
      .catch(() => {});
  };
}

/** Live map of peer userId → whether they are marked online in RTDB. */
export function subscribePeerPresence(
  localUserId: string,
  onChange: (onlineByUserId: Record<string, boolean>) => void,
): () => void {
  const root = rtdb().ref(PRESENCE_ROOT);
  const self = localUserId.trim();

  const onRootValue = (snap: {val: () => unknown}) => {
    const raw = snap.val() as Record<string, unknown> | null | undefined;
    const out: Record<string, boolean> = {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const [idRaw, node] of Object.entries(raw)) {
        const id = idRaw.trim();
        if (!id || id === self) {
          continue;
        }
        out[id] = isPresenceNodeOnline(node);
      }
    }
    onChange(out);
  };

  const callbackForOff = root.on('value', onRootValue);
  return () => {
    root.off('value', callbackForOff);
  };
}

