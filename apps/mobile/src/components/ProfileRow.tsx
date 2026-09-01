import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, typography } from '../theme';

interface ProfileRowProps {
  label: string;
  value?: string;
  icon?: string | IconName;
  badge?: string;
  onPress?: () => void;
  danger?: boolean;
}

export const ProfileRow: React.FC<ProfileRowProps> = ({
  label,
  value,
  icon,
  badge,
  onPress,
  danger = false,
}) => {
  const getIconName = (rawIcon?: string): IconName | null => {
    if (!rawIcon) return null;
    if (rawIcon === '👤') return 'user-info';
    if (rawIcon === '🔒' || rawIcon === '🔐') return 'security';
    if (rawIcon === '🖥' || rawIcon === '📱') return 'devices';
    if (rawIcon === '🛡') return 'safety';
    if (rawIcon === '📜' || rawIcon === '🕒') return 'history';
    if (rawIcon === '❓' || rawIcon === '🆘') return 'help';
    if (rawIcon === '🗑') return 'account-takeover';
    return (rawIcon as IconName) || 'user-info';
  };

  const iconName = getIconName(icon);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {iconName && (
        <View style={styles.iconContainer}>
          <Icon
            name={iconName}
            size={22}
            color={danger ? colors.status.danger : colors.primary.main}
          />
        </View>
      )}
      <View style={styles.textWrapper}>
        <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {onPress && (
        <Icon name="chevron-right" size={18} color={colors.base.textMuted} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.divider,
  },
  iconContainer: {
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    ...typography.bodyBold,
    color: colors.primary.main,
  },
  dangerLabel: {
    color: colors.status.danger,
  },
  value: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.status.success,
    fontWeight: '700',
  },
});
