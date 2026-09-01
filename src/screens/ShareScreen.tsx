import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { shareItems, ShareItem } from '../data/mock';
import { ShareItemCard } from '../components/ShareItemCard';
import { Button } from '../components/ui/Button';

const CATEGORIES = ['All', 'Tools', 'Food', 'Sports', 'Kitchen'];

export function ShareScreen() {
  const [items] = useState<ShareItem[]>(shareItems);
  const [cat, setCat] = useState('All');

  const displayed = cat === 'All' ? items : items.filter(i => i.category === cat);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Share & Borrow</Text>
        <Button label="+ Share" variant="primary" style={styles.newBtn} />
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.pill, cat === c && styles.pillActive]}
            onPress={() => setCat(c)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, cat === c && styles.pillTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{items.filter(i => i.available).length}</Text>
          <Text style={styles.statLabel}>available now</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{items.filter(i => !i.available).length}</Text>
          <Text style={styles.statLabel}>borrowed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{items.length}</Text>
          <Text style={styles.statLabel}>total items</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {displayed.map(item => (
          <ShareItemCard key={item.id} item={item} onRequest={(id) => console.log('Requesting', id)} />
        ))}
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
  catScroll: { maxHeight: 48 },
  catContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, flexDirection: 'row', alignItems: 'center' },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pillText: { fontSize: 13, fontWeight: '500', color: Colors.inkSoft },
  pillTextActive: { color: Colors.accentFg },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  stat: { alignItems: 'center' },
  statNum: { ...Typography.h2, fontSize: 18 },
  statLabel: { ...Typography.caption },
  divider: { width: 0.5, height: 28, backgroundColor: Colors.border },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 40 },
});
