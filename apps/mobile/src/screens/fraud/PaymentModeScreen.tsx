import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SelectableCard } from '../../components/SelectableCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { PaymentMode } from '../../types/domain.types';

const PAYMENT_MODES: { mode: PaymentMode; title: string; desc: string; icon: string }[] = [
  { mode: 'UPI', title: 'UPI / QR Code', desc: 'Google Pay, PhonePe, Paytm, BHIM or QR scan', icon: '📱' },
  { mode: 'CARD', title: 'Debit / Credit Card', desc: 'Card swipe, online card payment, or ATM card', icon: '💳' },
  { mode: 'NET_BANKING', title: 'Net Banking', desc: 'Internet banking login or NEFT/RTGS/IMPS transfer', icon: '🏦' },
  { mode: 'BANK_TRANSFER', title: 'Direct Bank Transfer', desc: 'Account number and IFSC transfer', icon: '💸' },
  { mode: 'WALLET', title: 'Digital Wallet', desc: 'Prepaid wallet or app balance', icon: '👛' },
  { mode: 'ATM', title: 'ATM Cash Withdrawal', desc: 'Physical ATM machine transaction', icon: '🏧' },
  { mode: 'OTHER', title: 'Other Channel', desc: 'Unlisted payment mechanism', icon: '❓' },
];

export const PaymentModeScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { reportData } = route.params;
  const [selectedMode, setSelectedMode] = useState<PaymentMode>(reportData.paymentMode || 'UPI');

  const handleNext = () => {
    navigation.navigate('IncidentDetails', {
      reportData: {
        ...reportData,
        paymentMode: selectedMode,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Channel</Text>
        <Text style={styles.subtitle}>Select the payment mode used in this incident</Text>
      </View>

      {PAYMENT_MODES.map((item) => (
        <SelectableCard
          key={item.mode}
          title={item.title}
          subtitle={item.desc}
          icon={item.icon}
          selected={selectedMode === item.mode}
          onPress={() => setSelectedMode(item.mode)}
        />
      ))}

      <PrimaryButton
        title="Continue to Incident Details"
        onPress={handleNext}
        style={styles.button}
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
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  button: {
    marginVertical: 20,
  },
});
