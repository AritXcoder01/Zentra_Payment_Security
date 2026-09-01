import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, typography } from '../theme';

interface EmptyStateProps {
  icon?: string | IconName;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'history',
  title,
  description,
}) => {
  const getIconName = (rawIcon: string): IconName => {
    if (rawIcon === '💳') return 'card';
    if (rawIcon === '🔔' || rawIcon === '📭') return 'alerts';
    if (rawIcon === '📜' || rawIcon === '🕒') return 'history';
    if (rawIcon === '🛡') return 'safety';
    return (rawIcon as IconName) || 'history';
  };

  const iconName = getIconName(icon);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={iconName} size={32} color={colors.secondary.main} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginVertical: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h3,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    ...typography.body,
    color: colors.base.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
