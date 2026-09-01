import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading Zentra...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.secondary.main} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.base.background,
  },
  message: {
    ...typography.body,
    color: colors.base.textSecondary,
    marginTop: 12,
  },
});
