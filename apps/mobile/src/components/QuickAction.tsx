import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, typography } from '../theme';

interface QuickActionProps {
  title: string;
  subtitle?: string;
  icon: string | IconName;
  onPress: () => void;
  highlight?: boolean;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  highlight = false,
}) => {
  const getIconName = (rawIcon: string): IconName => {
    if (rawIcon === '🚨') return 'report-fraud';
    if (rawIcon === '📊') return 'check-activity';
    if (rawIcon === '📖') return 'safety-guide';
    if (rawIcon === '🆘') return 'emergency-help';
    if (rawIcon === '📜') return 'history';
    return (rawIcon as IconName) || 'safety';
  };

  const iconName = getIconName(icon);

  return (
    <TouchableOpacity
      style={[styles.container, highlight && styles.highlightContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, highlight && styles.highlightIconWrapper]}>
        <Icon
          name={iconName}
          size={28}
          color={highlight ? colors.base.white : colors.primary.main}
        />
      </View>
      <Text style={[styles.title, highlight && styles.highlightTitle]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.white,
    borderRadius: 16,
    padding: 14,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.base.border,
    alignItems: 'flex-start',
  },
  highlightContainer: {
    backgroundColor: colors.secondary.subtle,
    borderColor: colors.secondary.main,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.base.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightIconWrapper: {
    backgroundColor: colors.secondary.main,
  },
  title: {
    ...typography.bodyBold,
    color: colors.primary.main,
    fontSize: 13,
  },
  highlightTitle: {
    color: colors.secondary.main,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.base.textSecondary,
    marginTop: 2,
  },
});
