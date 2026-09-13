import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, ScrollView, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { useContent } from '../context/ContentContext';
import type { DbMarketItem } from '../context/ContentContext';

const EMOJIS = ['🛋️', '📱', '🍳', '🔧', '🚲', '👕', '📚', '🎮', '🪴', '🏷️', '🎁', '🛠️'];

type Props = { visible: boolean; onClose: () => void; item?: DbMarketItem };

export function CreateMarketItemModal({ visible, onClose, item }: Props) {
  const { createMarketItem, updateMarketItem } = useContent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🏷️');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setEmoji(item.emoji || '🏷️');
      setIsFree(item.is_free);
      setPrice(item.price != null ? String(item.price) : '');
    } else {
      setTitle(''); setDescription(''); setEmoji('🏷️');
      setIsFree(false); setPrice('');
    }
    setError('');
  }, [item, visible]);

  function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return; }
    const parsedPrice = isFree ? null : price.trim() ? parseFloat(price) : null;
    if (!isFree && price.trim() && isNaN(parsedPrice!)) { setError('Enter a valid price'); return; }
    if (item) {
      updateMarketItem(item.id, title, description, parsedPrice, isFree, emoji);
    } else {
      createMarketItem(title, description, parsedPrice, isFree, emoji);
    }
    resetAndClose();
  }

  function resetAndClose() {
    setTitle(''); setDescription(''); setEmoji('🏷️');
    setIsFree(false); setPrice(''); setError('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{item ? 'Edit Listing' : 'New Listing'}</Text>
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What are you selling?"
            placeholderTextColor={Colors.inkMuted}
            value={title}
            onChangeText={v => { setTitle(v); setError(''); }}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Condition, details…"
            placeholderTextColor={Colors.inkMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Icon</Text>
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

          <View style={[styles.row, { marginTop: Spacing.md }]}>
            <Text style={styles.label}>Free item</Text>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              trackColor={{ false: Colors.surfaceAlt, true: Colors.ink }}
              thumbColor={Colors.accentFg}
            />
          </View>

          {!isFree && (
            <>
              <Text style={[styles.label, { marginTop: Spacing.sm }]}>Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={Colors.inkMuted}
                value={price}
                onChangeText={v => { setPrice(v); setError(''); }}
                keyboardType="decimal-pad"
              />
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{item ? 'Save Changes' : 'Post Listing'}</Text>
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
  textarea: { minHeight: 80, textAlignVertical: 'top' },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: Colors.accentFg, fontSize: 15, fontWeight: '700' },
});
