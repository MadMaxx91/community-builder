import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { EventItem } from '../data/mock';
import { Button } from './ui/Button';

type Props = {
  event: EventItem;
  onRsvp?: (id: string) => void;
};

export function EventCard({ event, onRsvp }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{event.date}</Text>
        </View>
        {event.rsvp && (
          <View style={styles.goingPill}>
            <Ionicons name="checkmark" size={12} color={Colors.tag.share.text} />
            <Text style={styles.goingText}>Going</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={12} color={Colors.inkMuted} />
          <Text style={styles.meta}>by {event.host}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={Colors.inkMuted} />
          <Text style={styles.meta}>{event.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={Colors.inkMuted} />
          <Text style={styles.meta}>{event.location}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.attending}>{event.attending} going</Text>
          <Button
            label={event.rsvp ? 'Cancel RSVP' : 'RSVP'}
            variant={event.rsvp ? 'ghost' : 'primary'}
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
