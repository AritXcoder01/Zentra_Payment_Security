import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { storageService } from '../../services/storage.service';

const SLIDES = [
  {
    icon: '🛡️',
    title: 'Payment Fraud Awareness',
    description:
      'Learn how to identify UPI scams, phishing links, and fake customer care channels before making transactions.',
  },
  {
    icon: '🚨',
    title: 'Guided Incident Reporting',
    description:
      'Step-by-step reporting flow to categorize payment incidents and find official authority support channels.',
  },
  {
    icon: '🔒',
    title: 'Privacy-First Protection',
    description:
      'Your financial privacy is respected. Critical OTPs, PINs, and passwords are never collected or stored.',
  },
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await storageService.setOnboardingCompleted(true);
      navigation.replace('Login');
    }
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
        <PrimaryButton
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
    justifyContent: 'space-between',
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    color: colors.base.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.base.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.secondary.main,
  },
});
