import React, {useState, useEffect} from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import SolidButton from './SolidButton';
import {theme, typography, elevationCard} from '../theme';
import {updateDisplayName} from '../services/user';

interface Props {
  visible: boolean;
  initialName: string;
  userId: string;
  onSaved: (name: string) => void;
  onCancel: () => void;
}

export default function EditNameModal({
  visible,
  initialName,
  userId,
  onSaved,
  onCancel,
}: Props) {
  const [draft, setDraft] = useState(initialName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(initialName);
    }
  }, [visible, initialName]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Enter a name or remove your profile instead.');
      return;
    }
    setSaving(true);
    try {
      await updateDisplayName(userId, trimmed);
      onSaved(trimmed);
    } catch (e) {
      Alert.alert('Could not update name', String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.card, elevationCard(12)]}>
          <Text style={styles.title}>Edit your name</Text>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Your display name"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!saving}
            selectionColor={theme.colors.accent}
          />
          <View style={styles.buttons}>
            <SolidButton
              title="Cancel"
              variant="secondary"
              onPress={onCancel}
              disabled={saving}
              expand
            />
            <View style={styles.gap} />
            <SolidButton
              title="Save"
              onPress={handleSave}
              disabled={saving}
              loading={saving}
              expand
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.overlay,
    padding: theme.space.xl,
  },
  card: {
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radii.xl,
    padding: theme.space.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  title: {
    ...typography.headline,
    marginBottom: theme.space.md,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    fontSize: theme.font.body,
    color: theme.colors.text,
    marginBottom: theme.space.lg,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gap: {
    width: theme.space.md,
  },
});
