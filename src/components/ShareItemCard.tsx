import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { ShareItem } from '../data/mock';
import { Badge } from './ui/Badge';
import { useLanguage } from '../context/LanguageContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_ICONS: Record<string, IconName> = {
  Tools:   'construct-outline',
  Food:    'nutrition-outline',
  Sports:  'fitness-outline',
  Kitchen: 'restaurant-outline',
};

type Props = {
  item: ShareItem;
  onRequest?: (id: string) => void;
};

export function ShareItemCard({ item, onRequest }: Props) {
  const { t } = useLanguage();
  const icon = CATEGORY_ICONS[item.category] ?? 'cube-outline';
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={Colors.inkSoft} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title}>{t(item.titleKey)}</Text>
          <Badge
            label={item.available ? t('share.availableBadge') : t('share.borrowedBadge')}
            bg={item.available ? Colors.tag.share.bg : Colors.tag.alert.bg}
            color={item.available ? Colors.tag.share.text : Colors.tag.alert.text}
          />
        </View>
        <Text style={styles.meta}>
          {t('share.expires', { owner: item.owner, floor: item.floor, expiresIn: t(item.expiresInKey) })}
        </Text>
      </View>
      {item.available && (
        <TouchableOpacity style={styles.btn} onPress={() => onRequest?.(item.id)} activeOpacity={0.7}>
          <Text style={styles.btnText}>{t('share.ask')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 42,
    height: 42,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { ...Typography.label, flex: 1 },
  meta: { ...Typography.caption },
  btn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  btnText: { color: Colors.accentFg, fontSize: 13, fontWeight: '600' },
});
