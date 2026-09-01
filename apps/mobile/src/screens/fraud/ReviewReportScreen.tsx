import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { fraudApi } from '../../api/fraud.api';
import { formatINR } from '../../utils/formatters';

export const ReviewReportScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { reportData } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const response = await fraudApi.createReport({
      fraudCategory: reportData.fraudCategory,
      paymentMode: reportData.paymentMode,
      amount: reportData.amount,
      incidentDate: reportData.incidentDate,
      description: reportData.description,
      transactionReference: reportData.transactionReference,
      relatedTransactionId: reportData.relatedTransactionId,
    });

    setSubmitting(false);

    if (response.success && response.data?.id) {
      navigation.navigate('IncidentGuidance', {
        reportId: response.data.id,
      });
    } else {
      setError(response.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Incident Summary</Text>
        <Text style={styles.subtitle}>Please review all details before submitting</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.cardHeader}>Report Overview</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{reportData.fraudCategory}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Channel</Text>
          <Text style={styles.value}>{reportData.paymentMode}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Disputed Amount</Text>
          <Text style={[styles.value, { color: colors.status.danger }]}>
            {formatINR(reportData.amount)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Incident Date</Text>
          <Text style={styles.value}>{reportData.incidentDate}</Text>
        </View>

        {reportData.transactionReference && (
          <View style={styles.row}>
            <Text style={styles.label}>Reference / UTR</Text>
            <Text style={styles.value}>{reportData.transactionReference}</Text>
          </View>
        )}

        <View style={styles.descriptionSection}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.descriptionText}>{reportData.description}</Text>
        </View>
      </GlassCard>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryButton
        title="Submit & Get Guidance"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
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
  descriptionSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.base.border,
  },
  descriptionText: {
    ...typography.body,
    color: colors.primary.main,
    marginTop: 4,
    lineHeight: 20,
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
