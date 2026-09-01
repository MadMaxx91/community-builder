import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { helpRequests, polls, marketItems, HelpRequest, MarketItem } from '../data/mock';
import { Badge } from '../components/ui/Badge';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tab = 'help' | 'polls' | 'market' | 'wiki';

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'help',   label: 'Help',   icon: 'hand-left-outline' },
  { key: 'polls',  label: 'Polls',  icon: 'bar-chart-outline' },
  { key: 'market', label: 'Market', icon: 'storefront-outline' },
  { key: 'wiki',   label: 'Wiki',   icon: 'document-text-outline' },
];

const WIKI_ITEMS = [
  { icon: 'trash-outline' as IconName,        title: 'Trash schedule',   body: 'Recycling: Mon & Thu. General: Tue & Fri. Hazardous: last Saturday of the month.' },
  { icon: 'construct-outline' as IconName,    title: 'Building super',   body: 'Greg M. · +1 555-0199 · Available Mon–Fri 8am–5pm' },
  { icon: 'water-outline' as IconName,        title: 'Pool rules',       body: 'Open 7am–10pm. Max 20 people. No guests after 8pm.' },
  { icon: 'alert-circle-outline' as IconName, title: 'Emergency',        body: 'Fire: 911 · Building security: +1 555-0100 · After-hours: +1 555-0101' },
  { icon: 'cube-outline' as IconName,         title: 'Mailroom',         body: 'Packages held up to 5 days. Pick up 9am–7pm weekdays, 10am–3pm weekends.' },
];

export function CommunityScreen() {
  const [tab, setTab] = useState<Tab>('help');
  const [requests] = useState<HelpRequest[]>(helpRequests);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
      </View>

      {/* Inner tab bar */}
      <View style={styles.tabRow}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.75}
            >
              <Ionicons name={t.icon} size={16} color={active ? Colors.accentFg : Colors.inkSoft} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {tab === 'help' && requests.map(r => (
          <View key={r.id} style={styles.card}>
            <View style={styles.helpTop}>
              <Text style={styles.helpTitle}>{r.title}</Text>
              <Badge
                label={r.resolved ? 'Resolved' : 'Open'}
                bg={r.resolved ? Colors.tag.share.bg : Colors.tag.event.bg}
                color={r.resolved ? Colors.tag.share.text : Colors.tag.event.text}
              />
            </View>
            <Text style={styles.body}>{r.body}</Text>
            <Text style={styles.meta}>{r.author} · {r.floor} · {r.time}</Text>
            {!r.resolved && (
              <TouchableOpacity style={styles.darkBtn} activeOpacity={0.75}>
                <Text style={styles.darkBtnText}>I can help</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {tab === 'polls' && polls.map(p => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.pollQ}>{p.question}</Text>
            {p.options.map((opt) => {
              const pct = Math.round((opt.votes / p.totalVotes) * 100);
              const isWinner = opt.votes === Math.max(...p.options.map(o => o.votes));
              return (
                <TouchableOpacity key={opt.label} style={styles.pollOption} activeOpacity={0.7}>
                  <View style={styles.pollBarBg}>
                    <View style={[styles.pollBarFill, { width: `${pct}%` as any }, isWinner && styles.pollBarWinner]} />
                  </View>
                  <View style={styles.pollRow}>
                    <Text style={styles.pollLabel}>{opt.label}</Text>
                    <Text style={styles.pollPct}>{pct}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <Text style={styles.meta}>{p.totalVotes} votes · ends in {p.endsIn}</Text>
          </View>
        ))}

        {tab === 'market' && marketItems.map(m => (
          <View key={m.id} style={[styles.card, styles.row]}>
            <View style={styles.marketIconWrap}>
              <Ionicons name="pricetag-outline" size={18} color={Colors.inkSoft} />
            </View>
            <View style={styles.marketInfo}>
              <Text style={styles.helpTitle}>{m.title}</Text>
              <Text style={styles.meta}>{m.seller} · {m.floor}</Text>
            </View>
            <View style={styles.marketRight}>
              <Text style={[styles.price, m.free && styles.priceFree]}>{m.price}</Text>
              <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.75}>
                <Text style={styles.outlineBtnText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {tab === 'wiki' && WIKI_ITEMS.map(w => (
          <View key={w.title} style={[styles.card, styles.row]}>
            <View style={styles.wikiIconWrap}>
              <Ionicons name={w.icon} size={18} color={Colors.inkSoft} />
            </View>
            <View style={styles.wikiContent}>
              <Text style={styles.helpTitle}>{w.title}</Text>
              <Text style={styles.body}>{w.body}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { ...Typography.h1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 5,
  },
  tabActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tabLabel: { fontSize: 12, fontWeight: '500', color: Colors.inkSoft },
  tabLabelActive: { color: Colors.accentFg },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  helpTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  helpTitle: { ...Typography.label, flex: 1, marginRight: Spacing.sm },
  body: { ...Typography.body, lineHeight: 18, marginBottom: 4 },
  meta: { ...Typography.caption },
  darkBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 9,
    alignItems: 'center',
  },
  darkBtnText: { color: Colors.accentFg, fontSize: 13, fontWeight: '600' },
  pollQ: { ...Typography.label, marginBottom: Spacing.sm, lineHeight: 20 },
  pollOption: { marginBottom: 8 },
  pollBarBg: { height: 5, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden', marginBottom: 4 },
  pollBarFill: { height: 5, backgroundColor: Colors.inkMuted, borderRadius: Radius.full },
  pollBarWinner: { backgroundColor: Colors.ink },
  pollRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pollLabel: { ...Typography.caption, flex: 1 },
  pollPct: { ...Typography.caption, fontWeight: '600' },
  marketIconWrap: { width: 42, height: 42, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  marketInfo: { flex: 1 },
  marketRight: { alignItems: 'flex-end', gap: 6 },
  price: { ...Typography.label, fontSize: 15 },
  priceFree: { color: Colors.tag.share.text },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  outlineBtnText: { fontSize: 12, fontWeight: '600', color: Colors.ink },
  wikiIconWrap: { width: 36, height: 36, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  wikiContent: { flex: 1 },
});
