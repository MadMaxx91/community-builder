import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radius } from '../../constants/theme';

type Props = {
  label: string;
  bg: string;
  color: string;
};

export function Badge({ label, bg, color }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
