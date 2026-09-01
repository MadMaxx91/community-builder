import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { currentUser, announcements, helpRequests, polls, marketItems } from '../data/mock';
import { Avatar } from '../components/ui/Avatar';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { QuickActionCard } from '../components/QuickActionCard';

type Props = { navigation: any };

export function HomeScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const openRequests = helpRequests.filter(r => !r.resolved).length;
  const activePoll = polls[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.floorLabel}>{currentUser.floor} · {currentUser.building}</Text>
            <Text style={styles.greeting}>Hello, {currentUser.name.split(' ')[0]}!</Text>
          </View>
          <Avatar initials={currentUser.initials} size={40} />
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.inkMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search neighbours, events..."
            placeholderTextColor={Colors.inkMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Shortcuts</Text>
        <View style={styles.gridRow}>
          <QuickActionCard icon="hand-left-outline" label="Help requests" count={openRequests} bg="#FFF0E6" onPress={() => navigation.navigate('Community')} />
          <QuickActionCard icon="bar-chart-outline" label="Active polls" count={polls.length} bg="#EEF2FF" onPress={() => navigation.navigate('Community')} />
        </View>
        <View style={[styles.gridRow, { marginTop: Spacing.sm }]}>
          <QuickActionCard icon="storefront-outline" label="Marketplace" count={marketItems.length} bg="#F5F0E8" onPress={() => navigation.navigate('Community')} />
          <QuickActionCard icon="document-text-outline" label="Building wiki" bg="#E8F4EC" onPress={() => navigation.navigate('Community')} />
        </View>

        {/* Active poll */}
        <Text style={styles.sectionTitle}>Active poll</Text>
        <TouchableOpacity style={styles.pollCard} activeOpacity={0.8} onPress={() => navigation.navigate('Community')}>
          <Text style={styles.pollQ}>{activePoll.question}</Text>
          {activePoll.options.map((opt) => {
            const pct = Math.round((opt.votes / activePoll.totalVotes) * 100);
            return (
              <View key={opt.label} style={styles.pollOption}>
                <View style={styles.pollBarBg}>
                  <View style={[styles.pollBarFill, { width: `${pct}%` as any }]} />
                </View>
                <View style={styles.pollRow}>
                  <Text style={styles.pollLabel}>{opt.label}</Text>
                  <Text style={styles.pollPct}>{pct}%</Text>
                </View>
              </View>
            );
          })}
          <Text style={styles.pollMeta}>{activePoll.totalVotes} votes · ends in {activePoll.endsIn}</Text>
        </TouchableOpacity>

        {/* Announcements */}
        <Text style={styles.sectionTitle}>Announcements</Text>
        {announcements.map(a => <AnnouncementCard key={a.id} item={a} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  floorLabel: { ...Typography.caption, marginBottom: 2 },
  greeting: { ...Typography.h1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  gridRow: { flexDirection: 'row', gap: Spacing.sm },
  pollCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pollQ: { ...Typography.label, marginBottom: Spacing.sm, lineHeight: 20 },
  pollOption: { marginBottom: 8 },
  pollBarBg: { height: 5, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden', marginBottom: 4 },
  pollBarFill: { height: 5, backgroundColor: Colors.ink, borderRadius: Radius.full },
  pollRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pollLabel: { ...Typography.caption, flex: 1 },
  pollPct: { ...Typography.caption, fontWeight: '600' },
  pollMeta: { ...Typography.caption, marginTop: Spacing.sm },
});
