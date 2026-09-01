import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SecurityStatusCard } from '../../components/SecurityStatusCard';
import { QuickAction } from '../../components/QuickAction';
import { GlassCard } from '../../components/GlassCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userName, setUserName] = useState<string>('User');
  const [refreshing, setRefreshing] = useState(false);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadUserData = async () => {
    const res = await apiClient.getProfile();
    if (res.success && res.data?.fullName) {
      const firstName = res.data.fullName.split(' ')[0];
      setUserName(firstName);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.greeting}>{getTimeOfDayGreeting()},</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Security Overview Card */}
      <SecurityStatusCard
        title="Your Zentra security checks are active"
        subtitle="No immediate security alerts detected on your account."
      />

      {/* Payment Summary Header */}
      <GlassCard style={styles.paymentSummaryCard}>
        <Text style={styles.sectionTitle}>Monthly Activity Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Money In</Text>
            <Text style={[styles.summaryValue, styles.greenText]}>₹0.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Money Out</Text>
            <Text style={styles.summaryValue}>₹0.00</Text>
          </View>
        </View>
        <Text style={styles.summarySubtext}>
          Transaction history will appear once eligible payment SMS detection is active.
        </Text>
      </GlassCard>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Report Fraud"
            subtitle="Get Guided Support"
            icon="🚨"
            onPress={() => navigation.navigate('FraudStack', { screen: 'FraudLanding' })}
            highlight={true}
          />
          <QuickAction
            title="Check Activity"
            subtitle="View Transactions"
            icon="📊"
            onPress={() => navigation.navigate('ActivityTab')}
          />
        </View>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Safety Guide"
            subtitle="Fraud Awareness"
            icon="📖"
            onPress={() => navigation.navigate('SafetyTab')}
          />
          <QuickAction
            title="Emergency Help"
            subtitle="Incident Checklist"
            icon="🆘"
            onPress={() => navigation.navigate('HelpEmergency')}
          />
        </View>
      </View>

      {/* Recent Transactions List */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ActivityTab')}>
            <Text style={styles.seeAllText}>See All ›</Text>
          </TouchableOpacity>
        </View>

        <EmptyState
          icon="💳"
          title="No Recent Transactions"
          description="Your transaction stream will display detected payments and manual records."
        />
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    ...typography.caption,
    color: colors.base.textSecondary,
  },
  userName: {
    ...typography.h1,
    color: colors.primary.main,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    ...typography.h3,
    color: colors.base.white,
  },
  paymentSummaryCard: {
    marginVertical: 14,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  summaryBox: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.primary.main,
  },
  greenText: {
    color: colors.status.success,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.base.divider,
  },
  summarySubtext: {
    ...typography.caption,
    fontSize: 11,
    color: colors.base.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  quickActionsSection: {
    marginVertical: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  recentSection: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seeAllText: {
    ...typography.bodyBold,
    color: colors.secondary.main,
    fontSize: 13,
  },
});
