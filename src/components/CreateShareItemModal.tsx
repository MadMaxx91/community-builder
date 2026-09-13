import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { useContent } from '../context/ContentContext';
import type { DbShareItem } from '../context/ContentContext';

const CATEGORIES = ['Tools', 'Food', 'Sports', 'Kitchen', 'Other'];

type Props = { visible: boolean; onClose: () => void; item?: DbShareItem };

export function CreateShareItemModal({ visible, onClose, item }: Props) {
  const { createShareItem, updateShareItem } = useContent();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [expiresDate, setExpiresDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategory(item.category || 'Other');
      if (item.expires_at) {
        const d = new Date(item.expires_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setExpiresDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setExpiresDate('');
      }
    } else {
      setTitle(''); setCategory('Other'); setExpiresDate('');
    }
    setError('');
  }, [item, visible]);

  function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return; }

    let expiresAt: string | null = null;
    if (expiresDate.trim()) {
      const parsed = new Date(expiresDate.trim());
      if (isNaN(parsed.getTime())) { setError('Invalid expiry date (use YYYY-MM-DD)'); return; }
      expiresAt = parsed.toISOString();
    }

    if (item) {
      updateShareItem(item.id, title, category, expiresAt);
    } else {
      createShareItem(title, category, expiresAt);
    }
    resetAndClose();
  }

  function resetAndClose() {
    setTitle(''); setCategory('Other'); setExpiresDate(''); setError('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{item ? 'Edit Share Item' : 'Share an Item'}</Text>
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Item name *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Power drill, Stand mixer…"
            placeholderTextColor={Colors.inkMuted}
            value={title}
            onChangeText={v => { setTitle(v); setError(''); }}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catChip, category === c && styles.catChipActive]}
                onPress={() => setCategory(c)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catLabel, category === c && styles.catLabelActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Available until (YYYY-MM-DD, optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="2025-09-01"
            placeholderTextColor={Colors.inkMuted}
            value={expiresDate}
            onChangeText={v => { setExpiresDate(v); setError(''); }}
            keyboardType="numbers-and-punctuation"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{item ? 'Save Changes' : 'Share Item'}</Text>
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
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  catLabel: { fontSize: 13, fontWeight: '500', color: Colors.inkSoft },
  catLabelActive: { color: Colors.accentFg },
  submitBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: Colors.accentFg, fontSize: 15, fontWeight: '700' },
});
