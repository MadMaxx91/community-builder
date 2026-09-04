import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { helpRequests, polls, marketItems, HelpRequest } from '../data/mock';
import { QuickActionCard } from '../components/QuickActionCard';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { TranslationKey } from '../i18n/translations';
import { CommunityAdminScreen } from './CommunityAdminScreen';
import { CreatePollModal } from '../components/CreatePollModal';
import { ReactionBar } from '../components/ReactionBar';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tab = 'help' | 'polls' | 'market' | 'wiki' | 'people';

type TabDef = { key: Tab; labelKey: TranslationKey; icon: IconName; featureKey?: keyof import('../data/mock').CommunityFeatures };

const TAB_DEFS: TabDef[] = [
  { key: 'people', labelKey: 'community.tabPeople', icon: 'person-outline' },
  { key: 'help',   labelKey: 'community.tabHelp',   icon: 'hand-left-outline',    featureKey: 'help' },
  { key: 'polls',  labelKey: 'community.tabPolls',  icon: 'bar-chart-outline',    featureKey: 'polls' },
  { key: 'market', labelKey: 'community.tabMarket', icon: 'storefront-outline',   featureKey: 'market' },
  { key: 'wiki',   labelKey: 'community.tabWiki',   icon: 'document-text-outline',featureKey: 'wiki' },
];

type WikiEntry = { icon: IconName; titleKey: TranslationKey; bodyKey: TranslationKey };

const WIKI_ENTRIES: WikiEntry[] = [
  { icon: 'trash-outline',        titleKey: 'wiki.trash',     bodyKey: 'wiki.trashBody' },
  { icon: 'construct-outline',    titleKey: 'wiki.super',     bodyKey: 'wiki.superBody' },
  { icon: 'water-outline',        titleKey: 'wiki.pool',      bodyKey: 'wiki.poolBody' },
  { icon: 'alert-circle-outline', titleKey: 'wiki.emergency', bodyKey: 'wiki.emergencyBody' },
  { icon: 'cube-outline',         titleKey: 'wiki.mailroom',  bodyKey: 'wiki.mailroomBody' },
];

