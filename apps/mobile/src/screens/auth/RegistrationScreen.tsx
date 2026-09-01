import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';
import { storageService } from '../../services/storage.service';

export const RegistrationScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { registrationToken, mobileNumber } = route.params;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading(true);

    const response = await apiClient.completeRegistration(
      registrationToken,
      fullName.trim(),
      email.trim(),
    );
    setLoading(false);

    if (response.success && response.data?.tokens) {
      await storageService.setAccessToken(response.data.tokens.accessToken);
      await storageService.setRefreshToken(response.data.tokens.refreshToken);
      if (response.data?.user) {
        await storageService.setUserData(response.data.user);
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      setError(response.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FINAL STEP</Text>
        </View>
        <Text style={styles.title}>Complete Registration</Text>
        <Text style={styles.subtitle}>
          Create your Zentra account profile to access security services.
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Read-Only Verified Mobile Number Display */}
        <AppTextInput
          label="REGISTERED MOBILE NUMBER"
          value={mobileNumber}
          editable={false}
          badge="VERIFIED & LOCKED"
        />

        <AppTextInput
          label="FULL NAME"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (error) setError(null);
          }}
        />

        <AppTextInput
          label="EMAIL ADDRESS"
          placeholder="e.g. rahul@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null);
          }}
          error={error || undefined}
        />

        <PrimaryButton
          title="Complete Profile & Proceed"
          onPress={handleRegister}
          loading={loading}
          disabled={!fullName.trim() || !email.trim()}
          style={styles.button}
        />
      </View>

      <View style={styles.termsBanner}>
        <Text style={styles.termsText}>
          By registering, you acknowledge Zentra's privacy-first security terms. Your mobile number remains your permanent account anchor.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.base.background,
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    marginTop: 20,
  },
  badge: {
    backgroundColor: colors.secondary.subtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  formContainer: {
    marginVertical: 20,
  },
  button: {
    marginTop: 10,
  },
  termsBanner: {
    backgroundColor: colors.base.divider,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  termsText: {
    ...typography.caption,
    color: colors.base.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
