import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { DangerButton } from '../../components/DangerButton';
import { colors, typography } from '../../theme';
import { transactionApi } from '../../api/transaction.api';
import { Transaction } from '../../types/domain.types';
import { formatINR, formatDateDisplay } from '../../utils/formatters';

export const TransactionDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await transactionApi.getTransactionById(id);
      if (res.success && res.data) {
        setTransaction(res.data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleThisWasntMe = () => {
    if (!transaction) return;
    navigation.navigate('Fraud', {
      screen: 'FraudLanding',
      params: {
        prefilledData: {
          relatedTransactionId: transaction.id,
          amount: typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount,
          transactionReference: transaction.transactionReference || undefined,
          incidentDate: transaction.transactionDate.split('T')[0],
          paymentMode: 'UPI',
        },
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Transaction details unavailable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.merchantTitle}>{transaction.merchantName || 'Payment Transaction'}</Text>
        <Text
          style={[
            styles.amountText,
            { color: transaction.transactionType === 'CREDIT' ? colors.status.success : colors.primary.main },
          ]}
        >
          {transaction.transactionType === 'CREDIT' ? '+' : '-'}{formatINR(transaction.amount)}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{transaction.transactionType}</Text>
        </View>
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.cardHeader}>Transaction Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>{formatDateDisplay(transaction.transactionDate)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reference / UTR</Text>
          <Text style={styles.value}>{transaction.transactionReference || 'N/A'}</Text>
        </View>

        {transaction.merchantVpa && (
          <View style={styles.row}>
            <Text style={styles.label}>Merchant VPA</Text>
            <Text style={styles.value}>{transaction.merchantVpa}</Text>
          </View>
        )}

        {transaction.accountMask && (
          <View style={styles.row}>
            <Text style={styles.label}>Account Mask</Text>
            <Text style={styles.value}>{transaction.accountMask}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Source Channel</Text>
          <Text style={styles.value}>{transaction.source}</Text>
        </View>
      </GlassCard>

      <DangerButton
        title="🚨 This Wasn't Me"
        onPress={handleThisWasntMe}
        style={styles.actionBtn}
      />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.status.danger,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  merchantTitle: {
    ...typography.h2,
    color: colors.primary.main,
    marginBottom: 4,
  },
  amountText: {
    ...typography.h1,
    fontSize: 32,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.secondary.subtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.secondary.main,
    fontWeight: '700',
  },
  card: {
    marginVertical: 10,
  },
  cardHeader: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  value: {
    ...typography.bodyBold,
    color: colors.primary.main,
  },
  actionBtn: {
    marginVertical: 20,
  },
});
