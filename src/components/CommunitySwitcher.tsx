import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, SafeAreaView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CommunityType } from '../lib/database.types';
import { CreateCommunityModal } from './CreateCommunityModal';

type FilterValue = CommunityType | 'all';

export function CommunitySwitcher() {
  const {
    activeCommunity, joinedCommunities, switchCommunity, leaveCommunity,
    requestToJoin, joinWithCode, pendingJoinIds, allKnownCommunities,
  } = useAuth();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [tab, setTab] = useState<'mine' | 'find'>('mine');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [codeInput, setCodeInput] = useState('');
  const [codeMsg, setCodeMsg] = useState('');

  const FILTERS: { label: string; value: FilterValue }[] = [
    { label: t('switcher.filterAll'),          value: 'all' },
    { label: t('switcher.filterBuilding'),      value: 'building' },
    { label: t('switcher.filterStreet'),        value: 'street' },
    { label: t('switcher.filterComplex'),       value: 'complex' },
    { label: t('switcher.filterNeighborhood'),  value: 'neighborhood' },
  ];

  // Public communities not yet joined (visible in search)
  const available = useMemo(() => {
    const notJoined = allKnownCommunities.filter(
      c => c.isPublic && !joinedCommunities.find(j => j.id === c.id) && !pendingJoinIds.includes(c.id)
    );
    const byType = filter === 'all' ? notJoined : notJoined.filter(c => c.type === filter);
    const q = search.trim().toLowerCase();
    return q ? byType.filter(c => c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)) : byType;
  }, [allKnownCommunities, joinedCommunities, pendingJoinIds, filter, search]);

  // Pending communities (public — awaiting approval)
  const pendingCommunities = useMemo(
    () => allKnownCommunities.filter(c => pendingJoinIds.includes(c.id)),
    [allKnownCommunities, pendingJoinIds]
  );

  function handleOpen() {
    setTab('mine');
    setSearch('');
    setFilter('all');
    setCodeInput('');
    setCodeMsg('');
    setOpen(true);
  }

  function handleJoinWithCode() {
    if (!codeInput.trim()) return;
    const result = joinWithCode(codeInput);
    if (result === 'not_found') setCodeMsg(t('switcher.codeNotFound'));
    else if (result === 'already_joined') setCodeMsg(t('switcher.codeAlreadyJoined'));
    else if (result === 'pending') { setCodeMsg(''); setTab('mine'); }
    else setCodeMsg('');
    setCodeInput('');
  }

  return (
    <>
      <TouchableOpacity style={styles.pill} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={styles.pillEmoji}>{activeCommunity?.emoji ?? '🏘'}</Text>
        <Text style={styles.pillName} numberOfLines={1}>
          {activeCommunity?.name ?? t('switcher.title')}
        </Text>
        {activeCommunity && !activeCommunity.isPublic && (
          <Ionicons name="lock-closed" size={12} color={Colors.inkSoft} />
        )}
        <Ionicons name="chevron-down" size={14} color={Colors.inkSoft} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('switcher.title')}</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'mine' && styles.tabActive]}
              onPress={() => setTab('mine')}
            >
              <Text style={[styles.tabLabel, tab === 'mine' && styles.tabLabelActive]}>
                {t('switcher.myCommunities')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'find' && styles.tabActive]}
              onPress={() => setTab('find')}
            >
              <Text style={[styles.tabLabel, tab === 'find' && styles.tabLabelActive]}>
                {t('switcher.findMore')}
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'find' && (
            <View style={styles.findControls}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={15} color={Colors.inkMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('switcher.search')}
                  placeholderTextColor={Colors.inkMuted}
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={16} color={Colors.inkMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTERS.map(f => (
                  <TouchableOpacity
                    key={f.value}
                    style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
                    onPress={() => setFilter(f.value)}
                  >
                    <Text style={[styles.filterChipLabel, filter === f.value && styles.filterChipLabelActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {tab === 'mine' && (
              <>
                {joinedCommunities.map(c => (
                  <View key={c.id} style={styles.row}>
                    <TouchableOpacity
                      style={[styles.rowMain, activeCommunity?.id === c.id && styles.rowActive]}
                      activeOpacity={0.7}
                      onPress={() => { switchCommunity(c.id); setOpen(false); }}
                    >
                      <Text style={styles.rowEmoji}>{c.emoji}</Text>
                      <View style={styles.rowText}>
                        <View style={styles.rowNameRow}>
                          <Text style={styles.rowName}>{c.name}</Text>
                          {!c.isPublic && (
                            <Ionicons name="lock-closed" size={12} color={Colors.inkSoft} style={{ marginLeft: 4 }} />
                          )}
                        </View>
                        <Text style={styles.rowSub}>{c.subtitle}</Text>
                      </View>
                      {activeCommunity?.id === c.id && (
                        <Ionicons name="checkmark-circle" size={20} color={Colors.ink} />
                      )}
                    </TouchableOpacity>
                    {joinedCommunities.length > 1 && (
                      <TouchableOpacity
                        style={styles.leaveBtn}
                        onPress={() => leaveCommunity(c.id)}
                      >
                        <Ionicons name="remove-circle-outline" size={20} color={Colors.inkMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Pending join requests */}
                {pendingCommunities.map(c => (
                  <View key={c.id} style={styles.row}>
                    <View style={[styles.rowMain, styles.rowPending]}>
                      <Text style={styles.rowEmoji}>{c.emoji}</Text>
                      <View style={styles.rowText}>
                        <Text style={styles.rowName}>{c.name}</Text>
                        <Text style={styles.rowSub}>{c.subtitle}</Text>
                      </View>
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>{t('switcher.pending')}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {joinedCommunities.length === 0 && pendingCommunities.length === 0 && (
                  <Text style={styles.empty}>{t('switcher.noMine')}</Text>
                )}

                {/* Join with code */}
                <View style={styles.codeSection}>
                  <Text style={styles.codeSectionTitle}>{t('switcher.joinWithCode')}</Text>
                  <View style={styles.codeRow}>
                    <TextInput
                      style={styles.codeInput}
                      placeholder={t('switcher.codePlaceholder')}
                      placeholderTextColor={Colors.inkMuted}
                      value={codeInput}
                      onChangeText={v => { setCodeInput(v); setCodeMsg(''); }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.codeBtn} onPress={handleJoinWithCode} activeOpacity={0.8}>
                      <Text style={styles.codeBtnText}>{t('switcher.codeSubmit')}</Text>
                    </TouchableOpacity>
                  </View>
                  {codeMsg ? <Text style={styles.codeMsg}>{codeMsg}</Text> : null}
                </View>

                {/* Create community */}
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => { setOpen(false); setCreateOpen(true); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={18} color={Colors.ink} />
                  <Text style={styles.createBtnText}>{t('switcher.create')}</Text>
                </TouchableOpacity>
              </>
            )}

            {tab === 'find' && (
              <>
                {available.map(c => (
                  <View key={c.id} style={styles.row}>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowEmoji}>{c.emoji}</Text>
                      <View style={styles.rowText}>
                        <Text style={styles.rowName}>{c.name}</Text>
                        <Text style={styles.rowSub}>{c.subtitle}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() => { requestToJoin(c.id); setTab('mine'); }}
                    >
                      <Text style={styles.joinBtnText}>{t('switcher.requestJoin')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {available.length === 0 && (
                  <Text style={styles.empty}>
                    {search || filter !== 'all'
                      ? t('switcher.noMatch')
                      : t('switcher.allJoined')}
                  </Text>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <CreateCommunityModal visible={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 6,
    marginBottom: Spacing.lg,
  },
  pillEmoji: { fontSize: 16 },
  pillName: { ...Typography.label, flex: 1, fontSize: 14 },
  sheet: { flex: 1, backgroundColor: Colors.background },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sheetTitle: { ...Typography.h3 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tabBtn: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  tabActive: { backgroundColor: Colors.ink },
  tabLabel: { ...Typography.label, fontSize: 13, color: Colors.inkSoft },
  tabLabelActive: { color: Colors.accentFg },
  findControls: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
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
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  filterChipLabel: { ...Typography.caption, fontWeight: '500', color: Colors.inkSoft },
  filterChipLabelActive: { color: Colors.accentFg },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowActive: { borderColor: Colors.ink, borderWidth: 1.5 },
  rowPending: { opacity: 0.7 },
  rowEmoji: { fontSize: 24 },
  rowText: { flex: 1 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center' },
  rowName: { ...Typography.label },
  rowSub: { ...Typography.caption, marginTop: 2 },
  leaveBtn: {
    width: 44,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.inkSoft },
  joinBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { color: Colors.accentFg, fontSize: 13, fontWeight: '600' },
  empty: { ...Typography.body, textAlign: 'center', paddingTop: Spacing.xl },
  codeSection: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  codeSectionTitle: { ...Typography.label, fontSize: 14 },
  codeRow: { flexDirection: 'row', gap: Spacing.sm },
  codeInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
    letterSpacing: 1,
  },
  codeBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  codeBtnText: { color: Colors.accentFg, fontSize: 13, fontWeight: '600' },
  codeMsg: { fontSize: 13, color: '#E53E3E' },
  createBtn: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 12,
  },
  createBtnText: { ...Typography.label, fontSize: 14 },
});
