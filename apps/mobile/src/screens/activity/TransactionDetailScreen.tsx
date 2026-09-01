import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { DangerButton } from '../../components/DangerButton';
import { colors, typography } from '../../theme';

export const TransactionDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const transaction = route.params?.transaction || {
    id: 'tx_sample',
    merchantName: 'Sample Merchant Pay',
    amount: 1500,
    type: 'DEBIT',
    transactionDate: '2026-08-26 14:30',
    transactionReference: 'UPI/1234567890/PAY',
    accountMask: 'XX1234',
    source: 'SMS_PARSER',
  };

  const handleThisWasntMe = () => {
    navigation.navigate('FraudStack', {
      screen: 'FraudLanding',
      params: { transactionId: transaction.id },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.merchant}>{transaction.merchantName}</Text>
        <Text style={styles.amount}>₹{transaction.amount.toFixed(2)}</Text>
        <Text style={styles.typeText}>{transaction.type === 'DEBIT' ? 'Money Debited' : 'Money Credited'}</Text>
      </View>

      <GlassCard style={styles.detailCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction Date</Text>
          <Text style={styles.value}>{transaction.transactionDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reference Number</Text>
          <Text style={styles.value}>{transaction.transactionReference || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Account Mask</Text>
          <Text style={styles.value}>{transaction.accountMask || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Detection Source</Text>
          <Text style={styles.value}>{transaction.source}</Text>
        </View>
      </GlassCard>

      <View style={styles.actions}>
        <DangerButton
          title="🚨 This Wasn't Me (Report Fraud)"
          onPress={handleThisWasntMe}
          style={styles.btn}
        />
        <SecondaryButton
          title="Need Help with this Payment"
          onPress={() => navigation.navigate('HelpEmergency')}
          style={styles.btn}
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
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  merchant: {
    ...typography.h2,
    color: colors.primary.main,
    marginBottom: 6,
  },
  amount: {
    ...typography.h1,
    fontSize: 36,
    color: colors.primary.main,
  },
  typeText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginTop: 4,
  },
  detailCard: {
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.divider,
  },
  label: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  value: {
    ...typography.bodyBold,
    color: colors.primary.main,
  },
  actions: {
    marginTop: 20,
  },
  btn: {
    marginBottom: 12,
  },
});