export function CommunityScreen({ route, navigation }: { route?: any; navigation?: any }) {
  const { t } = useLanguage();
  const { isAdmin, setAdminVisible, activeCommunity } = useAuth();
  const { userPolls } = useContent();
  const features = activeCommunity?.features;

  const visibleTabs = TAB_DEFS.filter(td => !td.featureKey || !features || features[td.featureKey]);
  const [tab, setTab] = useState<Tab>('people');

  useEffect(() => {
    const requested = route?.params?.tab as Tab | undefined;
    if (requested && visibleTabs.find(td => td.key === requested)) {
      setTab(requested);
    }
  }, [route?.params]);
  const [requests] = useState<HelpRequest[]>(helpRequests);
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const activeTab = visibleTabs.find(td => td.key === tab) ? tab : (visibleTabs[0]?.key ?? 'people');
  const allPolls = [...polls, ...userPolls];
  const members = activeCommunity?.members ?? [];
  const filteredMembers = memberSearch.trim()
    ? members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : members;

  return (
    <View style={styles.screenBg}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeCommunity?.name ?? t('community.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation?.navigate('ShareModal')} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.ink} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity onPress={() => setAdminVisible(true)} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CommunityAdminScreen />
      <CreatePollModal visible={createPollOpen} onClose={() => setCreatePollOpen(false)} />

      {/* Shortcuts row */}
      <View style={styles.shortcutsSection}>
        <Text style={styles.shortcutsTitle}>{t('home.shortcuts')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          <QuickActionCard icon="hand-left-outline" label={t('home.helpRequests')} count={helpRequests.filter(r => !r.resolved).length} bg={Colors.tag.help.bg} onPress={() => setTab('help')} />
          <QuickActionCard icon="bar-chart-outline" label={t('home.activePolls')} count={allPolls.length} bg={Colors.tag.poll.bg} onPress={() => setTab('polls')} />
          <QuickActionCard icon="storefront-outline" label={t('home.marketplace')} count={marketItems.length} bg={Colors.tag.market.bg} onPress={() => setTab('market')} />
          <QuickActionCard icon="document-text-outline" label={t('home.buildingWiki')} bg={Colors.surfaceAlt} onPress={() => setTab('wiki')} />
        </ScrollView>
      </View>

      {visibleTabs.length > 0 ? (
        <>
          <View style={styles.tabRowWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {visibleTabs.map(td => {
                const active = activeTab === td.key;
                return (
                  <TouchableOpacity
                    key={td.key}
                    style={[styles.tab, active && styles.tabActive]}
                    onPress={() => setTab(td.key)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={td.icon} size={16} color={active ? Colors.accentFg : Colors.inkSoft} />
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t(td.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            {/* ─── People / Directory ─── */}
            {activeTab === 'people' && (
              <>
                <View style={styles.directoryHeader}>
                  <Text style={styles.directoryCount}>
                    {t('directory.count', { count: members.length })}
                  </Text>
                </View>
                <View style={styles.searchBox}>
                  <Ionicons name="search-outline" size={15} color={Colors.inkMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t('directory.search')}
                    placeholderTextColor={Colors.inkMuted}
                    value={memberSearch}
                    onChangeText={setMemberSearch}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {memberSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setMemberSearch('')}>
                      <Ionicons name="close-circle" size={16} color={Colors.inkMuted} />
                    </TouchableOpacity>
                  )}
                </View>
                {filteredMembers.length === 0 && (
                  <Text style={styles.empty}>{t('directory.empty')}</Text>
                )}
                {filteredMembers.map(m => (
                  <View key={m.id} style={styles.memberCard}>
                    <Avatar initials={m.initials} size={44} />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberFloor}>{m.floor}</Text>
                    </View>
                    {m.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>{t('directory.admin')}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* ─── Help ─── */}
            {activeTab === 'help' && requests.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.helpTop}>
                  <Text style={styles.helpTitle}>{t(r.titleKey)}</Text>
                  <Badge
                    label={r.resolved ? t('community.resolved') : t('community.open')}
                    bg={r.resolved ? Colors.tag.share.bg : Colors.tag.event.bg}
                    color={r.resolved ? Colors.tag.share.text : Colors.tag.event.text}
                  />
                </View>
                <Text style={styles.body}>{t(r.bodyKey)}</Text>
                <Text style={styles.meta}>{r.author} · {r.floor} · {r.time}</Text>
                {!r.resolved && (
                  <TouchableOpacity style={styles.darkBtn} activeOpacity={0.75}>
                    <Text style={styles.darkBtnText}>{t('community.iCanHelp')}</Text>
                  </TouchableOpacity>
                )}
                <ReactionBar itemId={r.id} />
              </View>
            ))}

            {/* ─── Polls ─── */}
            {activeTab === 'polls' && (
              <>
                <TouchableOpacity style={styles.createPollBtn} onPress={() => setCreatePollOpen(true)} activeOpacity={0.75}>
                  <Ionicons name="add-circle-outline" size={18} color={Colors.ink} />
                  <Text style={styles.createPollBtnText}>{t('poll.createTitle')}</Text>
                </TouchableOpacity>
                {allPolls.map(p => {
                  const isUser = 'question' in p;
                  if (isUser) {
                    return (
                      <View key={p.id} style={styles.card}>
                        <Text style={styles.pollQ}>{p.question}</Text>
                        {p.options.map((opt) => {
                          const pct = p.totalVotes > 0 ? Math.round((opt.votes / p.totalVotes) * 100) : 0;
                          return (
                            <TouchableOpacity key={opt.label} style={styles.pollOption} activeOpacity={0.7}>
                              <View style={styles.pollBarBg}>
                                <View style={[styles.pollBarFill, { width: `${pct}%` as any }]} />
                              </View>
                              <View style={styles.pollRow}>
                                <Text style={styles.pollLabel}>{opt.label}</Text>
                                <Text style={styles.pollPct}>{pct}%</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                        <Text style={styles.meta}>{p.totalVotes} votes · ends in {p.endsInLabel}</Text>
                        <ReactionBar itemId={p.id} />
                      </View>
                    );
                  }
                  return (
                    <View key={p.id} style={styles.card}>
                      <Text style={styles.pollQ}>{t(p.questionKey)}</Text>
                      {p.options.map((opt) => {
                        const pct = Math.round((opt.votes / p.totalVotes) * 100);
                        const isWinner = opt.votes === Math.max(...p.options.map(o => o.votes));
                        return (
                          <TouchableOpacity key={opt.labelKey} style={styles.pollOption} activeOpacity={0.7}>
                            <View style={styles.pollBarBg}>
                              <View style={[styles.pollBarFill, { width: `${pct}%` as any }, isWinner && styles.pollBarWinner]} />
                            </View>
                            <View style={styles.pollRow}>
                              <Text style={styles.pollLabel}>{t(opt.labelKey)}</Text>
                              <Text style={styles.pollPct}>{pct}%</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                      <Text style={styles.meta}>
                        {t('community.pollMeta', { votes: p.totalVotes, endsIn: t(p.endsInKey) })}
                      </Text>
                      <ReactionBar itemId={p.id} />
                    </View>
                  );
                })}
              </>
            )}

            {/* ─── Market ─── */}
            {activeTab === 'market' && marketItems.map(m => (
              <View key={m.id} style={[styles.card, styles.row]}>
                <View style={styles.marketIconWrap}>
                  <Ionicons name="pricetag-outline" size={18} color={Colors.inkSoft} />
                </View>
                <View style={styles.marketInfo}>
                  <Text style={styles.helpTitle}>{t(m.titleKey)}</Text>
                  <Text style={styles.meta}>{m.seller} · {m.floor}</Text>
                </View>
                <View style={styles.marketRight}>
                  <Text style={[styles.price, m.free && styles.priceFree]}>{m.free ? t('community.marketFree') : m.price}</Text>
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.75}>
                    <Text style={styles.outlineBtnText}>{t('community.contact')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* ─── Wiki ─── */}
            {activeTab === 'wiki' && WIKI_ENTRIES.map(w => (
              <View key={w.titleKey} style={[styles.card, styles.row]}>
                <View style={styles.wikiIconWrap}>
                  <Ionicons name={w.icon} size={18} color={Colors.inkSoft} />
                </View>
                <View style={styles.wikiContent}>
                  <Text style={styles.helpTitle}>{t(w.titleKey)}</Text>
                  <Text style={styles.body}>{t(w.bodyKey)}</Text>
                </View>
              </View>
            ))}

          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="apps-outline" size={40} color={Colors.inkMuted} />
          <Text style={styles.emptyText}>{t('admin.featureDisabled')}</Text>
        </View>
      )}
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
  title: { ...Typography.h1, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  adminBtn: { padding: 4 },
  shortcutsSection: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  shortcutsTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  catRow: { flexDirection: 'row', gap: Spacing.lg, paddingBottom: Spacing.sm },
  tabRowWrapper: { flexShrink: 0 },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm, paddingRight: Spacing.md, alignItems: 'center' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
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
  content: { padding: Spacing.md, paddingBottom: 120 },
  // Directory
  directoryHeader: { marginBottom: Spacing.sm },
  directoryCount: { ...Typography.label, color: Colors.inkSoft },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  empty: { ...Typography.body, textAlign: 'center', paddingTop: Spacing.xl },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberInfo: { flex: 1 },
  memberName: { ...Typography.label },
  memberFloor: { ...Typography.caption, marginTop: 2 },
  adminBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.inkSoft },
  // Poll create button
  createPollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  createPollBtnText: { ...Typography.label, fontSize: 14 },
  // Cards
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  emptyText: { ...Typography.body, textAlign: 'center', color: Colors.inkSoft },
});
