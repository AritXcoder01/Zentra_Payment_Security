import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { DangerButton } from './DangerButton';
import { SecondaryButton } from './SecondaryButton';
import { glassmorphism, colors, typography } from '../theme';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.warningIconWrapper}>
            <Icon name="alert-triangle" size={24} color={colors.status.danger} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonColumn}>
            <DangerButton
              title={confirmLabel}
              onPress={onConfirm}
              disabled={loading}
              style={styles.confirmBtn}
            />
            <SecondaryButton title={cancelLabel} onPress={onCancel} disabled={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    ...glassmorphism.modal,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  warningIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.status.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    ...typography.body,
    color: colors.base.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonColumn: {
    width: '100%',
  },
  confirmBtn: {
    marginBottom: 10,
  },
});
