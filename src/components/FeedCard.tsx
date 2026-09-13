import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { FeedItem } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';
import { ReactionBar } from './ReactionBar';
import { TranslationKey } from '../i18n/translations';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const KIND_META: Record<string, { icon: IconName; labelKey: TranslationKey; color: string }> = {
  announcement: { icon: 'megaphone-outline',  labelKey: 'feed.newAnnouncement', color: '#1B4FBF' },
  event:        { icon: 'calendar-outline',    labelKey: 'feed.newEvent',        color: '#2D6A4F' },
  poll:         { icon: 'bar-chart-outline',   labelKey: 'feed.newPoll',         color: '#7C3AED' },
  help:         { icon: 'hand-left-outline',   labelKey: 'feed.newHelp',         color: '#C05621' },
  market:       { icon: 'pricetag-outline',    labelKey: 'feed.newMarket',       color: '#1B4FBF' },
};

type Props = { item: FeedItem };

export function FeedCard({ item }: Props) {
  const { t } = useLanguage();
  const meta = KIND_META[item.kind];
  if (!meta) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color + '18' }]}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
        </View>
        <Text style={[styles.kindLabel, { color: meta.color }]}>{t(meta.labelKey)}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <FeedItemBody item={item} />

      <ReactionBar itemId={item.id} />
    </View>
  );
}

function FeedItemBody({ item }: Props) {
  if (item.kind === 'announcement') {
    const d = item.data;
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{d.title}</Text>
        <Text style={styles.bodyText} numberOfLines={2}>{d.body}</Text>
        <Text style={styles.meta}>{d.author_name} · {item.time}</Text>
      </View>
    );
  }

  if (item.kind === 'event') {
    const d = item.data;
    const dateStr = new Date(d.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = new Date(d.starts_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{d.title}</Text>
        <Text style={styles.meta}>{dateStr} · {timeStr}{d.location ? ` · ${d.location}` : ''}</Text>
        <Text style={styles.meta}>{d.rsvp_count} going · by {d.author_name}</Text>
      </View>
    );
  }

  if (item.kind === 'poll') {
    const d = item.data;
    const top = d.options.length > 0 ? d.options.reduce((a, b) => a.votes > b.votes ? a : b) : null;
    const pct = top && d.total_votes > 0 ? Math.round((top.votes / d.total_votes) * 100) : 0;
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{d.question}</Text>
        {top && (
          <View style={styles.pollPreview}>
            <View style={styles.pollBarBg}>
              <View style={[styles.pollBarFill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={styles.meta}>{top.label} — {pct}% · {d.total_votes} votes</Text>
          </View>
        )}
        {!top && <Text style={styles.meta}>No votes yet</Text>}
      </View>
    );
  }

  if (item.kind === 'help') {
    const d = item.data;
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{d.title}</Text>
        <Text style={styles.bodyText} numberOfLines={2}>{d.body}</Text>
        <Text style={styles.meta}>{d.author_name}{d.floor ? ` · ${d.floor}` : ''} · {item.time}</Text>
      </View>
    );
  }

  if (item.kind === 'market') {
    const d = item.data;
    return (
      <View style={styles.body}>
        <View style={styles.marketRow}>
          <Text style={styles.marketEmoji}>{d.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bodyTitle}>{d.title}</Text>
            <Text style={styles.meta}>{d.author_name}</Text>
          </View>
          <Text style={styles.price}>{d.is_free ? 'Free' : d.price != null ? `$${d.price}` : ''}</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  iconWrap: { width: 22, height: 22, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  kindLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  time: { ...Typography.caption, fontSize: 11 },
  body: { gap: 3 },
  bodyTitle: { ...Typography.label, lineHeight: 20 },
  bodyText: { ...Typography.body, lineHeight: 18, fontSize: 13 },
  meta: { ...Typography.caption, fontSize: 11 },
  pollPreview: { marginTop: 4, gap: 4 },
  pollBarBg: { height: 4, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden' },
  pollBarFill: { height: 4, backgroundColor: Colors.ink, borderRadius: Radius.full },
  marketRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  marketEmoji: { fontSize: 24 },
  price: { ...Typography.label, fontSize: 15 },
});
