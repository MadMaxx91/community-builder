import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { CommunityType } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const EMOJIS = ['🏠', '🏢', '🏗', '🏙', '🌳', '🍁', '🌊', '🌲', '🚶', '🍂', '🏘', '🛖'];

type TypeOption = { value: CommunityType; labelKey: 'create.typeBuilding' | 'create.typeComplex' | 'create.typeNeighborhood' | 'create.typeStreet'; icon: string };
const TYPE_OPTIONS: TypeOption[] = [
  { value: 'building',      labelKey: 'create.typeBuilding',      icon: '🏢' },
  { value: 'complex',       labelKey: 'create.typeComplex',       icon: '🏗' },
  { value: 'neighborhood',  labelKey: 'create.typeNeighborhood',  icon: '🏘' },
  { value: 'street',        labelKey: 'create.typeStreet',        icon: '🛖' },
];

type Props = { visible: boolean; onClose: () => void };

export function CreateCommunityModal({ visible, onClose }: Props) {
  const { createCommunity } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏠');
  const [type, setType] = useState<CommunityType>('building');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');

  function handleCreate() {
    if (!name.trim()) {
      setError(t('create.nameRequired'));
      return;
    }
    createCommunity({ name, emoji, type, isPublic });
    resetAndClose();
  }

  function resetAndClose() {
    setName('');
    setEmoji('🏠');
    setType('building');
    setIsPublic(true);
    setError('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('create.title')}</Text>
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Name */}
          <Text style={styles.label}>{t('create.name')}</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder={t('create.namePlaceholder')}
            placeholderTextColor={Colors.inkMuted}
            value={name}
            onChangeText={v => { setName(v); setError(''); }}
            autoCapitalize="words"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Emoji */}
          <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('create.emoji')}</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                onPress={() => setEmoji(e)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type */}
          <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('create.type')}</Text>
          <View style={styles.typeGrid}>
            {TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.typeCard, type === opt.value && styles.typeCardActive]}
                onPress={() => setType(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>{opt.icon}</Text>
                <Text style={[styles.typeLabel, type === opt.value && styles.typeLabelActive]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Visibility */}
          <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('create.visibility')}</Text>
          <View style={styles.visRow}>
            <TouchableOpacity
              style={[styles.visCard, isPublic && styles.visCardActive]}
              onPress={() => setIsPublic(true)}
              activeOpacity={0.7}
            >
              <View style={styles.visTop}>
                <Ionicons name="earth-outline" size={18} color={isPublic ? Colors.ink : Colors.inkSoft} />
                <Text style={[styles.visTitle, isPublic && styles.visTitleActive]}>{t('create.public')}</Text>
              </View>
              <Text style={styles.visDesc}>{t('create.publicDesc')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visCard, !isPublic && styles.visCardActive]}
              onPress={() => setIsPublic(false)}
              activeOpacity={0.7}
            >
              <View style={styles.visTop}>
                <Ionicons name="lock-closed-outline" size={18} color={!isPublic ? Colors.ink : Colors.inkSoft} />
                <Text style={[styles.visTitle, !isPublic && styles.visTitleActive]}>{t('create.private')}</Text>
              </View>
              <Text style={styles.visDesc}>{t('create.privateDesc')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={styles.createBtnText}>{t('create.create')}</Text>
          </TouchableOpacity>
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
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: { ...Typography.h3 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.md, paddingBottom: 40 },
  label: { ...Typography.label, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
  },
  inputError: { borderColor: '#E53E3E' },
  errorText: { color: '#E53E3E', fontSize: 13, marginTop: 4 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: { borderColor: Colors.ink, borderWidth: 2 },
  emojiText: { fontSize: 22 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  typeCardActive: { borderColor: Colors.ink, borderWidth: 1.5 },
  typeIcon: { fontSize: 24 },
  typeLabel: { ...Typography.caption, fontWeight: '500', color: Colors.inkSoft },
  typeLabelActive: { color: Colors.ink },
  visRow: { flexDirection: 'row', gap: Spacing.sm },
  visCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  visCardActive: { borderColor: Colors.ink, borderWidth: 1.5 },
  visTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visTitle: { ...Typography.label, fontSize: 14, color: Colors.inkSoft },
  visTitleActive: { color: Colors.ink },
  visDesc: { ...Typography.caption, lineHeight: 16 },
  createBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtnText: { color: Colors.accentFg, fontSize: 15, fontWeight: '700' },
});
