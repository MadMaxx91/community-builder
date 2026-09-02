import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { events, EventItem } from '../data/mock';
import { EventCard } from '../components/EventCard';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

export function EventsScreen() {
  const { t } = useLanguage();
  const [items, setItems] = useState<EventItem[]>(events);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const displayed = filter === 'mine' ? items.filter(e => e.rsvp) : items;

  function toggleRsvp(id: string) {
    setItems(prev => prev.map(e => e.id === id ? { ...e, rsvp: !e.rsvp, attending: e.rsvp ? e.attending - 1 : e.attending + 1 } : e));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>{t('events.title')}</Text>
        <Button label={t('events.new')} variant="primary" style={styles.newBtn} />
      </View>

      <View style={styles.pills}>
        {(['all', 'mine'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === 'all' ? t('events.allEvents') : t('events.myRsvps')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {displayed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>{t('events.noRsvps')}</Text>
          </View>
        ) : (
          displayed.map(e => <EventCard key={e.id} event={e} onRsvp={toggleRsvp} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1 },
  newBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  pills: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pillText: { fontSize: 13, fontWeight: '500', color: Colors.inkSoft },
  pillTextActive: { color: Colors.accentFg },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyText: { ...Typography.body, textAlign: 'center', maxWidth: 240 },
});
