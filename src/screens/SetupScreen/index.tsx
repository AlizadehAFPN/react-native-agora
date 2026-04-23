import React, {useState} from 'react';
import {
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {registerUser} from '../../services/user';
import SolidButton from '../../components/SolidButton';
import {theme, typography, elevationCard} from '../../theme';
import type {SetupScreenProps} from './types';
import {saveProfileErrorMessage} from './utils';
import {styles} from './styles';

export default function SetupScreen({userId, fcmToken, onReady}: SetupScreenProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed || !userId) {
      return;
    }
    setLoading(true);
    try {
      await registerUser(userId, trimmed, fcmToken ?? '');
      onReady(trimmed);
    } catch (e) {
      Alert.alert('Error', saveProfileErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.canvas} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.decorTop} pointerEvents="none" />
        <View style={styles.decorGlow} pointerEvents="none" />

        <View style={styles.content}>
          <Text style={styles.wordmark}>Agora</Text>
          <Text style={[typography.display, styles.headline]}>Welcome</Text>
          <Text style={[typography.body, styles.sub]}>
            Choose how others see you. You can change this anytime from the home screen.
          </Text>

          <View style={[styles.card, elevationCard(8)]}>
            <Text style={styles.fieldLabel}>Display name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Dr. Smith or Patient John"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              selectionColor={theme.colors.accent}
            />
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.colors.accent} />
                <Text style={styles.loadingHint}>Saving your profile…</Text>
              </View>
            ) : (
              <SolidButton
                title="Continue"
                onPress={handleContinue}
                disabled={!name.trim() || !userId}
                expand
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
