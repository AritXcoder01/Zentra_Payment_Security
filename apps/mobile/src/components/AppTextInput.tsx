import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, typography } from '../theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  badge?: string;
  containerStyle?: ViewStyle;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  prefix,
  badge,
  containerStyle,
  editable = true,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      )}
      <View style={[styles.inputWrapper, !editable && styles.disabledInput, !!error && styles.errorBorder]}>
        {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
        <TextInput
          style={[styles.input, !editable && styles.disabledText, style]}
          placeholderTextColor={colors.base.textMuted}
          editable={editable}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    ...typography.caption,
    color: colors.base.textSecondary,
    fontWeight: '600',
  },
  badgeContainer: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.status.success,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: colors.base.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingHorizontal: 14,
  },
  disabledInput: {
    backgroundColor: colors.base.divider,
    borderColor: colors.base.border,
  },
  prefixText: {
    ...typography.bodyBold,
    color: colors.primary.main,
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.base.textPrimary,
  },
  disabledText: {
    color: colors.base.textSecondary,
  },
  errorBorder: {
    borderColor: colors.status.danger,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    marginTop: 4,
  },
});
