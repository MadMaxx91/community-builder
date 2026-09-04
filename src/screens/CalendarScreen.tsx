import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Font } from '../constants/theme';
import { events, EventItem } from '../data/mock';
import { EventCard } from '../components/EventCard';
import { useLanguage } from '../context/LanguageContext';

// Day numbers for each event id (Sep 2026)
const EVENT_DAYS: Record<string, number> = { e1: 6, e2: 12, e3: 20, e4: 21 };
const MONTH_YEAR = 'September 2026';
const MONTH = 8; // 0-indexed September
const YEAR = 2026;
// Sep 1, 2026 = Tuesday (0=Sun,1=Mon,...,2=Tue) → Monday-start offset = 1
const FIRST_DAY_OFFSET = 1; // days before Sep 1 in Mon-start grid
const DAYS_IN_MONTH = 30;
const TODAY = 2;

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type Props = { navigation: any };

export function CalendarScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number>(TODAY);
  const [items, setItems] = useState<EventItem[]>(events);

  const dayEventMap: Record<number, EventItem[]> = {};
  items.forEach(e => {
    const d = EVENT_DAYS[e.id];
    if (d) {
      if (!dayEventMap[d]) dayEventMap[d] = [];
      dayEventMap[d].push(e);
    }
  });

  const selectedEvents = selectedDay ? (dayEventMap[selectedDay] ?? []) : [];

  // Build the calendar grid cells (nulls = empty leading/trailing cells)
  const cells: (number | null)[] = [
    ...Array(FIRST_DAY_OFFSET).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  function toggleRsvp(id: string) {
    setItems(prev => prev.map(e => e.id === id ? { ...e, rsvp: !e.rsvp, attending: e.rsvp ? e.attending - 1 : e.attending + 1 } : e));
  }

  return (
    <View style={styles.screenBg}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ShareModal')} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Month label */}
        <View style={styles.monthRow}>
          <Text style={styles.monthLabel}>{MONTH_YEAR}</Text>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map(d => (
            <Text key={d} style={styles.weekday}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={`empty-${i}`} style={styles.cell} />;
            const hasEvents = !!dayEventMap[day];
            const isToday = day === TODAY;
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayNum, isSelected && styles.dayNumSelected, isToday && !isSelected && styles.dayNumToday]}>
                  {day}
                </Text>
                {hasEvents && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Events for selected day */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            {selectedEvents.length > 0
              ? `${MONTH_NAMES[MONTH]} ${selectedDay}`
              : 'Upcoming events'}
          </Text>
          {selectedEvents.length > 0 ? (
            selectedEvents.map(e => <EventCard key={e.id} event={e} onRsvp={toggleRsvp} />)
          ) : (
            items.map(e => <EventCard key={e.id} event={e} onRsvp={toggleRsvp} />)
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1 },
  iconBtn: { padding: 4 },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 120 },
  monthRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.sm },
  monthLabel: { fontFamily: Font.headingSemi, fontSize: 16, color: Colors.ink },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Font.bodyMedium,
    fontSize: 11,
    color: Colors.inkMuted,
    paddingVertical: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    gap: 2,
  },
  cellSelected: { backgroundColor: Colors.ink },
  cellToday: { backgroundColor: Colors.surfaceAlt },
  dayNum: { fontFamily: Font.body, fontSize: 13, color: Colors.ink },
  dayNumSelected: { color: Colors.accentFg, fontFamily: Font.bodySemi },
  dayNumToday: { color: Colors.ink, fontFamily: Font.bodySemi },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.coral },
  dotSelected: { backgroundColor: Colors.accentFg },
  eventsSection: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.inkMuted },
});
