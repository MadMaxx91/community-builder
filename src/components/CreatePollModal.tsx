import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const DURATIONS = [1, 3, 7] as const;

type Props = { visible: boolean; onClose: () => void };

export function CreatePollModal({ visible, onClose }: Props) {
  const { createPoll } = useContent();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState<1 | 3 | 7>(3);
  const [error, setError] = useState('');

  function setOption(idx: number, val: string) {
    setOptions(prev => prev.map((o, i) => i === idx ? val : o));
  }

  function addOption() {
    if (options.length < 5) setOptions(prev => [...prev, '']);
  }

  function removeOption(idx: number) {
    if (options.length > 2) setOptions(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit() {
    if (!question.trim()) { setError(t('poll.questionRequired')); return; }
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) { setError(t('poll.optionsRequired')); return; }
    createPoll(question.trim(), filled, duration, user?.name ?? 'You');
    resetAndClose();
  }

  function resetAndClose() {
    setQuestion('');
    setOptions(['', '']);
    setDuration(3);
    setError('');
    onClose();
  }

  const durationLabel = (d: number) =>
    d === 1 ? t('poll.duration1d') : d === 3 ? t('poll.duration3d') : t('poll.duration7d');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('poll.createTitle')}</Text>
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>{t('poll.question')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('poll.questionPlaceholder')}
            placeholderTextColor={Colors.inkMuted}
            value={question}
            onChangeText={v => { setQuestion(v); setError(''); }}
            multiline
            numberOfLines={2}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('poll.options')}</Text>
          {options.map((opt, i) => (
            <View key={i} style={styles.optionRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder={t('poll.optionPlaceholder', { n: i + 1 })}
                placeholderTextColor={Colors.inkMuted}
                value={opt}
                onChangeText={v => { setOption(i, v); setError(''); }}
              />
              {options.length > 2 && (
                <TouchableOpacity onPress={() => removeOption(i)} style={styles.removeBtn}>
                  <Ionicons name="close-circle-outline" size={20} color={Colors.inkMuted} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {options.length < 5 && (
            <TouchableOpacity style={styles.addBtn} onPress={addOption} activeOpacity={0.7}>
              <Text style={styles.addBtnText}>{t('poll.addOption')}</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('poll.duration')}</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipActive]}
                onPress={() => setDuration(d)}
                activeOpacity={0.7}
              >
                <Text style={[styles.durationLabel, duration === d && styles.durationLabelActive]}>
                  {durationLabel(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{t('poll.submit')}</Text>
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
  errorBox: {
    backgroundColor: Colors.tag.alert.bg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.tag.alert.text, fontSize: 13 },
  label: { ...Typography.label, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  removeBtn: { padding: 4 },
  addBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.sm,
  },
  addBtnText: { fontSize: 13, fontWeight: '500', color: Colors.inkSoft },
  durationRow: { flexDirection: 'row', gap: Spacing.sm },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  durationChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  durationLabel: { fontSize: 13, fontWeight: '500', color: Colors.inkSoft },
  durationLabelActive: { color: Colors.accentFg },
  submitBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: Colors.accentFg, fontSize: 15, fontWeight: '700' },
});
