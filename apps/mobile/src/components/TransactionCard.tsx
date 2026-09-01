import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors, typography } from '../theme';

export interface TransactionItem {
  id: string;
  merchantName: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  transactionDate: string;
  category?: string;
  source?: string;
}

interface TransactionCardProps {
  item: TransactionItem;
  onPress: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ item, onPress }) => {
  const isDebit = item.type === 'DEBIT';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrapper, isDebit ? styles.debitIcon : styles.creditIcon]}>
        <Icon
          name={isDebit ? 'wrong-recipient' : 'bank-transfer'}
          size={20}
          color={isDebit ? colors.status.danger : colors.status.success}
        />
      </View>
      <View style={styles.details}>
        <Text style={styles.merchant}>{item.merchantName}</Text>
        <Text style={styles.date}>{item.transactionDate}</Text>
      </View>
      <View style={styles.amountWrapper}>
        <Text style={[styles.amount, isDebit ? styles.debitText : styles.creditText]}>
          {isDebit ? '-' : '+'}₹{item.amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.base.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.base.border,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debitIcon: {
    backgroundColor: colors.status.dangerLight,
  },
  creditIcon: {
    backgroundColor: colors.status.successLight,
  },
  details: {
    flex: 1,
  },
  merchant: {
    ...typography.bodyBold,
    color: colors.primary.main,
  },
  date: {
    ...typography.caption,
    color: colors.base.textMuted,
  },
  amountWrapper: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.bodyBold,
  },
  debitText: {
    color: colors.primary.main,
  },
  creditText: {
    color: colors.status.success,
  },
});
