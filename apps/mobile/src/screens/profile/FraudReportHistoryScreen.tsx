import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Icon } from '../../components/Icon';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';

export const FraudReportHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    const res = await apiClient.getFraudReports();
    if (res.success && Array.isArray(res.data)) {
      setReports(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fraud Report History</Text>
        <Text style={styles.subtitle}>
          Review payment incidents you've reported to Zentra and revisit your recommended next steps.
        </Text>
      </View>

      {/* Reports List or Empty State */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary.main} style={{ marginVertical: 30 }} />
      ) : reports.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="history"
            title="No fraud reports yet."
            description="Reports you submit through Zentra will appear here."
          />
          <PrimaryButton
            title="Report a Payment Problem"
            onPress={() => navigation.navigate('FraudStack', { screen: 'FraudLanding' })}
            style={{ marginTop: 10 }}
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {reports.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('FraudReportDetail', { reportId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconTitleRow}>
                  <View style={styles.iconCircle}>
                    <Icon name="report-fraud" size={20} color={colors.secondary.main} />
                  </View>
                  <View>
                    <Text style={styles.categoryName}>
                      {item.fraudCategory?.name || 'Payment Security Incident'}
                    </Text>
                    <Text style={styles.reportId}>Ref #{item.id.substring(0, 8).toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.amount}>₹{Number(item.amount).toFixed(2)}</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Payment Mode:</Text>
                  <Text style={styles.metaValue}>{item.paymentMode}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Incident Date:</Text>
                  <Text style={styles.metaValue}>{formatDate(item.incidentDate)}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Submitted to Zentra • Guidance Available</Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.base.textMuted} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Tracking Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Icon name="safety" size={16} color={colors.base.textMuted} />
            <Text style={styles.disclaimerText}>
              Zentra tracks reports created inside this app. Status of complaints filed with banks or
              government authorities must be checked through the respective official service.
            </Text>
          </View>
        </View>
      )}
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
    lineHeight: 20,
  },
  emptyWrapper: {
    marginTop: 10,
  },
  listContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.base.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.divider,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryName: {
    ...typography.bodyBold,
    color: colors.primary.main,
    fontSize: 14,
  },
  reportId: {
    ...typography.caption,
    color: colors.base.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  amount: {
    ...typography.h3,
    color: colors.primary.main,
  },
  cardBody: {
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.base.textSecondary,
    width: 100,
  },
  metaValue: {
    ...typography.bodyBold,
    color: colors.base.textPrimary,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.base.divider,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.info,
    marginRight: 6,
  },
  statusText: {
    ...typography.caption,
    color: colors.status.info,
    fontSize: 10,
    fontWeight: '700',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.base.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.base.border,
    marginTop: 10,
    gap: 8,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.base.textMuted,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});
