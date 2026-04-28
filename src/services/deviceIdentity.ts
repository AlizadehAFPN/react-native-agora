import DeviceInfo from 'react-native-device-info';

/**
 * Firestore user document id derived from the OS device identifier.
 * Android: typically stable across uninstall/reinstall for the same signed app + user profile.
 * iOS: identifierForVendor; changes if the user removes all apps from this vendor and reinstalls.
 */
export async function getDeviceBackedUserId(): Promise<string> {
  const raw = await DeviceInfo.getUniqueId();
  const id = raw.replace(/\//g, '').trim();
  if (!id) {
    throw new Error('Device identifier was empty; cannot anchor this install in Firestore.');
  }
  return id;
}
