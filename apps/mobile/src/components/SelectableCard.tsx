import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, typography } from '../theme';

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  icon?: string | IconName;
  selected: boolean;
  onPress: () => void;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  subtitle,
  icon,
  selected,
  onPress,
}) => {
  const getIconName = (rawIcon?: string): IconName | null => {
    if (!rawIcon) return null;
    if (rawIcon === '⇄') return 'wrong-recipient';
    if (rawIcon === '🔒') return 'unauthorized-transaction';
    if (rawIcon === '⚡') return 'upi-fraud';
    if (rawIcon === '💳') return 'card-fraud';
    if (rawIcon === '✉') return 'phishing';
    if (rawIcon === '📞') return 'fake-customer-care';
    if (rawIcon === '🔑') return 'otp-scam';
    if (rawIcon === '📉') return 'investment-scam';
    if (rawIcon === '🚫') return 'account-takeover';
    if (rawIcon === '📱') return 'sim-related';
    if (rawIcon === '🏛') return 'bank-transfer';
    if (rawIcon === '💻') return 'net-banking';
    if (rawIcon === '👛') return 'wallet';
    if (rawIcon === '🏧') return 'atm';
    return (rawIcon as IconName) || 'safety';
  };

  const iconName = getIconName(icon);

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentRow}>
        {iconName && (
          <View style={styles.iconContainer}>
            <Icon
              name={iconName}
              size={28}
              color={selected ? colors.secondary.main : colors.primary.main}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, selected && styles.selectedTitle]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.radio, selected && styles.selectedRadio]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.base.border,
  },
  selectedCard: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.secondary.subtle,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    color: colors.primary.main,
  },
  selectedTitle: {
    color: colors.secondary.main,
  },
  subtitle: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.base.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: colors.secondary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary.main,
  },
});
