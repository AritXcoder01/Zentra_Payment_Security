import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { SecurityStatusCard } from '../../components/SecurityStatusCard';
import { TransactionCard } from '../../components/TransactionCard';
import { AlertCard } from '../../components/AlertCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';
import { transactionApi } from '../../api/transaction.api';
import { alertsApi } from '../../api/alerts.api';
import { UserProfile, Transaction, TransactionSummary, SecurityAlert } from '../../types/domain.types';
import { formatINR, formatDateDisplay } from '../../utils/formatters';
import { config } from '../../config/config';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<TransactionSummary>({ moneyIn: 0, moneyOut: 0, transactionCount: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingDemoTx, setAddingDemoTx] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, summaryRes, txsRes, alertsRes] = await Promise.all([
        apiClient.getProfile(),
        transactionApi.getSummary(),
        transactionApi.getTransactions({ page: 1, limit: 5 }),
        alertsApi.getAlerts(),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (txsRes.success && txsRes.data?.items) {
        setRecentTransactions(txsRes.data.items);
      }
      if (alertsRes.success && Array.isArray(alertsRes.data)) {
        setAlerts(alertsRes.data);
      }
    } catch {
      // Handle fetch error gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddDemoTransaction = async () => {
    if (addingDemoTx) return;
    setAddingDemoTx(true);
    const demoMerchants = ['Starbucks Coffee', 'Amazon Pay', 'Swiggy Food', 'Metro Recharge', 'Grocery Store'];
    const randomMerchant = demoMerchants[Math.floor(Math.random() * demoMerchants.length)];
    const randomAmount = Math.floor(Math.random() * 800) + 150;

    await transactionApi.createTransaction({
      transactionType: 'DEBIT',
      amount: randomAmount,
      currency: 'INR',
      merchantName: randomMerchant,
      transactionReference: `UPI/${Math.floor(Math.random() * 9000000000 + 1000000000)}/PAY`,
      transactionDate: new Date().toISOString(),
    });
    setAddingDemoTx(false);
    loadData();
  };

  const mapSeverity = (sev: string): 'Information' | 'Warning' | 'High Priority' => {
    if (sev === 'HIGH' || sev === 'CRITICAL') return 'High Priority';
    if (sev === 'MEDIUM' || sev === 'WARNING') return 'Warning';
    return 'Information';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.main]} />}
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{profile?.fullName || 'Zentra User'}</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileBadgeText}>
            {(profile?.fullName || 'Z').charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security Status Overview */}
      <SecurityStatusCard
        title="Your Zentra security checks are active"
        subtitle="No immediate security concerns detected on your device."
      />

      {/* Demo Transaction Helper (Rendered ONLY in Demo Mode) */}
      {config.isDemoMode && (
        <GlassCard style={styles.demoCard}>
          <View style={styles.demoRow}>
            <View>
              <Text style={styles.demoTitle}>🧪 COLLEGE DEMO HELPER</Text>
              <Text style={styles.demoSub}>Simulate a payment to test Activity & Summary</Text>
            </View>
            <TouchableOpacity style={styles.demoBtn} onPress={handleAddDemoTransaction} disabled={addingDemoTx}>
              {addingDemoTx ? (
                <ActivityIndicator size="small" color={colors.base.white} />
              ) : (
                <Text style={styles.demoBtnText}>+ Add Demo Tx</Text>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {/* Financial Summary Card */}
      <GlassCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Financial Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Received</Text>
            <Text style={[styles.summaryValue, { color: colors.status.success }]}>
              {formatINR(summary.moneyIn)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: colors.primary.main }]}>
              {formatINR(summary.moneyOut)}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Unread Alerts Section */}
      {alerts.some((a) => !a.isRead) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Alerts</Text>
          {alerts
            .filter((a) => !a.isRead)
            .slice(0, 2)
            .map((alert) => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                description={alert.message}
                severity={mapSeverity(alert.severity)}
                timestamp={formatDateDisplay(alert.createdAt)}
              />
            ))}
        </View>
      )}

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.main} style={{ marginVertical: 20 }} />
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              item={{
                id: tx.id,
                merchantName: tx.merchantName || 'Payment',
                amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
                type: tx.transactionType as 'CREDIT' | 'DEBIT',
                transactionDate: formatDateDisplay(tx.transactionDate),
              }}
              onPress={() => navigation.navigate('TransactionDetail', { id: tx.id })}
            />
          ))
        ) : (
          <EmptyState
            title="No Recent Activity"
            description="Your recent payment transactions will appear here automatically."
            icon="💸"
          />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  greeting: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  userName: {
    ...typography.h1,
    color: colors.primary.main,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadgeText: {
    ...typography.h3,
    color: colors.base.white,
  },
  summaryCard: {
    marginVertical: 12,
  },
  summaryTitle: {
    ...typography.caption,
    color: colors.base.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.base.border,
    marginHorizontal: 12,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    ...typography.h2,
  },
  demoCard: {
    backgroundColor: colors.status.infoLight,
    borderColor: colors.status.info,
    marginVertical: 6,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoTitle: {
    ...typography.caption,
    color: colors.status.info,
    fontWeight: '700',
    fontSize: 10,
  },
  demoSub: {
    ...typography.caption,
    color: colors.primary.main,
    fontSize: 11,
  },
  demoBtn: {
    backgroundColor: colors.status.info,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoBtnText: {
    ...typography.caption,
    color: colors.base.white,
    fontWeight: '700',
  },
  section: {
    marginVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary.main,
  },
  seeAllText: {
    ...typography.bodyBold,
    color: colors.secondary.main,
  },
});
