import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const cleaned = mobileNumber.replace(/[^0-9]/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setLoading(true);

    const formattedMobile = `+91${cleaned}`;
    const response = await apiClient.requestOtp(formattedMobile);
    setLoading(false);

    if (response.success) {
      navigation.navigate('OtpVerification', {
        mobileNumber: formattedMobile,
        demoOtp: response.data?.demoOtp,
      });
    } else {
      setError(response.message || 'Failed to request OTP. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.shieldIconWrapper}>
            <Text style={styles.shieldIcon}>🛡️</Text>
          </View>
          <Text style={styles.title}>Mobile Authentication</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to receive a verification code.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <AppTextInput
            label="MOBILE NUMBER"
            prefix="+91"
            placeholder="98765 43210"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text);
              if (error) setError(null);
            }}
            error={error || undefined}
          />

          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={mobileNumber.replace(/[^0-9]/g, '').length !== 10}
            style={styles.button}
          />
        </View>

        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🔒 Zentra uses passwordless OTP verification. Your mobile number is your account identifier.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    marginTop: 40,
    alignItems: 'flex-start',
  },
  shieldIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.secondary.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldIcon: {
    fontSize: 28,
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
    marginVertical: 30,
  },
  button: {
    marginTop: 10,
  },
  infoBanner: {
    backgroundColor: colors.base.divider,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.base.border,
    marginBottom: 20,
  },
  infoText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    lineHeight: 18,
  },
});
