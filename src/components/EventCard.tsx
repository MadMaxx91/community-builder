import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import type { DbEvent } from '../lib/database.types';
import { Button } from './ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { ItemActionMenu } from './ItemActionMenu';

type Props = {
  event: DbEvent;
  onRsvp?: (id: string) => void;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function EventCard({ event, onRsvp, canEdit, onEdit, onDelete }: Props) {
  const { t } = useLanguage();
  const date = new Date(event.starts_at);
  const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        {event.user_rsvped && (
          <View style={styles.goingPill}>
            <Ionicons name="checkmark" size={12} color={Colors.tag.share.text} />
            <Text style={styles.goingText}>{t('events.going')}</Text>
          </View>
        )}
        {canEdit && onDelete && (
          <ItemActionMenu canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={12} color={Colors.inkMuted} />
          <Text style={styles.meta}>{t('events.by', { host: event.author_name })}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={Colors.inkMuted} />
          <Text style={styles.meta}>{timeStr}</Text>
        </View>
        {event.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color={Colors.inkMuted} />
            <Text style={styles.meta}>{event.location}</Text>
          </View>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.attending}>{t('events.attendingCount', { count: event.rsvp_count })}</Text>
          <Button
            label={event.user_rsvped ? t('events.cancelRsvp') : t('events.rsvp')}
            variant={event.user_rsvped ? 'ghost' : 'primary'}
            onPress={() => onRsvp?.(event.id)}
            style={styles.rsvpBtn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  datePill: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  dateText: { color: Colors.accentFg, fontSize: 12, fontWeight: '600' },
  goingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tag.share.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  goingText: { fontSize: 12, fontWeight: '600', color: Colors.tag.share.text },
  body: { padding: Spacing.md },
  title: { ...Typography.h3, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  meta: { ...Typography.body, fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  attending: { ...Typography.caption },
  rsvpBtn: { paddingVertical: 8, paddingHorizontal: 20 },
});
