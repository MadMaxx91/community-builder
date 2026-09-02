import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lang } from '../i18n/translations';

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hu', label: 'Magyar' },
];

export function ProfileScreen() {
  const { user, updateProfile, logout, profileVisible, setProfileVisible } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name ?? '');
  const [floor, setFloor] = useState(user?.floor ?? '');
  const [building, setBuilding] = useState(user?.building ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    const changed =
      name !== (user?.name ?? '') ||
      floor !== (user?.floor ?? '') ||
      building !== (user?.building ?? '') ||
      bio !== (user?.bio ?? '');
    setDirty(changed);
    setSaved(false);
  }, [name, floor, building, bio]);

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      updateProfile({ name: name.trim(), floor: floor.trim(), building: building.trim(), bio: bio.trim() });
      setSaving(false);
      setSaved(true);
      setDirty(false);
    }, 600);
  }

  function handleLogout() {
    setProfileVisible(false);
    logout();
  }

  if (!user) return null;

  const initials = name.trim()
    ? name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user.initials;

  return (
    <Modal
      visible={profileVisible}
      animationType="slide"
      onRequestClose={() => setProfileVisible(false)}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setProfileVisible(false)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <Avatar initials={initials} size={72} />
            <Text style={styles.avatarName}>{name || t('profile.namePlaceholder')}</Text>
            <Text style={styles.avatarSub}>{user.email}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
            <Text style={styles.fieldLabel}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              autoCorrect={false}
            />
            <Text style={styles.fieldLabel}>{t('profile.bio')}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={bio}
              onChangeText={setBio}
              placeholder={t('profile.bioPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profile.buildingInfo')}</Text>
            <Text style={styles.fieldLabel}>{t('profile.floor')}</Text>
            <TextInput
              style={styles.input}
              value={floor}
              onChangeText={setFloor}
              placeholder={t('profile.floorPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              autoCorrect={false}
            />
            <Text style={styles.fieldLabel}>{t('profile.building')}</Text>
            <TextInput
              style={styles.input}
              value={building}
              onChangeText={setBuilding}
              placeholder={t('profile.buildingPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              autoCorrect={false}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
            <TouchableOpacity
              style={styles.langDropdown}
              onPress={() => { setLangSearch(''); setLangPickerOpen(v => !v); }}
              activeOpacity={0.75}
            >
              <Text style={styles.langDropdownText}>
                {LANGS.find(l => l.value === language)?.label ?? language}
              </Text>
              <Ionicons name={langPickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.inkSoft} />
            </TouchableOpacity>
            {langPickerOpen && (
              <View style={styles.langSheet}>
                <View style={styles.langSearchRow}>
                  <Ionicons name="search-outline" size={16} color={Colors.inkMuted} />
                  <TextInput
                    style={styles.langSearchInput}
                    value={langSearch}
                    onChangeText={setLangSearch}
                    placeholder={t('profile.langSearch')}
                    placeholderTextColor={Colors.inkMuted}
                    autoFocus
                  />
                </View>
                {LANGS.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase())).length === 0 ? (
                  <Text style={styles.langEmpty}>{t('profile.langEmpty')}</Text>
                ) : (
                  LANGS.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase())).map(l => (
                    <TouchableOpacity
                      key={l.value}
                      style={styles.langOption}
                      onPress={() => { setLanguage(l.value); setLangPickerOpen(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.langOptionText, language === l.value && styles.langOptionActive]}>
                        {l.label}
                      </Text>
                      {language === l.value && <Ionicons name="checkmark" size={16} color={Colors.ink} />}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          <View style={styles.saveRow}>
            {saving ? (
              <ActivityIndicator color={Colors.ink} />
            ) : saved && !dirty ? (
              <View style={styles.savedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.tag.share.text} />
                <Text style={styles.savedText}>{t('profile.saved')}</Text>
              </View>
            ) : (
              <Button
                label={t('profile.saveChanges')}
                onPress={handleSave}
                fullWidth
                variant={dirty ? 'primary' : 'ghost'}
              />
            )}
          </View>

          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={Colors.tag.alert.text} />
              <Text style={styles.logoutText}>{t('profile.logOut')}</Text>
            </TouchableOpacity>
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.h3 },
  content: { padding: Spacing.md, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarName: { ...Typography.h2, marginTop: Spacing.md, marginBottom: 4 },
  avatarSub: { ...Typography.body },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.md },
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
    marginBottom: Spacing.md,
  },
  multiline: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  langDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  langDropdownText: { fontSize: 14, fontWeight: '500', color: Colors.ink },
  langSheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
  langSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
  },
  langSearchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  langEmpty: { ...Typography.caption, textAlign: 'center', paddingVertical: Spacing.md },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  langOptionText: { fontSize: 15, color: Colors.inkSoft },
  langOptionActive: { color: Colors.ink, fontWeight: '600' },
  saveRow: { marginBottom: Spacing.lg },
  savedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  savedText: { color: Colors.tag.share.text, fontSize: 14, fontWeight: '600' },
  logoutSection: { marginTop: Spacing.sm },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.tag.alert.bg,
    borderRadius: Radius.md,
  },
  logoutText: { color: Colors.tag.alert.text, fontSize: 14, fontWeight: '600' },
});
