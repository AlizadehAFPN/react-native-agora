/**
 * @format
 */

import '@react-native-firebase/app';
import '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Android: required so background data messages complete; foreground/tap flows stay in App.tsx.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (__DEV__) {
    console.log('[FCM background]', remoteMessage.data?.type ?? remoteMessage.messageId);
  }
});

AppRegistry.registerComponent(appName, () => App);
