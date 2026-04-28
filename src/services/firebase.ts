import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/** FCM token can be empty briefly on first cold start; retry before saving to Firestore. */
export async function getFCMToken(): Promise<string | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const token = await messaging().getToken();
      if (token) {
        return token;
      }
    } catch {
      // Installations / network not ready yet
    }
    await new Promise<void>(resolve => setTimeout(resolve, 350 * (attempt + 1)));
  }
  return null;
}

export async function initFirebaseMessaging(): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    return null;
  }
  return getFCMToken();
}
