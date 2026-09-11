import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import type { DbHelpRequest, DbMarketItem, DbWikiEntry } from '../context/ContentContext';
import { TranslationKey } from '../i18n/translations';
import { CommunityAdminScreen } from './CommunityAdminScreen';
import { CreatePollModal } from '../components/CreatePollModal';
import { CreateHelpModal } from '../components/CreateHelpModal';
import { CreateMarketItemModal } from '../components/CreateMarketItemModal';
import { CreateWikiEntryModal } from '../components/CreateWikiEntryModal';
import { ReactionBar } from '../components/ReactionBar';
import { ItemActionMenu } from '../components/ItemActionMenu';
import type { CommunityFeatures } from '../lib/database.types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tab = 'help' | 'polls' | 'market' | 'wiki' | 'people';

type TabDef = { key: Tab; labelKey: TranslationKey; icon: IconName; featureKey?: keyof CommunityFeatures };

const TAB_DEFS: TabDef[] = [
  { key: 'people', labelKey: 'community.tabPeople', icon: 'person-outline' },
  { key: 'help',   labelKey: 'community.tabHelp',   icon: 'hand-left-outline',    featureKey: 'help' },
  { key: 'polls',  labelKey: 'community.tabPolls',  icon: 'bar-chart-outline',    featureKey: 'polls' },
  { key: 'market', labelKey: 'community.tabMarket', icon: 'storefront-outline',   featureKey: 'market' },
  { key: 'wiki',   labelKey: 'community.tabWiki',   icon: 'document-text-outline',featureKey: 'wiki' },
];


