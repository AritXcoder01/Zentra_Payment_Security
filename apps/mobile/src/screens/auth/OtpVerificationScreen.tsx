import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OtpInput } from '../../components/OtpInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';
import { storageService } from '../../services/storage.service';
import { config } from '../../config/config';

export const OtpVerificationScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { mobileNumber, demoOtp = config.demoOtpCode } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP code.');
      return;
    }

    setError(null);
    setLoading(true);

    const response = await apiClient.verifyOtp(mobileNumber, otp);
    setLoading(false);

    if (response.success) {
      if (response.data?.isNewUser) {
        navigation.navigate('Registration', {
          registrationToken: response.data.registrationToken,
          mobileNumber,
        });
      } else if (response.data?.tokens) {
        await storageService.setAccessToken(response.data.tokens.accessToken);
        await storageService.setRefreshToken(response.data.tokens.refreshToken);
        if (response.data?.user) {
          await storageService.setUserData(response.data.user);
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } else {
      setError(response.message || 'Invalid or expired OTP code.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setError(null);
    await apiClient.requestOtp(mobileNumber);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Change Number</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to <Text style={styles.mobileHighlight}>{mobileNumber}</Text>
        </Text>
      </View>

      {/* Demo OTP Banner — Rendered ONLY when config.isDemoMode is active */}
      {config.isDemoMode && (
        <View style={styles.demoBanner}>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>COLLEGE DEMO MODE</Text>
          </View>
          <Text style={styles.demoText}>
            Demo OTP Code: <Text style={styles.demoCode}>{demoOtp}</Text>
          </Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <OtpInput value={otp} onChangeText={(text) => { setOtp(text); setError(null); }} />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <PrimaryButton
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
          style={styles.button}
        />
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>Didn't receive the code? </Text>
        {resendCooldown > 0 ? (
          <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        )}
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
  backButton: {
    marginBottom: 20,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.secondary.main,
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
  mobileHighlight: {
    fontWeight: '700',
    color: colors.primary.main,
  },
  demoBanner: {
    backgroundColor: colors.status.infoLight,
    borderColor: colors.status.info,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginVertical: 16,
    alignItems: 'center',
  },
  demoBadge: {
    backgroundColor: colors.status.info,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  demoBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.base.white,
    fontWeight: '700',
  },
  demoText: {
    ...typography.body,
    color: colors.primary.main,
  },
  demoCode: {
    ...typography.h3,
    color: colors.secondary.main,
    letterSpacing: 2,
  },
  formContainer: {
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendLabel: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  cooldownText: {
    ...typography.bodyBold,
    color: colors.base.textMuted,
  },
  resendLink: {
    ...typography.bodyBold,
    color: colors.secondary.main,
  },
});
