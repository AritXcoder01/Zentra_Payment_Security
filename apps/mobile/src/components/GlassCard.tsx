import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { glassmorphism } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    ...glassmorphism.card,
    padding: 16,
    marginVertical: 8,
  },
});
