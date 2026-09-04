import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Avatar } from '../components/ui/Avatar';
import { CommunitySwitcher } from '../components/CommunitySwitcher';
import { FeedCard } from '../components/FeedCard';
import { NotificationCenter } from '../components/NotificationCenter';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';

type Props = { navigation: any };

export function HomeScreen({ navigation }: Props) {
  const { user, setProfileVisible } = useAuth();
  const { t } = useLanguage();
  const { feedItems, unreadCount } = useContent();
  const [notifVisible, setNotifVisible] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <View style={styles.screenBg}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting', { name: firstName })}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('ShareModal')} activeOpacity={0.7} style={styles.iconBtn}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNotifVisible(true)} activeOpacity={0.7} style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.ink} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setProfileVisible(true)} activeOpacity={0.7}>
              <Avatar initials={user?.initials ?? '?'} size={40} />
            </TouchableOpacity>
          </View>
        </View>

        <CommunitySwitcher />

        <Text style={styles.sectionTitle}>{t('feed.title')}</Text>
        {feedItems.map(item => <FeedCard key={item.id} item={item} />)}

      </ScrollView>

      <NotificationCenter visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { ...Typography.h1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  bellBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm, marginTop: Spacing.sm },
});
