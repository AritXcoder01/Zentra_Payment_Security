import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';
import { storageService } from '../../services/storage.service';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  useEffect(() => {
    const checkAppLaunchState = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const onboardingDone = await storageService.getOnboardingCompleted();
      const refreshToken = await storageService.getRefreshToken();

      if (refreshToken) {
        navigation.replace('MainTabs');
      } else if (!onboardingDone) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Login');
      }
    };

    checkAppLaunchState();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🛡️</Text>
      </View>
      <Text style={styles.appName}>ZENTRA</Text>
      <Text style={styles.tagline}>Payment Security & Fraud Guidance</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    ...typography.h1,
    fontSize: 32,
    color: colors.base.white,
    letterSpacing: 2,
  },
  tagline: {
    ...typography.caption,
    color: colors.secondary.light,
    marginTop: 8,
  },
});
