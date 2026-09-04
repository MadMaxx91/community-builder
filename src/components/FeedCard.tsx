import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { FeedItem } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';
import { ReactionBar } from './ReactionBar';
import { TranslationKey } from '../i18n/translations';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = { item: FeedItem };

const KIND_META: Record<string, { icon: IconName; labelKey: TranslationKey; color: string }> = {
  announcement: { icon: 'megaphone-outline',    labelKey: 'feed.newAnnouncement', color: Colors.ink },
  event:        { icon: 'calendar-outline',      labelKey: 'feed.newEvent',        color: Colors.tag.event.text },
  poll:         { icon: 'bar-chart-outline',     labelKey: 'feed.newPoll',         color: Colors.ink },
  userPoll:     { icon: 'bar-chart-outline',     labelKey: 'feed.newPoll',         color: Colors.ink },
  help:         { icon: 'hand-left-outline',     labelKey: 'feed.newHelp',         color: Colors.tag.help.text },
  market:       { icon: 'pricetag-outline',      labelKey: 'feed.newMarket',       color: Colors.tag.market.text },
};

export function FeedCard({ item }: Props) {
  const { t } = useLanguage();
  const meta = KIND_META[item.kind];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color + '18' }]}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
        </View>
        <Text style={[styles.kindLabel, { color: meta.color }]}>{t(meta.labelKey)}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {/* Content */}
      <FeedItemBody item={item} />

      {/* Reactions */}
      <ReactionBar itemId={item.id} />
    </View>
  );
}

function FeedItemBody({ item }: Props) {
  const { t } = useLanguage();

  if (item.kind === 'announcement') {
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{t(item.data.titleKey)}</Text>
        <Text style={styles.bodyText} numberOfLines={2}>{t(item.data.bodyKey)}</Text>
        <Text style={styles.meta}>{item.data.author} · {item.data.time}</Text>
      </View>
    );
  }

  if (item.kind === 'event') {
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{t(item.data.titleKey)}</Text>
        <Text style={styles.meta}>{t(item.data.dateKey)} · {t(item.data.timeKey)} · {t(item.data.locationKey)}</Text>
        <Text style={styles.meta}>{item.data.attending} going · by {item.data.host}</Text>
      </View>
    );
  }

  if (item.kind === 'poll') {
    const top = item.data.options.reduce((a, b) => a.votes > b.votes ? a : b);
    const pct = item.data.totalVotes > 0 ? Math.round((top.votes / item.data.totalVotes) * 100) : 0;
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{t(item.data.questionKey)}</Text>
        <View style={styles.pollPreview}>
          <View style={styles.pollBarBg}>
            <View style={[styles.pollBarFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={styles.meta}>{t(top.labelKey)} — {pct}%  ·  {item.data.totalVotes} votes</Text>
        </View>
      </View>
    );
  }

  if (item.kind === 'userPoll') {
    const top = item.data.options.length > 0
      ? item.data.options.reduce((a, b) => a.votes > b.votes ? a : b)
      : null;
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{item.data.question}</Text>
        <Text style={styles.meta}>
          {item.data.totalVotes} votes · ends in {item.data.endsInLabel}
        </Text>
        {item.data.options.slice(0, 2).map(opt => (
          <Text key={opt.label} style={styles.pollOption}>· {opt.label}</Text>
        ))}
        {item.data.options.length > 2 && (
          <Text style={styles.meta}>+{item.data.options.length - 2} more options</Text>
        )}
      </View>
    );
  }

  if (item.kind === 'help') {
    return (
      <View style={styles.body}>
        <Text style={styles.bodyTitle}>{t(item.data.titleKey)}</Text>
        <Text style={styles.bodyText} numberOfLines={2}>{t(item.data.bodyKey)}</Text>
        <Text style={styles.meta}>{item.data.author} · {item.data.floor} · {item.data.time}</Text>
      </View>
    );
  }

  if (item.kind === 'market') {
    return (
      <View style={styles.body}>
        <View style={styles.marketRow}>
          <Text style={styles.marketEmoji}>{item.data.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bodyTitle}>{t(item.data.titleKey)}</Text>
            <Text style={styles.meta}>{item.data.seller} · {item.data.floor}</Text>
          </View>
          <Text style={styles.price}>{item.data.free ? 'Free' : item.data.price}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  time: { ...Typography.caption, fontSize: 11 },
  body: { gap: 3 },
  bodyTitle: { ...Typography.label, lineHeight: 20 },
  bodyText: { ...Typography.body, lineHeight: 18, fontSize: 13 },
  meta: { ...Typography.caption, fontSize: 11 },
  pollPreview: { marginTop: 4, gap: 4 },
  pollBarBg: { height: 4, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden' },
  pollBarFill: { height: 4, backgroundColor: Colors.ink, borderRadius: Radius.full },
  pollOption: { ...Typography.caption, fontSize: 12 },
  marketRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  marketEmoji: { fontSize: 24 },
  price: { ...Typography.label, fontSize: 15 },
});
