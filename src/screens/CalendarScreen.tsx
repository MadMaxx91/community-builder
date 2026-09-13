import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Font } from '../constants/theme';
import { useContent } from '../context/ContentContext';
import type { DbEvent } from '../context/ContentContext';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { useAuth } from '../context/AuthContext';

const MONTH_YEAR = 'September 2026';
const MONTH = 8; // 0-indexed September
const YEAR = 2026;
// Sep 1, 2026 = Tuesday (0=Sun,1=Mon,...,2=Tue) → Monday-start offset = 1
const FIRST_DAY_OFFSET = 1; // days before Sep 1 in Mon-start grid
const DAYS_IN_MONTH = 30;
const TODAY = 11;

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function CalendarScreen() {
  const { events, toggleRsvp, deleteEvent } = useContent();
  const { user, isAdmin } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number>(TODAY);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);

  // Map day → events that fall on that day in Sep 2026
  const dayEventMap: Record<number, typeof events> = {};
  events.forEach(e => {
    const d = new Date(e.starts_at);
    if (d.getFullYear() === YEAR && d.getMonth() === MONTH) {
      const day = d.getDate();
      if (!dayEventMap[day]) dayEventMap[day] = [];
      dayEventMap[day].push(e);
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

  return (
    <View style={styles.screenBg}>
    <CreateEventModal item={editingEvent ?? undefined} visible={!!editingEvent} onClose={() => setEditingEvent(null)} />
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Ionicons name="calendar-outline" size={22} color={Colors.ink} />
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
            selectedEvents.map(e => (
              <EventCard
                key={e.id}
                event={e}
                onRsvp={toggleRsvp}
                canEdit={user?.id === e.author_id || isAdmin}
                onEdit={() => setEditingEvent(e)}
                onDelete={() => deleteEvent(e.id)}
              />
            ))
          ) : (
            events.map(e => (
              <EventCard
                key={e.id}
                event={e}
                onRsvp={toggleRsvp}
                canEdit={user?.id === e.author_id || isAdmin}
                onEdit={() => setEditingEvent(e)}
                onDelete={() => deleteEvent(e.id)}
              />
            ))
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
  emptyText: { ...Typography.body, color: Colors.inkMuted },
});
