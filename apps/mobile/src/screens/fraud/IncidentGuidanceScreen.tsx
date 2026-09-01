import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { ResourceCard } from '../../components/ResourceCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Icon } from '../../components/Icon';
import { colors, typography } from '../../theme';
import { fraudApi } from '../../api/fraud.api';
import { resourceApi } from '../../api/resource.api';
import { FraudGuidance, OfficialResource } from '../../types/domain.types';

export const IncidentGuidanceScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { reportId } = route.params || {};
  const [guidance, setGuidance] = useState<FraudGuidance | null>(null);
  const [resources, setResources] = useState<OfficialResource[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!reportId) {
        setLoading(false);
        return;
      }

      const guidanceRes = await fraudApi.getGuidance(reportId);
      if (guidanceRes.success && guidanceRes.data) {
        setGuidance(guidanceRes.data);

        // Fetch official resources for category/paymentMode
        const resourceRes = await resourceApi.getResources({
          fraudCategory: guidanceRes.data.reportCategory,
          paymentMode: guidanceRes.data.paymentMode,
        });
        if (resourceRes.success && Array.isArray(resourceRes.data)) {
          setResources(resourceRes.data);
        } else if (Array.isArray(guidanceRes.data.officialResources)) {
          setResources(guidanceRes.data.officialResources);
        }
      }
      setLoading(false);
    }
    load();
  }, [reportId]);

  const handleConfirmOpen = (url: string) => {
    setPendingUrl(url);
    setConfirmModalVisible(true);
  };

  const handleProceedExternal = async () => {
    setConfirmModalVisible(false);
    if (!pendingUrl) return;

    // STRICT SCHEME VALIDATION: Allow ONLY secure https:// and tel: schemes
    if (!pendingUrl.startsWith('https://') && !pendingUrl.startsWith('tel:')) {
      Alert.alert('Security Block', 'Only secure https:// websites and official tel: helplines can be launched.');
      setPendingUrl(null);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(pendingUrl);
      if (supported) {
        await Linking.openURL(pendingUrl);
      } else {
        Alert.alert('Cannot Open Resource', `Unable to launch application for: ${pendingUrl}`);
      }
    } catch {
      Alert.alert('Error', 'An error occurred while attempting to launch the external resource.');
    } finally {
      setPendingUrl(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>RECOMMENDED ACTION PLAN</Text>
        </View>
        <Text style={styles.title}>Incident Guidance</Text>
        <Text style={styles.subtitle}>
          Follow these immediate steps to mitigate financial loss and protect your accounts.
        </Text>
      </View>

      {/* Guidance Checklist */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardHeader}>
          ⚡ Immediate Action Steps ({guidance?.severity || 'MEDIUM'} Severity)
        </Text>

        {guidance?.immediateActions?.map((action, idx) => (
          <View key={idx} style={styles.stepRow}>
            <Text style={styles.stepNum}>{idx + 1}</Text>
            <Text style={styles.stepDesc}>{action}</Text>
          </View>
        ))}
      </GlassCard>

      {/* Official Action Links Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Official Action Links</Text>
        <Text style={styles.sectionSub}>
          Verified Government & Banking Ombudsman emergency helpline channels
        </Text>

        {resources.length > 0 ? (
          resources.map((res) => (
            <ResourceCard
              key={res.id || res.authorityName}
              authorityName={res.authorityName}
              websiteUrl={res.websiteUrl}
              phoneNumber={res.phoneNumber}
              instructions={res.instructions}
              lastVerifiedAt={res.lastVerifiedAt}
              onConfirmOpen={(url) => handleConfirmOpen(url)}
            />
          ))
        ) : (
          <GlassCard style={styles.placeholderCard}>
            <Icon name="safety" size={24} color={colors.primary.main} />
            <Text style={styles.placeholderTitle}>Official Resource Database</Text>
            <Text style={styles.placeholderText}>
              Contact your bank/payment provider through its verified official channel. No fake contacts are displayed.
            </Text>
          </GlassCard>
        )}
      </View>

      {/* Safety Recommendations */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardHeader}>💡 Safety Recommendations</Text>
        {guidance?.safetyRecommendations?.map((rec, idx) => (
          <View key={`rec-${idx}`} style={styles.recRow}>
            <Icon name="check-circle" size={16} color={colors.status.success} />
            <Text style={styles.recDesc}>{rec}</Text>
          </View>
        ))}
      </GlassCard>

      <PrimaryButton
        title="Return to Home Dashboard"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        style={styles.homeBtn}
      />

      {/* Confirmation Modal before launching external URLs */}
      <ConfirmationModal
        visible={confirmModalVisible}
        title="Leave Zentra App?"
        message="You are leaving Zentra and opening an official external government or banking helpline resource."
        confirmLabel="Proceed to Official Resource"
        cancelLabel="Stay in App"
        onConfirm={handleProceedExternal}
        onCancel={() => setConfirmModalVisible(false)}
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
  header: {
    marginTop: 10,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: colors.secondary.subtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondary.main,
    fontWeight: '700',
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
  card: {
    marginVertical: 10,
  },
  cardHeader: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary.main,
    color: colors.base.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    fontSize: 12,
    marginRight: 10,
  },
  stepDesc: {
    ...typography.body,
    flex: 1,
    color: colors.primary.main,
    lineHeight: 20,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.base.border,
    gap: 8,
  },
  recDesc: {
    ...typography.caption,
    flex: 1,
    color: colors.base.textPrimary,
    lineHeight: 18,
  },
  section: {
    marginVertical: 14,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 2,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginBottom: 12,
  },
  placeholderCard: {
    backgroundColor: colors.base.white,
    borderColor: colors.base.border,
    padding: 16,
    alignItems: 'center',
  },
  placeholderTitle: {
    ...typography.bodyBold,
    color: colors.primary.main,
    marginTop: 6,
    marginBottom: 4,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  homeBtn: {
    marginVertical: 20,
  },
});
