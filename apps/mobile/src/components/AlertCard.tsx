import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors, typography } from '../theme';

interface AlertCardProps {
  title: string;
  description: string;
  severity: 'Information' | 'Warning' | 'High Priority';
  timestamp: string;
  icon?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  severity,
  timestamp,
}) => {
  const getSeverityStyle = () => {
    switch (severity) {
      case 'High Priority':
        return { bg: colors.status.dangerLight, text: colors.status.danger, border: colors.status.danger };
      case 'Warning':
        return { bg: colors.status.warningLight, text: colors.status.warning, border: colors.status.warning };
      default:
        return { bg: colors.status.infoLight, text: colors.status.info, border: colors.status.info };
    }
  };

  const sevStyle = getSeverityStyle();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Icon name="alerts" size={18} color={sevStyle.text} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: sevStyle.bg }]}>
          <Text style={[styles.badgeText, { color: sevStyle.text }]}>{severity}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.base.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    ...typography.bodyBold,
    color: colors.primary.main,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.base.textSecondary,
    marginBottom: 8,
  },
  timestamp: {
    ...typography.caption,
    color: colors.base.textMuted,
  },
});
