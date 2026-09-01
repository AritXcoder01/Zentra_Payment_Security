import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { AlertCard } from '../../components/AlertCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography } from '../../theme';
import { alertsApi } from '../../api/alerts.api';
import { SecurityAlert } from '../../types/domain.types';
import { formatDateDisplay } from '../../utils/formatters';

export const AlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsApi.getAlerts();
      if (res.success && Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    } catch {
      // Handle fetch error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const handleMarkAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert)),
    );
    await alertsApi.markAsRead(id);
  };

  const mapSeverity = (sev: string): 'Information' | 'Warning' | 'High Priority' => {
    if (sev === 'HIGH' || sev === 'CRITICAL') return 'High Priority';
    if (sev === 'MEDIUM' || sev === 'WARNING') return 'Warning';
    return 'Information';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Advisories</Text>
        <Text style={styles.subtitle}>Threat alerts and security recommendations for your account</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary.main} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.main]} />}
          ListEmptyComponent={
            <EmptyState
              title="No Security Alerts"
              description="No security alerts right now. Your account security status is monitored."
              icon="🛡️"
            />
          }
          renderItem={({ item }) => (
            <AlertCard
              title={item.title}
              description={item.message}
              severity={mapSeverity(item.severity)}
              timestamp={formatDateDisplay(item.createdAt)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
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
  listContent: {
    padding: 20,
  },
});
