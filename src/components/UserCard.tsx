import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {theme, elevationCard} from '../theme';
import type {UserRecord} from '../services/user';

export type PeopleRow = UserRecord & {isAvailable: boolean};

interface UserCardProps {
  item: PeopleRow;
  callingUserId: string | null;
  onCall: (user: UserRecord) => void;
}

export default function UserCard({item, callingUserId, onCall}: UserCardProps) {
  const isAvailable = item.isAvailable;

  return (
    <View style={[styles.card, elevationCard(4)]}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <View
            style={[styles.dot, isAvailable ? styles.dotOn : styles.dotOff]}
            accessibilityLabel={isAvailable ? 'Available' : 'Unavailable'}
          />
          <Text style={styles.name} numberOfLines={1}>
            {item.displayName}
          </Text>
        </View>
        <Text style={styles.platform}>
          {item.platform}
          <Text style={styles.status}>
            {' · '}
            {isAvailable ? 'Available' : 'Away'}
          </Text>
        </Text>
      </View>

      {callingUserId === item.userId ? (
        <ActivityIndicator color={theme.colors.accent} />
      ) : (
        <TouchableOpacity
          style={[styles.callBtn, !!callingUserId && styles.callBtnDisabled]}
          onPress={() => onCall(item)}
          disabled={!!callingUserId}
          activeOpacity={0.85}>
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function UserCardSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  info: {
    flex: 1,
    marginRight: theme.space.md,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOn: {
    backgroundColor: theme.colors.success,
  },
  dotOff: {
    backgroundColor: theme.colors.textMuted,
  },
  name: {
    fontSize: theme.font.body,
    fontWeight: '600',
    color: theme.colors.text,
    flexShrink: 1,
  },
  platform: {
    fontSize: theme.font.caption,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  status: {
    color: theme.colors.textSecondary,
    textTransform: 'none',
  },
  callBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.space.xl,
    paddingVertical: theme.space.sm + 2,
    borderRadius: theme.radii.pill,
  },
  callBtnDisabled: {
    opacity: 0.4,
  },
  callBtnText: {
    color: theme.colors.onAccent,
    fontWeight: '700',
    fontSize: theme.font.small,
  },
  separator: {
    height: theme.space.sm,
  },
});
