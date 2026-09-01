import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors, typography } from '../../theme';

export const HelpEmergencyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Support Guidance</Text>
        <Text style={styles.subtitle}>
          Essential educational safety steps to follow during a payment security emergency.
        </Text>
      </View>

      <GlassCard style={styles.emergencyCard}>
        <Text style={styles.cardHeader}>🚨 Emergency Response Checklist</Text>
        <Text style={styles.cardText}>
          1. Contact your bank immediately using the helpline number printed directly on the back of your payment card to block cards or freeze accounts.{'\n\n'}
          2. Update your UPI PIN, mobile banking app password, and registered email password immediately.{'\n\n'}
          3. Lodge a formal report with your national cybercrime authority portal within 24 hours of incident occurrence.
        </Text>
      </GlassCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Official Support Resources</Text>
        <GlassCard style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>🌐 Verified Official Authority Channels</Text>
          <Text style={styles.placeholderText}>
            Verified bank helplines and official government cybercrime portals will be loaded dynamically from Zentra's official resource database.
          </Text>
        </GlassCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: colors.status.dangerLight,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginVertical: 10,
  },
  cardHeader: {
    ...typography.h3,
    color: colors.status.danger,
    marginBottom: 8,
  },
  cardText: {
    ...typography.body,
    color: colors.primary.main,
    lineHeight: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 10,
  },
  placeholderCard: {
    backgroundColor: colors.base.white,
    borderColor: colors.base.border,
    padding: 16,
  },
  placeholderTitle: {
    ...typography.bodyBold,
    color: colors.primary.main,
    marginBottom: 6,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    lineHeight: 18,
  },
});
