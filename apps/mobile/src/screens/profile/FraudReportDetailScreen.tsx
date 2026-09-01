import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Icon } from '../../components/Icon';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';

export const FraudReportDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { reportId } = route.params || {};
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!reportId) return;
      const res = await apiClient.getFraudReportById(reportId);
      if (res.success && res.data) {
        setReport(res.data);
      }
      setLoading(false);
    }
    load();
  }, [reportId]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTrackOfficial = async () => {
    const cyberUrl = 'https://cybercrime.gov.in';
    try {
      const supported = await Linking.canOpenURL(cyberUrl);
      if (supported) {
        await Linking.openURL(cyberUrl);
      } else {
        Alert.alert('Cannot Open Portal', `Unable to open: ${cyberUrl}`);
      }
    } catch {
      Alert.alert('Error', 'Unable to launch official portal.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Fraud report details could not be found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Fraud Report Details</Text>
        <Text style={styles.reportIdText}>Reference ID: #{report.id}</Text>
      </View>

      {/* Main Details Glass Card */}
      <GlassCard style={styles.detailCard}>
        <View style={styles.amountBanner}>
          <Text style={styles.amountLabel}>Disputed Amount</Text>
          <Text style={styles.amountValue}>₹{Number(report.amount).toFixed(2)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{report.fraudCategory?.name || 'Payment Security'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Payment Mode:</Text>
          <Text style={styles.value}>{report.paymentMode}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Incident Date:</Text>
          <Text style={styles.value}>{formatDate(report.incidentDate)}</Text>
        </View>

        {report.transactionReference && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ref (UTR / Tx):</Text>
            <Text style={styles.value}>{report.transactionReference}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Submitted On:</Text>
          <Text style={styles.value}>{formatDate(report.createdAt)}</Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionLabel}>Incident Summary:</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>
      </GlassCard>

      {/* Zentra Internal Report Progress Timeline */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Zentra Report Status</Text>

        <View style={styles.timelineItem}>
          <View style={styles.timelineDotDone}>
            <Icon name="check-circle" size={14} color={colors.base.white} />
          </View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>1. Report saved in Zentra</Text>
            <Text style={styles.timelineSub}>Incident registered in your Zentra security account</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineDotDone}>
            <Icon name="check-circle" size={14} color={colors.base.white} />
          </View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>2. Incident analyzed using Zentra rules</Text>
            <Text style={styles.timelineSub}>Deterministic mitigation plan generated</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineDotActive}>
            <View style={styles.innerDot} />
          </View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>3. Guidance available</Text>
            <Text style={styles.timelineSub}>Action checklist and official links ready for review</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineDotPending} />
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>4. Official Authority Action</Text>
            <Text style={styles.timelineSub}>Follow official recommendations for bank / helpline reporting</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="View Recommended Actions & Official Links"
          onPress={() =>
            navigation.navigate('FraudStack', {
              screen: 'FraudGuidance',
              params: { reportId: report.id },
            })
          }
          style={styles.primaryBtn}
        />

        <SecondaryButton
          title="Track Official Complaint (Cybercrime Portal)"
          onPress={handleTrackOfficial}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.base.background,
  },
  errorText: {
    ...typography.body,
    color: colors.status.danger,
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
  },
  reportIdText: {
    ...typography.caption,
    color: colors.base.textMuted,
    marginTop: 2,
  },
  detailCard: {
    marginBottom: 20,
  },
  amountBanner: {
    backgroundColor: colors.secondary.subtle,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.secondary.main,
    fontWeight: '700',
  },
  amountValue: {
    ...typography.h1,
    color: colors.secondary.main,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.divider,
  },
  label: {
    ...typography.caption,
    color: colors.base.textSecondary,
  },
  value: {
    ...typography.bodyBold,
    color: colors.primary.main,
  },
  descriptionSection: {
    marginTop: 12,
  },
  descriptionLabel: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    ...typography.body,
    color: colors.base.textPrimary,
    lineHeight: 20,
  },
  timelineSection: {
    backgroundColor: colors.base.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.base.border,
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  timelineDotDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDotActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary.subtle,
    borderWidth: 2,
    borderColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary.main,
  },
  timelineDotPending: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.base.divider,
    marginRight: 12,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.primary.main,
  },
  timelineSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.base.textSecondary,
    marginTop: 1,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  primaryBtn: {
    marginBottom: 10,
  },
});
