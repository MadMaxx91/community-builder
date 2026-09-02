import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useContent } from '../context/ContentContext';

const EMOJIS = ['👍', '❤️', '😄', '😮'];

type Props = { itemId: string };

export function ReactionBar({ itemId }: Props) {
  const { getReactions, getUserReaction, toggleReaction } = useContent();
  const [pickerOpen, setPickerOpen] = useState(false);

  const reactions = getReactions(itemId);
  const userReaction = getUserReaction(itemId);
  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <View style={styles.wrap}>
      {/* Existing reaction counts */}
      {hasReactions && (
        <View style={styles.counts}>
          {Object.entries(reactions).map(([emoji, count]) => (
            count > 0 && (
              <TouchableOpacity
                key={emoji}
                style={[styles.chip, userReaction === emoji && styles.chipActive]}
                onPress={() => toggleReaction(itemId, emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text style={[styles.chipCount, userReaction === emoji && styles.chipCountActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            )
          ))}
        </View>
      )}

      {/* React button + picker */}
      <View>
        <TouchableOpacity
          style={styles.reactBtn}
          onPress={() => setPickerOpen(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.reactBtnText}>＋</Text>
        </TouchableOpacity>

        {pickerOpen && (
          <View style={styles.picker}>
            {EMOJIS.map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.pickerItem, userReaction === e && styles.pickerItemActive]}
                onPress={() => { toggleReaction(itemId, e); setPickerOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerEmoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.ink + '14', borderColor: Colors.ink },
  chipEmoji: { fontSize: 14 },
  chipCount: { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
  chipCountActive: { color: Colors.ink },
  reactBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactBtnText: { fontSize: 14, color: Colors.inkSoft, lineHeight: 18 },
  picker: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 6,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  pickerItem: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemActive: { backgroundColor: Colors.surfaceAlt },
  pickerEmoji: { fontSize: 20 },
});
