import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Icon } from './Icon';
import { colors, typography } from '../theme';

export interface ResourceCardProps {
  authorityName: string;
  websiteUrl?: string | null;
  phoneNumber?: string | null;
  instructions?: string | null;
  lastVerifiedAt?: string | Date | null;
  onConfirmOpen?: (url: string, type: 'url' | 'tel') => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  authorityName,
  websiteUrl,
  phoneNumber,
  instructions,
  lastVerifiedAt,
  onConfirmOpen,
}) => {
  const handleOpenUrl = async (url: string) => {
    if (onConfirmOpen) {
      onConfirmOpen(url, 'url');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open Resource', `Unable to launch web browser for: ${url}`);
      }
    } catch {
      Alert.alert('Opening Error', 'An error occurred while opening the official link.');
    }
  };

  const handleCallPhone = async (phone: string) => {
    const telUrl = `tel:${phone.replace(/\s+/g, '')}`;
    if (onConfirmOpen) {
      onConfirmOpen(telUrl, 'tel');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(telUrl);
      if (supported) {
        await Linking.openURL(telUrl);
      } else {
        Alert.alert('Phone Dial Error', `Unable to initiate call to: ${phone}`);
      }
    } catch {
      Alert.alert('Dialing Error', 'An error occurred while opening the dialer.');
    }
  };

  const formattedDate = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <Icon name="safety" size={24} color={colors.secondary.main} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.authorityName}>{authorityName}</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Icon name="check-circle" size={12} color={colors.status.success} />
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
      </View>

      {/* Instructions / Explanation */}
      {instructions && <Text style={styles.instructions}>{instructions}</Text>}

      {/* Verification Date */}
      {formattedDate && (
        <Text style={styles.verifiedDate}>Official Authority • Verified {formattedDate}</Text>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        {websiteUrl && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleOpenUrl(websiteUrl)}
            activeOpacity={0.8}
          >
            <Icon name="external-link" size={16} color={colors.base.white} />
            <Text style={styles.primaryButtonText}>Open Official Portal</Text>
          </TouchableOpacity>
        )}

        {phoneNumber && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleCallPhone(phoneNumber)}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={16} color={colors.primary.main} />
            <Text style={styles.secondaryButtonText}>Call {phoneNumber}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.base.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  authorityName: {
    ...typography.bodyBold,
    color: colors.primary.main,
    fontSize: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.status.success,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  instructions: {
    ...typography.body,
    color: colors.base.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  verifiedDate: {
    ...typography.caption,
    color: colors.base.textMuted,
    fontSize: 11,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: colors.base.white,
    fontSize: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.base.divider,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  secondaryButtonText: {
    ...typography.bodyBold,
    color: colors.primary.main,
    fontSize: 12,
  },
});
