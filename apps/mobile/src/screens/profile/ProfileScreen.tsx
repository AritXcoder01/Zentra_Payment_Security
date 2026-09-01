import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { ProfileRow } from '../../components/ProfileRow';
import { SecondaryButton } from '../../components/SecondaryButton';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';
import { UserProfile } from '../../types/domain.types';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await apiClient.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.main]} />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.fullName || 'Z').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{profile?.fullName || 'Zentra User'}</Text>
        <Text style={styles.userMobile}>{profile?.mobileNumber}</Text>
      </View>

      <GlassCard style={styles.sectionCard}>
        <Text style={styles.cardHeader}>Account Details</Text>

        <ProfileRow
          label="Full Name"
          value={profile?.fullName || 'Not Provided'}
          icon="user-info"
          onPress={() => navigation.navigate('EditProfile', { profile })}
        />

        <ProfileRow
          label="Email Address"
          value={profile?.email || 'Not Provided'}
          icon="phishing"
          onPress={() => navigation.navigate('EditProfile', { profile })}
        />

        <ProfileRow
          label="Mobile Number"
          value={profile?.mobileNumber || 'N/A'}
          icon="sim-related"
          badge="VERIFIED & LOCKED"
        />

        <ProfileRow
          label="Account Status"
          value={profile?.accountStatus || 'ACTIVE'}
          icon="safety"
        />
      </GlassCard>

      <GlassCard style={styles.sectionCard}>
        <Text style={styles.cardHeader}>Security & Devices</Text>

        <ProfileRow
          label="Payment Activity Detection"
          value="Optional notification reader & consent"
          icon="devices"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Safety' })}
        />

        <ProfileRow
          label="Active Sessions & Devices"
          value="Manage logged-in devices"
          icon="devices"
          onPress={() => navigation.navigate('DevicesSessions')}
        />

        <ProfileRow
          label="Help & Emergency Response"
          value="Emergency checklist & guidelines"
          icon="help"
          onPress={() => navigation.navigate('HelpEmergency')}
        />
      </GlassCard>

      {/* History Section */}
      <GlassCard style={styles.sectionCard}>
        <Text style={styles.cardHeader}>History</Text>

        <ProfileRow
          label="Fraud Report History"
          value="Review reported incidents & guidance"
          icon="history"
          onPress={() => navigation.navigate('FraudReportHistory')}
        />
      </GlassCard>

      <SecondaryButton
        title="Sign Out of Zentra"
        onPress={() => setLogoutModalVisible(true)}
        style={styles.logoutBtn}
      />

      <ConfirmationModal
        visible={logoutModalVisible}
        title="Sign Out of Zentra?"
        message="Your secure authentication tokens will be cleared from this device."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
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
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    ...typography.h1,
    color: colors.base.white,
    fontSize: 32,
  },
  userName: {
    ...typography.h2,
    color: colors.primary.main,
  },
  userMobile: {
    ...typography.body,
    color: colors.base.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    marginVertical: 10,
  },
  cardHeader: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: 10,
  },
  logoutBtn: {
    marginVertical: 20,
  },
});
