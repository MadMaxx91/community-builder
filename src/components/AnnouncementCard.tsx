import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import type { DbAnnouncement } from '../lib/database.types';
import { ReactionBar } from './ReactionBar';
import { ItemActionMenu } from './ItemActionMenu';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TYPE_CONFIG: Record<string, { icon: IconName; color: string; bg: string }> = {
  alert: { icon: 'warning-outline',        color: '#991B1B', bg: '#FDE8E8' },
  info:  { icon: 'chatbubble-outline',      color: '#1B4FBF', bg: '#E6F0FF' },
  noise: { icon: 'musical-notes-outline',   color: '#2D6A4F', bg: '#E8F4EC' },
};

type Props = {
  item: DbAnnouncement;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AnnouncementCard({ item, canEdit, onEdit, onDelete }: Props) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info;
  return (
    <View style={[styles.card, { backgroundColor: cfg.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={16} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { flex: 1 }]}>{item.title}</Text>
          {canEdit && onDelete && (
            <ItemActionMenu canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          )}
        </View>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.meta}>{item.author_name}</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { ...Typography.label },
  body: { ...Typography.body, lineHeight: 18 },
  meta: { ...Typography.caption, marginTop: 2 },
});
