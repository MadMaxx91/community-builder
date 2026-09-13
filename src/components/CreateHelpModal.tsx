import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { useContent } from '../context/ContentContext';
import type { DbHelpRequest } from '../context/ContentContext';

type Props = { visible: boolean; onClose: () => void; item?: DbHelpRequest };

export function CreateHelpModal({ visible, onClose, item }: Props) {
  const { createHelpRequest, updateHelpRequest } = useContent();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [floor, setFloor] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setBody(item.body);
      setFloor(item.floor ?? '');
    } else {
      setTitle(''); setBody(''); setFloor('');
    }
    setError('');
  }, [item, visible]);

  function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!body.trim()) { setError('Description is required'); return; }
    if (item) {
      updateHelpRequest(item.id, title, body, floor);
    } else {
      createHelpRequest(title, body, floor);
    }
    resetAndClose();
  }

  function resetAndClose() {
    setTitle(''); setBody(''); setFloor(''); setError('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{item ? 'Edit Help Request' : 'New Help Request'}</Text>
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Looking for a drill"
            placeholderTextColor={Colors.inkMuted}
            value={title}
            onChangeText={v => { setTitle(v); setError(''); }}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe what you need…"
            placeholderTextColor={Colors.inkMuted}
            value={body}
            onChangeText={v => { setBody(v); setError(''); }}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Floor / Unit</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Floor 3, Unit 12A"
            placeholderTextColor={Colors.inkMuted}
            value={floor}
            onChangeText={setFloor}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{item ? 'Save Changes' : 'Post Help Request'}</Text>
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
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  submitBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: Colors.accentFg, fontSize: 15, fontWeight: '700' },
});
