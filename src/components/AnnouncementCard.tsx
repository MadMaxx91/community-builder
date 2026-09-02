import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { Announcement } from '../data/mock';
import { useLanguage } from '../context/LanguageContext';
import { ReactionBar } from './ReactionBar';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TYPE_CONFIG: Record<string, { icon: IconName; color: string; bg: string }> = {
  alert: { icon: 'warning-outline',        color: '#991B1B', bg: '#FDE8E8' },
  info:  { icon: 'chatbubble-outline',      color: '#1B4FBF', bg: '#E6F0FF' },
  noise: { icon: 'musical-notes-outline',   color: '#2D6A4F', bg: '#E8F4EC' },
};

type Props = { item: Announcement };

export function AnnouncementCard({ item }: Props) {
  const { t } = useLanguage();
  const cfg = TYPE_CONFIG[item.type];
  return (
    <View style={[styles.card, { backgroundColor: cfg.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={16} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t(item.titleKey)}</Text>
        <Text style={styles.body}>{t(item.bodyKey)}</Text>
        <Text style={styles.meta}>{item.author} · {item.time}</Text>
        <ReactionBar itemId={item.id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  content: { flex: 1, gap: 3 },
  title: { ...Typography.label },
  body: { ...Typography.body, lineHeight: 18 },
  meta: { ...Typography.caption, marginTop: 2 },
});
