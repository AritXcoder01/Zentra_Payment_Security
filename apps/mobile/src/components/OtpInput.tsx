import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface OtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChangeText, length = 6 }) => {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    onChangeText(cleaned);
  };

  const digits = value.split('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={length}
        value={value}
        onChangeText={handleChange}
        autoFocus
      />
      {Array.from({ length }).map((_, index) => {
        const char = digits[index] || '';
        const isFocused = value.length === index || (value.length === length && index === length - 1);
        return (
          <View key={index} style={[styles.box, isFocused && styles.focusedBox, !!char && styles.filledBox]}>
            <TextInput
              style={styles.boxText}
              value={char}
              editable={false}
              pointerEvents="none"
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    position: 'relative',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    zIndex: 10,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.base.border,
    backgroundColor: colors.base.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedBox: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.secondary.subtle,
  },
  filledBox: {
    borderColor: colors.primary.main,
  },
  boxText: {
    ...typography.h2,
    color: colors.primary.main,
    textAlign: 'center',
  },
});
