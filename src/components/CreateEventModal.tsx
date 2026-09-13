import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { useContent } from '../context/ContentContext';
import type { DbEvent } from '../context/ContentContext';

type Props = { visible: boolean; onClose: () => void; item?: DbEvent };

export function CreateEventModal({ visible, onClose, item }: Props) {
  const { createEvent, updateEvent } = useContent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setLocation(item.location ?? '');
      const d = new Date(item.starts_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${min}`);
    } else {
      setTitle(''); setDescription(''); setLocation('');
      setDate(''); setTime('');
    }
    setError('');
  }, [item, visible]);

  function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!date.trim()) { setError('Date is required (YYYY-MM-DD)'); return; }

    const startsAt = time.trim()
      ? `${date.trim()}T${time.trim()}:00`
      : `${date.trim()}T00:00:00`;

    const parsed = new Date(startsAt);
    if (isNaN(parsed.getTime())) { setError('Invalid date/time'); return; }

    if (item) {
      updateEvent(item.id, title, description, location, parsed.toISOString());
    } else {
      createEvent(title, description, location, parsed.toISOString());
    }
    resetAndClose();
  }

  function resetAndClose() {
    setTitle(''); setDescription(''); setLocation('');
    setDate(''); setTime(''); setError('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{item ? 'Edit Event' : 'New Event'}</Text>
          <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Rooftop BBQ"
            placeholderTextColor={Colors.inkMuted}
            value={title}
            onChangeText={v => { setTitle(v); setError(''); }}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="What's happening?"
            placeholderTextColor={Colors.inkMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Rooftop, Lobby…"
            placeholderTextColor={Colors.inkMuted}
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={[styles.label, { marginTop: Spacing.md }]}>Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2025-08-15"
                placeholderTextColor={Colors.inkMuted}
                value={date}
                onChangeText={v => { setDate(v); setError(''); }}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.label, { marginTop: Spacing.md }]}>Time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                placeholder="18:30"
                placeholderTextColor={Colors.inkMuted}
                value={time}
                onChangeText={setTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{item ? 'Save Changes' : 'Create Event'}</Text>
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
  row: { flexDirection: 'row', gap: Spacing.sm },
  flex: { flex: 1 },
  submitBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: Colors.accentFg, fontSize: 15, fontWeight: '700' },
});
