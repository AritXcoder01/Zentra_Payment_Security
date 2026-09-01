import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { colors, typography } from '../theme';

interface SecurityStatusCardProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

export const SecurityStatusCard: React.FC<SecurityStatusCardProps> = ({
  title = 'Your Zentra security checks are active',
  subtitle = 'No immediate security concerns detected on your device.',
  badgeText = 'MONITORING ACTIVE',
}) => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.shieldIconWrapper}>
          <Icon name="safety" size={22} color={colors.secondary.main} />
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.main,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shieldIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.success,
    marginRight: 6,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.status.success,
    fontWeight: '700',
  },
  title: {
    ...typography.h3,
    color: colors.base.white,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.base.textMuted,
  },
});
