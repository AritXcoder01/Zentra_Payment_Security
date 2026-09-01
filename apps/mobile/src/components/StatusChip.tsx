import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface StatusChipProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

export const StatusChip: React.FC<StatusChipProps> = ({ label, type = 'info' }) => {
  const getStyle = () => {
    switch (type) {
      case 'success':
        return { bg: colors.status.successLight, text: colors.status.success };
      case 'warning':
        return { bg: colors.status.warningLight, text: colors.status.warning };
      case 'danger':
        return { bg: colors.status.dangerLight, text: colors.status.danger };
      default:
        return { bg: colors.status.infoLight, text: colors.status.info };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.chip, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
});
