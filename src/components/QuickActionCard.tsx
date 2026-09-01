import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  label: string;
  count?: number;
  bg?: string;
  onPress?: () => void;
};

export function QuickActionCard({ icon, label, count, bg = Colors.surfaceAlt, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={22} color={Colors.ink} />
      <Text style={styles.label}>{label}</Text>
      {count !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 86,
    justifyContent: 'space-between',
    position: 'relative',
  },
  label: { ...Typography.label, marginTop: Spacing.xs, fontSize: 13 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.accentFg, fontSize: 11, fontWeight: '700' },
});
