import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { apiClient } from '../../api/client';

export const EditProfileScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const profile = route.params?.profile || {};

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading(true);

    // Payload MUST contain ONLY fullName and email (mobileNumber excluded)
    const response = await apiClient.updateProfile({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
    });

    setLoading(false);

    if (response.success) {
      navigation.goBack();
    } else {
      setError(response.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your full name and email address</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Full Name*</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={(text) => { setFullName(text); setError(null); }}
          placeholder="Jane Doe"
          placeholderTextColor={colors.base.textMuted}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email Address*</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => { setEmail(text); setError(null); }}
          placeholder="jane@example.com"
          placeholderTextColor={colors.base.textMuted}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mobile Number (Immutable)</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.mobileNumber || ''}
          editable={false}
        />
        <Text style={styles.immutableHelpText}>
          🔒 Mobile number is permanently linked to your Zentra identity and cannot be altered.
        </Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PrimaryButton
        title="Save Changes"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        style={styles.button}
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
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.bodyBold,
    color: colors.primary.main,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.base.white,
    borderColor: colors.base.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...typography.body,
    color: colors.primary.main,
  },
  disabledInput: {
    backgroundColor: colors.base.background,
    color: colors.base.textMuted,
  },
  immutableHelpText: {
    ...typography.caption,
    color: colors.base.textMuted,
    marginTop: 4,
    fontSize: 11,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginVertical: 20,
  },
});
