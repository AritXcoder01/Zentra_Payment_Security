import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { colors, typography } from '../../theme';
import { sessionsApi } from '../../api/sessions.api';
import { UserSession } from '../../types/domain.types';
import { formatDateDisplay } from '../../utils/formatters';

export const DevicesSessionsScreen: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [targetSessionId, setTargetSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await sessionsApi.getSessions();
      if (res.success && Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (id: string) => {
    setTargetSessionId(id);
  };

  const confirmSingleRevoke = async () => {
    if (!targetSessionId) return;
    const idToRevoke = targetSessionId;
    setTargetSessionId(null);

    await sessionsApi.revokeSession(idToRevoke);
    fetchSessions();
  };

  const handleRevokeOthers = async () => {
    setConfirmModalVisible(true);
  };

  const confirmRevokeOthers = async () => {
    setConfirmModalVisible(false);
    setRevokingOthers(true);

    const res = await sessionsApi.revokeOtherSessions();
    setRevokingOthers(false);

    if (res.success) {
      fetchSessions();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE');
  const otherActiveSessionsCount = activeSessions.filter((s) => !s.currentSession).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Devices & Active Sessions</Text>
        <Text style={styles.subtitle}>Manage devices currently logged into your Zentra account</Text>
      </View>

      <GlassCard style={styles.sectionCard}>
        <Text style={styles.cardHeader}>Active Sessions ({activeSessions.length})</Text>

        {activeSessions.map((session) => (
          <View key={session.id} style={styles.sessionRow}>
            <View style={styles.sessionIcon}>
              <Text style={{ fontSize: 20 }}>
                {session.device?.platform === 'IOS' ? '🍎' : '📱'}
              </Text>
            </View>
            <View style={styles.sessionInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.deviceModel}>
                  {session.device?.deviceModel || session.device?.platform || 'Android Device'}
                </Text>
                {session.currentSession && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>THIS DEVICE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sessionMeta}>
                Created: {formatDateDisplay(session.createdAt)}
              </Text>
              <Text style={styles.sessionMeta}>
                Last Active: {formatDateDisplay(session.lastUsedAt)}
              </Text>
            </View>
            {!session.currentSession && (
              <SecondaryButton
                title="Revoke"
                onPress={() => handleRevokeSession(session.id)}
                style={styles.revokeBtn}
              />
            )}
          </View>
        ))}
      </GlassCard>

      {otherActiveSessionsCount > 0 && (
        <SecondaryButton
          title={`Sign Out Other Sessions (${otherActiveSessionsCount})`}
          onPress={handleRevokeOthers}
          loading={revokingOthers}
          style={styles.actionBtn}
        />
      )}

      {/* Confirmation Modal for Revoking All Other Sessions */}
      <ConfirmationModal
        visible={confirmModalVisible}
        title="Sign Out Other Sessions?"
        message="This will immediately revoke access for all other active devices logged into your account."
        confirmLabel="Sign Out Other Devices"
        cancelLabel="Cancel"
        onConfirm={confirmRevokeOthers}
        onCancel={() => setConfirmModalVisible(false)}
      />

      {/* Confirmation Modal for Single Session Revocation */}
      <ConfirmationModal
        visible={!!targetSessionId}
        title="Revoke Target Session?"
        message="This device session will be signed out immediately."
        confirmLabel="Revoke Access"
        cancelLabel="Cancel"
        onConfirm={confirmSingleRevoke}
        onCancel={() => setTargetSessionId(null)}
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
  sectionCard: {
    marginVertical: 10,
  },
  cardHeader: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 14,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.base.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  deviceModel: {
    ...typography.bodyBold,
    color: colors.primary.main,
    marginRight: 8,
  },
  currentBadge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.status.success,
    fontWeight: '700',
  },
  sessionMeta: {
    ...typography.caption,
    color: colors.base.textSecondary,
    fontSize: 11,
  },
  revokeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionBtn: {
    marginVertical: 20,
  },
});
