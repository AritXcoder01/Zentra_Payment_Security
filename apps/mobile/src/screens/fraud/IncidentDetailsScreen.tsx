import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';

export const IncidentDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { reportData } = route.params;

  const [amount, setAmount] = useState(
    reportData.amount ? String(reportData.amount) : '',
  );
  const [incidentDate, setIncidentDate] = useState(
    reportData.incidentDate || new Date().toISOString().split('T')[0],
  );
  const [transactionReference, setTransactionReference] = useState(
    reportData.transactionReference || '',
  );
  const [description, setDescription] = useState(reportData.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a description of at least 10 characters.');
      return;
    }

    setError(null);

    navigation.navigate('ReviewReport', {
      reportData: {
        ...reportData,
        amount: parsedAmount,
        incidentDate,
        transactionReference: transactionReference.trim() || undefined,
        description: description.trim(),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Incident Details</Text>
        <Text style={styles.subtitle}>Provide specific information about the fraudulent activity</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Amount Lost / Disputed (₹)*</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="e.g. 2500"
          placeholderTextColor={colors.base.textMuted}
          value={amount}
          onChangeText={(text) => { setAmount(text); setError(null); }}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Incident Date (YYYY-MM-DD)*</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-08-26"
          placeholderTextColor={colors.base.textMuted}
          value={incidentDate}
          onChangeText={setIncidentDate}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Transaction Reference / UTR (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. UPI/1234567890/PAY"
          placeholderTextColor={colors.base.textMuted}
          value={transactionReference}
          onChangeText={setTransactionReference}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Detailed Description*</Text>
        <Text style={styles.privacyNotice}>
          🔒 Security Warning: Do not enter passwords, OTPs, PINs, or CVV numbers.
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Describe how the fraud occurred, communication channels used, or fake helpline details..."
          placeholderTextColor={colors.base.textMuted}
          value={description}
          onChangeText={(text) => { setDescription(text); setError(null); }}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryButton
        title="Review & Submit Report"
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
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.bodyBold,
    color: colors.primary.main,
    marginBottom: 4,
  },
  privacyNotice: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondary.main,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: colors.base.white,
    borderColor: colors.base.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...typography.body,
    color: colors.primary.main,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginVertical: 20,
  },
});
