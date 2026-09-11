import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '../constants/theme';

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
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      {/* Padding wrapper gives the badge room to overflow without clipping */}
      <View style={styles.iconOuter}>
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={22} color={Colors.ink} />
        </View>
        {count !== undefined && count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    width: 76,
  },
  iconOuter: {
    paddingTop: 7,
    paddingRight: 7,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.accentFg, fontFamily: Font.bodySemi, fontSize: 10 },
  label: {
    fontFamily: Font.body,
    fontSize: 11,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
});
