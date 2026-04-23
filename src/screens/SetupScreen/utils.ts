export function saveProfileErrorMessage(err: unknown): string {
  const o = err as {code?: string; message?: string};
  const code = typeof o?.code === 'string' ? o.code : '';
  const message = typeof o?.message === 'string' ? o.message : '';

  if (code === 'firestore/permission-denied') {
    return 'Firestore blocked saving your profile (permission denied). In the Firebase console, open Firestore Database → Rules and allow writes to the users collection for this app (default rules deny all).';
  }
  if (code === 'firestore/unavailable' || code === 'firestore/deadline-exceeded') {
    return 'Could not reach Firestore. Check your internet connection and try again.';
  }
  if (__DEV__ && message) {
    return `Could not save your profile.\n\n${code ? `${code}: ` : ''}${message}`;
  }
  return 'Could not save your profile. Check your connection.';
}
