import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

type Variant = 'primary' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', fullWidth = false, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.base, styles[variant], fullWidth && styles.full, style]}
    >
      <Text style={[styles.label, variant === 'primary' ? styles.labelPrimary : styles.labelAlt]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.ink,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  ghost: {
    backgroundColor: Colors.surfaceAlt,
  },
  full: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelPrimary: {
    color: Colors.accentFg,
  },
  labelAlt: {
    color: Colors.ink,
  },
});
