import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useContent, AppNotification } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';

type Props = { visible: boolean; onClose: () => void };

export function NotificationCenter({ visible, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useContent();
  const { t } = useLanguage();

  function handleTap(n: AppNotification) {
    markRead(n.id);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('notifications.title')}</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} style={styles.markBtn}>
              <Text style={styles.markBtnText}>{t('notifications.markAllRead')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.markBtn} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {notifications.length === 0 && (
            <Text style={styles.empty}>{t('notifications.empty')}</Text>
          )}
          {notifications.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[styles.row, !n.read && styles.rowUnread]}
              onPress={() => handleTap(n)}
              activeOpacity={0.75}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{n.emoji}</Text>
              </View>
              <View style={styles.body}>
                <Text style={[styles.notifTitle, !n.read && styles.notifTitleUnread]}>
                  {n.title}
                </Text>
                <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>
              {!n.read && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.h3, flex: 1, textAlign: 'center' },
  markBtn: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  markBtnText: { fontSize: 12, fontWeight: '600', color: Colors.ink },
  list: { padding: Spacing.md, gap: Spacing.sm },
  empty: { ...Typography.body, textAlign: 'center', paddingTop: 60, color: Colors.inkSoft },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  rowUnread: { borderColor: Colors.ink + '30', backgroundColor: Colors.ink + '06' },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 20 },
  body: { flex: 1, gap: 2 },
  notifTitle: { ...Typography.label, fontSize: 14 },
  notifTitleUnread: { color: Colors.ink },
  notifBody: { ...Typography.body, lineHeight: 18, fontSize: 13 },
  time: { ...Typography.caption, marginTop: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ink,
    marginTop: 4,
    flexShrink: 0,
  },
});
