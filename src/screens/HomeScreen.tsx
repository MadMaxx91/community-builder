import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { marketItems, helpRequests, polls } from '../data/mock';
import { Avatar } from '../components/ui/Avatar';
import { QuickActionCard } from '../components/QuickActionCard';
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

  const openRequests = helpRequests.filter(r => !r.resolved).length;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting', { name: firstName })}</Text>
          </View>
          <View style={styles.headerActions}>
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

        <Text style={styles.sectionTitle}>{t('home.shortcuts')}</Text>
        <View style={styles.gridRow}>
          <QuickActionCard icon="hand-left-outline" label={t('home.helpRequests')} count={openRequests} bg="#FFF0E6" onPress={() => navigation.navigate('Community', { tab: 'help' })} />
          <QuickActionCard icon="bar-chart-outline" label={t('home.activePolls')} count={polls.length} bg="#EEF2FF" onPress={() => navigation.navigate('Community', { tab: 'polls' })} />
        </View>
        <View style={[styles.gridRow, { marginTop: Spacing.sm }]}>
          <QuickActionCard icon="storefront-outline" label={t('home.marketplace')} count={marketItems.length} bg="#F5F0E8" onPress={() => navigation.navigate('Community', { tab: 'market' })} />
          <QuickActionCard icon="document-text-outline" label={t('home.buildingWiki')} bg="#E8F4EC" onPress={() => navigation.navigate('Community', { tab: 'wiki' })} />
        </View>

        <Text style={styles.sectionTitle}>{t('feed.title')}</Text>
        {feedItems.map(item => <FeedCard key={item.id} item={item} />)}

      </ScrollView>

      <NotificationCenter visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { ...Typography.h1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bellBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
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
  gridRow: { flexDirection: 'row', gap: Spacing.sm },
});
