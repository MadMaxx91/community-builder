import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Switch, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { CommunityFeatures, CommunityMember } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { Avatar } from '../components/ui/Avatar';

type FeatureDef = { key: keyof CommunityFeatures; labelKey: TranslationKey };

const FEATURE_DEFS: FeatureDef[] = [
  { key: 'announcements', labelKey: 'admin.featureAnnouncements' },
  { key: 'polls',         labelKey: 'admin.featurePolls' },
  { key: 'events',        labelKey: 'admin.featureEvents' },
  { key: 'share',         labelKey: 'admin.featureShare' },
  { key: 'market',        labelKey: 'admin.featureMarket' },
  { key: 'help',          labelKey: 'admin.featureHelp' },
  { key: 'wiki',          labelKey: 'admin.featureWiki' },
];

export function CommunityAdminScreen() {
  const { activeCommunity, adminVisible, setAdminVisible, updateActiveCommunity, user, approveMember, denyMember } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [features, setFeatures] = useState<CommunityFeatures | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (activeCommunity) {
      setName(activeCommunity.name);
      setFeatures({ ...activeCommunity.features });
      setMembers([...activeCommunity.members]);
      setSaved(false);
    }
  }, [activeCommunity, adminVisible]);

  if (!activeCommunity || !features) return null;

  function toggleFeature(key: keyof CommunityFeatures) {
    setFeatures(prev => prev ? { ...prev, [key]: !prev[key] } : prev);
    setSaved(false);
  }

  function toggleAdmin(memberId: string) {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m));
    setMemberMenuId(null);
    setSaved(false);
  }

  function removeMember(memberId: string) {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    setMemberMenuId(null);
    setSaved(false);
  }

  function handleSave() {
    if (!name.trim() || !features) return;
    setSaving(true);
    setTimeout(() => {
      updateActiveCommunity({ name: name.trim(), features, members });
      setSaving(false);
      setSaved(true);
    }, 500);
  }

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setInviteEmail('');
    setTimeout(() => setInviteSent(false), 3000);
  }

  return (
    <Modal visible={adminVisible} animationType="slide" onRequestClose={() => setAdminVisible(false)}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setAdminVisible(false)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('admin.title')}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={Colors.ink} />
            ) : saved ? (
              <Ionicons name="checkmark-circle" size={20} color={Colors.tag.share.text} />
            ) : (
              <Text style={styles.saveBtnText}>{t('admin.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('admin.details')}</Text>
            <Text style={styles.fieldLabel}>{t('admin.communityName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={v => { setName(v); setSaved(false); }}
              placeholder={t('admin.namePlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              autoCorrect={false}
            />
          </View>

          {/* Features */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('admin.features')}</Text>
            <Text style={styles.subtitle}>{t('admin.featuresSubtitle')}</Text>
            {FEATURE_DEFS.map((fd, i) => (
              <View key={fd.key} style={[styles.featureRow, i < FEATURE_DEFS.length - 1 && styles.featureBorder]}>
                <Text style={styles.featureLabel}>{t(fd.labelKey)}</Text>
                <Switch
                  value={features[fd.key]}
                  onValueChange={() => toggleFeature(fd.key)}
                  trackColor={{ false: Colors.surfaceAlt, true: Colors.ink }}
                  thumbColor={Colors.accentFg}
                />
              </View>
            ))}
          </View>

          {/* Join Code */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('admin.joinCode')}</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{activeCommunity.joinCode}</Text>
              <View style={styles.visibilityBadge}>
                <Ionicons
                  name={activeCommunity.isPublic ? 'earth-outline' : 'lock-closed-outline'}
                  size={14}
                  color={Colors.inkSoft}
                />
                <Text style={styles.visibilityText}>
                  {activeCommunity.isPublic ? t('admin.publicLabel') : t('admin.privateLabel')}
                </Text>
              </View>
            </View>
          </View>

          {/* Pending Requests */}
          {activeCommunity.pendingRequestIds.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('admin.pendingRequests')}</Text>
              {activeCommunity.pendingRequestIds.map(uid => (
                <View key={uid} style={styles.pendingRow}>
                  <Avatar initials={uid.slice(-2).toUpperCase()} size={36} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>User {uid.slice(-4)}</Text>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => approveMember(uid)}
                    >
                      <Text style={styles.approveBtnText}>{t('admin.approve')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.denyBtn}
                      onPress={() => denyMember(uid)}
                    >
                      <Text style={styles.denyBtnText}>{t('admin.deny')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Members */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('admin.members')}</Text>
            {members.map(m => (
              <View key={m.id} style={styles.memberRow}>
                <Avatar initials={m.initials} size={36} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}{m.id === user?.id ? ' (you)' : ''}</Text>
                  <Text style={styles.memberFloor}>{m.floor}</Text>
                </View>
                <View style={styles.memberRight}>
                  {m.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>{t('admin.roleAdmin')}</Text>
                    </View>
                  )}
                  {m.id !== user?.id && (
                    <View>
                      <TouchableOpacity onPress={() => setMemberMenuId(memberMenuId === m.id ? null : m.id)} style={styles.menuBtn}>
                        <Ionicons name="ellipsis-horizontal" size={16} color={Colors.inkSoft} />
                      </TouchableOpacity>
                      {memberMenuId === m.id && (
                        <View style={styles.menu}>
                          <TouchableOpacity style={styles.menuItem} onPress={() => toggleAdmin(m.id)}>
                            <Text style={styles.menuItemText}>{m.isAdmin ? t('admin.removeAdmin') : t('admin.makeAdmin')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.menuItem} onPress={() => removeMember(m.id)}>
                            <Text style={[styles.menuItemText, styles.menuItemDanger]}>{t('admin.removeMember')}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.inviteRow}>
              <TextInput
                style={styles.inviteInput}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder={t('admin.invitePlaceholder')}
                placeholderTextColor={Colors.inkMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.inviteBtn, inviteSent && styles.inviteBtnSent]}
                onPress={handleInvite}
                activeOpacity={0.75}
              >
                <Text style={styles.inviteBtnText}>
                  {inviteSent ? t('admin.inviteSent') : t('admin.inviteSend')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 44, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { ...Typography.h3 },
  saveBtn: { width: 60, alignItems: 'flex-end', justifyContent: 'center', height: 36 },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.ink },
  content: { padding: Spacing.md, paddingBottom: 48 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  subtitle: { ...Typography.caption, marginBottom: Spacing.md },
  fieldLabel: { ...Typography.label, marginBottom: 6 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.ink,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  featureBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  featureLabel: { fontSize: 14, color: Colors.ink, fontWeight: '500' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  memberInfo: { flex: 1 },
  memberName: { ...Typography.label },
  memberFloor: { ...Typography.caption },
  memberRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.inkSoft },
  menuBtn: { padding: 6 },
  menu: {
    position: 'absolute',
    right: 0,
    top: 28,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    zIndex: 10,
    minWidth: 150,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: Spacing.md },
  menuItemText: { fontSize: 14, color: Colors.ink },
  menuItemDanger: { color: Colors.tag.alert.text },
  inviteRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  inviteInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
  },
  inviteBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  inviteBtnSent: { backgroundColor: Colors.tag.share.text },
  inviteBtnText: { color: Colors.accentFg, fontSize: 13, fontWeight: '600' },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  visibilityText: { fontSize: 12, fontWeight: '500', color: Colors.inkSoft },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  pendingActions: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  approveBtnText: { color: Colors.accentFg, fontSize: 12, fontWeight: '600' },
  denyBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  denyBtnText: { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
});
