import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback,
  Modal, StyleSheet,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

type Props = {
  canEdit: boolean;
  onEdit?: () => void;
  onDelete: () => void;
};

export function ItemActionMenu({ canEdit, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<View>(null);

  if (!canEdit) return null;

  function handleOpen() {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      // Right-align dropdown to trigger right edge; position below trigger
      // Use window.innerWidth for web, fallback for native
      const winW = typeof window !== 'undefined' ? window.innerWidth : 400;
      setPos({ top: y + h + 4, right: winW - x - w });
      setOpen(true);
    });
  }

  return (
    <View ref={triggerRef} collapsable={false}>
      <TouchableOpacity onPress={handleOpen} style={styles.trigger} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.triggerText}>•••</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.menu, { top: pos.top, right: pos.right }]}>
                {onEdit && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { setOpen(false); onEdit(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setOpen(false); onDelete(); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  triggerText: { fontSize: 14, fontWeight: '700', color: Colors.inkSoft, letterSpacing: 1 },
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 130,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  editText: { ...Typography.label, color: Colors.ink },
  deleteText: { ...Typography.label, color: Colors.tag.alert.text },
});