export function CommunityScreen({ route }: { route?: any }) {
  const { t } = useLanguage();
  const { isAdmin, setAdminVisible, activeCommunity, user } = useAuth();
  const { helpRequests, polls, marketItems, wikiEntries, toggleRsvp, deleteHelpRequest, deleteMarketItem, deleteWikiEntry, deletePoll } = useContent();
  const features = activeCommunity?.features;

  const visibleTabs = TAB_DEFS.filter(td => !td.featureKey || !features || features[td.featureKey]);
  const [tab, setTab] = useState<Tab>('people');

  useEffect(() => {
    const requested = route?.params?.tab as Tab | undefined;
    if (requested && visibleTabs.find(td => td.key === requested)) {
      setTab(requested);
    }
  }, [route?.params]);

  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [createHelpOpen, setCreateHelpOpen] = useState(false);
  const [createMarketOpen, setCreateMarketOpen] = useState(false);
  const [createWikiOpen, setCreateWikiOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [editingHelp, setEditingHelp] = useState<DbHelpRequest | null>(null);
  const [editingMarket, setEditingMarket] = useState<DbMarketItem | null>(null);
  const [editingWiki, setEditingWiki] = useState<DbWikiEntry | null>(null);

  const activeTab = visibleTabs.find(td => td.key === tab) ? tab : (visibleTabs[0]?.key ?? 'people');
  const members = activeCommunity?.members ?? [];
  const filteredMembers = memberSearch.trim()
    ? members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : members;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeCommunity?.name ?? t('community.title')}</Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => setAdminVisible(true)} style={styles.adminBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
        )}
      </View>

      <CommunityAdminScreen />
      <CreatePollModal visible={createPollOpen} onClose={() => setCreatePollOpen(false)} />
      <CreateHelpModal visible={createHelpOpen} onClose={() => setCreateHelpOpen(false)} />
      <CreateHelpModal item={editingHelp ?? undefined} visible={!!editingHelp} onClose={() => setEditingHelp(null)} />
      <CreateMarketItemModal visible={createMarketOpen} onClose={() => setCreateMarketOpen(false)} />
      <CreateMarketItemModal item={editingMarket ?? undefined} visible={!!editingMarket} onClose={() => setEditingMarket(null)} />
      <CreateWikiEntryModal visible={createWikiOpen} onClose={() => setCreateWikiOpen(false)} />
      <CreateWikiEntryModal item={editingWiki ?? undefined} visible={!!editingWiki} onClose={() => setEditingWiki(null)} />

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
            {activeTab === 'help' && (
              <>
                <TouchableOpacity style={styles.createPollBtn} onPress={() => setCreateHelpOpen(true)} activeOpacity={0.75}>
                  <Ionicons name="add-circle-outline" size={18} color={Colors.ink} />
                  <Text style={styles.createPollBtnText}>New Help Request</Text>
                </TouchableOpacity>
              </>
            )}
            {activeTab === 'help' && helpRequests.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.helpTop}>
                  <Text style={styles.helpTitle}>{r.title}</Text>
                  <Badge
                    label={r.resolved ? t('community.resolved') : t('community.open')}
                    bg={r.resolved ? Colors.tag.share.bg : Colors.tag.event.bg}
                    color={r.resolved ? Colors.tag.share.text : Colors.tag.event.text}
                  />
                  <ItemActionMenu
                    canEdit={r.author_id === user?.id || isAdmin}
                    onEdit={() => setEditingHelp(r)}
                    onDelete={() => deleteHelpRequest(r.id)}
                  />
                </View>
                <Text style={styles.body}>{r.body}</Text>
                <Text style={styles.meta}>{r.author_name}{r.floor ? ` · ${r.floor}` : ''}</Text>
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
                {polls.map(p => {
                  const maxVotes = p.options.length > 0 ? Math.max(...p.options.map(o => o.votes)) : 0;
                  return (
                    <View key={p.id} style={styles.card}>
                      <View style={styles.pollHeader}>
                        <Text style={[styles.pollQ, { flex: 1 }]}>{p.question}</Text>
                        <ItemActionMenu
                          canEdit={p.author_id === user?.id || isAdmin}
                          onDelete={() => deletePoll(p.id)}
                        />
                      </View>
                      {p.options.map(opt => {
                        const pct = p.total_votes > 0 ? Math.round((opt.votes / p.total_votes) * 100) : 0;
                        const isWinner = opt.votes === maxVotes && maxVotes > 0;
                        const isUserVote = p.user_vote_option_id === opt.id;
                        return (
                          <TouchableOpacity key={opt.id} style={styles.pollOption} activeOpacity={0.7}>
                            <View style={styles.pollBarBg}>
                              <View style={[styles.pollBarFill, { width: `${pct}%` as any }, isWinner && styles.pollBarWinner]} />
                            </View>
                            <View style={styles.pollRow}>
                              <Text style={[styles.pollLabel, isUserVote && styles.pollLabelVoted]}>{opt.label}</Text>
                              <Text style={styles.pollPct}>{pct}%</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                      <Text style={styles.meta}>{p.total_votes} votes · by {p.author_name}</Text>
                      <ReactionBar itemId={p.id} />
                    </View>
                  );
                })}
              </>
            )}

            {/* ─── Market ─── */}
            {activeTab === 'market' && (
              <TouchableOpacity style={styles.createPollBtn} onPress={() => setCreateMarketOpen(true)} activeOpacity={0.75}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.ink} />
                <Text style={styles.createPollBtnText}>New Listing</Text>
              </TouchableOpacity>
            )}
            {activeTab === 'market' && marketItems.map(m => (
              <View key={m.id} style={[styles.card, styles.row]}>
                <View style={styles.marketIconWrap}>
                  <Text style={styles.marketEmoji}>{m.emoji || '🏷️'}</Text>
                </View>
                <View style={styles.marketInfo}>
                  <Text style={styles.helpTitle}>{m.title}</Text>
                  <Text style={styles.meta}>{m.author_name}</Text>
                </View>
                <View style={styles.marketRight}>
                  <Text style={[styles.price, m.is_free && styles.priceFree]}>
                    {m.is_free ? t('community.marketFree') : m.price != null ? `$${m.price}` : ''}
                  </Text>
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.75}>
                    <Text style={styles.outlineBtnText}>{t('community.contact')}</Text>
                  </TouchableOpacity>
                  <ItemActionMenu
                    canEdit={m.author_id === user?.id || isAdmin}
                    onEdit={() => setEditingMarket(m)}
                    onDelete={() => deleteMarketItem(m.id)}
                  />
                </View>
              </View>
            ))}

            {/* ─── Wiki ─── */}
            {activeTab === 'wiki' && (
              <TouchableOpacity style={styles.createPollBtn} onPress={() => setCreateWikiOpen(true)} activeOpacity={0.75}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.ink} />
                <Text style={styles.createPollBtnText}>New Wiki Entry</Text>
              </TouchableOpacity>
            )}
            {activeTab === 'wiki' && wikiEntries.length === 0 && (
              <Text style={styles.empty}>No wiki entries yet. Add building info, schedules, contacts…</Text>
            )}
            {activeTab === 'wiki' && wikiEntries.map(w => (
              <View key={w.id} style={[styles.card, styles.row]}>
                <View style={styles.wikiIconWrap}>
                  <Text style={{ fontSize: 18 }}>{w.emoji}</Text>
                </View>
                <View style={styles.wikiContent}>
                  <View style={styles.wikiHeader}>
                    <Text style={[styles.helpTitle, { flex: 1 }]}>{w.title}</Text>
                    <ItemActionMenu
                      canEdit={isAdmin || features?.wiki_edit_policy !== 'admin_only'}
                      onEdit={() => setEditingWiki(w)}
                      onDelete={() => deleteWikiEntry(w.id)}
                    />
                  </View>
                  <Text style={styles.body}>{w.body}</Text>
                  <Text style={styles.meta}>{w.author_name}</Text>
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1, flex: 1 },
  adminBtn: { padding: 4 },
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
  content: { padding: Spacing.md, paddingBottom: 40 },
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
  pollHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  pollQ: { ...Typography.label, lineHeight: 20 },
  pollOption: { marginBottom: 8 },
  pollBarBg: { height: 5, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden', marginBottom: 4 },
  pollBarFill: { height: 5, backgroundColor: Colors.inkMuted, borderRadius: Radius.full },
  pollBarWinner: { backgroundColor: Colors.ink },
  pollRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pollLabel: { ...Typography.caption, flex: 1 },
  pollLabelVoted: { fontWeight: '700' },
  pollPct: { ...Typography.caption, fontWeight: '600' },
  marketIconWrap: { width: 42, height: 42, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  marketEmoji: { fontSize: 22 },
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
  wikiHeader: { flexDirection: 'row', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  emptyText: { ...Typography.body, textAlign: 'center', color: Colors.inkSoft },
});
