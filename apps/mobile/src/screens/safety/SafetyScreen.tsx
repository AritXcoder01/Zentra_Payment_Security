import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Icon, IconName } from '../../components/Icon';
import { colors, typography } from '../../theme';
import { formatINR } from '../../utils/formatters';
import { config, isDevelopment } from '../../config/config';
import {
  notificationBridgeService,
  MediumConfidenceReviewItem,
} from '../../services/notification-bridge.service';

interface SafetyTopic {
  iconName: IconName;
  title: string;
  text: string;
}

const SAFETY_TOPICS: SafetyTopic[] = [
  {
    iconName: 'safety',
    title: 'Protect Your UPI & QR Code',
    text: 'Remember: Scanning a QR code or entering your UPI PIN is ALWAYS for paying money, NEVER for receiving money. No bank or buyer requires your PIN to credit funds to you.',
  },
  {
    iconName: 'phishing',
    title: 'Recognize Phishing Links',
    text: 'Never click on SMS links claiming your bank account or SIM card will be blocked unless verified through official banking apps. Official banks do not send bit.ly or apk links.',
  },
  {
    iconName: 'card-fraud',
    title: 'Card & ATM Security Guidance',
    text: 'Enable online transaction limits on your debit/credit cards. Turn off international transactions when not traveling abroad.',
  },
  {
    iconName: 'otp-scam',
    title: 'Keep OTPs & Passwords Private',
    text: 'Zentra, your bank, and government officials will NEVER ask for your OTP, UPI PIN, ATM PIN, or password over call, SMS, or WhatsApp.',
  },
  {
    iconName: 'help',
    title: 'Avoid Fake Helpline Numbers',
    text: 'Never search Google or social media for customer care numbers. Always find helpline contacts printed directly on the back of your debit card or inside your official banking app.',
  },
];

export const SafetyScreen: React.FC = () => {
  const [listenerEnabled, setListenerEnabled] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [syntheticModalVisible, setSyntheticModalVisible] = useState(false);
  const [mediumReviewItem, setMediumReviewItem] = useState<MediumConfidenceReviewItem | null>(null);

  const checkStatus = useCallback(async () => {
    const enabled = await notificationBridgeService.isNotificationListenerEnabled();
    setListenerEnabled(enabled);
  }, []);

  useEffect(() => {
    checkStatus();
    const unsubscribe = notificationBridgeService.subscribeMediumConfidence((item) => {
      setMediumReviewItem(item);
    });
    return () => {
      unsubscribe();
    };
  }, [checkStatus]);

  const handleToggleAccess = async () => {
    await notificationBridgeService.openNotificationListenerSettings();
    setTimeout(checkStatus, 1500);
  };

  const handleAcceptMedium = async () => {
    if (!mediumReviewItem) return;
    await notificationBridgeService.acceptMediumConfidenceCandidate(mediumReviewItem);
  };

  const handleIgnoreMedium = () => {
    notificationBridgeService.ignoreMediumConfidenceCandidate();
  };

  const triggerSyntheticTest = async (title: string, text: string) => {
    const ok = await notificationBridgeService.postSyntheticNotification(title, text);
    if (ok) {
      Alert.alert('Synthetic Notification Processed', `Test payload processed safely:\n"${title}: ${text}"`);
    } else {
      Alert.alert('Ignored / Rejection Correct', `Notification was correctly ignored/filtered by native parser:\n"${text}"`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Security & Safety Center</Text>
        <Text style={styles.subtitle}>
          Educational guidance to help you recognize and avoid online payment fraud.
        </Text>
      </View>

      {/* Payment Activity Detection Card */}
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconMargin}>
            <Icon name="devices" size={24} color={colors.primary.main} />
          </View>
          <Text style={styles.cardTitle}>Payment Activity Detection</Text>
          <View
            style={[
              styles.statusBadge,
              listenerEnabled ? styles.statusBadgeOn : styles.statusBadgeOff,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                listenerEnabled ? styles.statusTextOn : styles.statusTextOff,
              ]}
            >
              {listenerEnabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardText}>
          Zentra can optionally read eligible payment notifications on your device to identify transaction activity. Notification content is processed on your device. Only structured transaction details needed for your activity history are sent to your Zentra account.
        </Text>

        <Text style={styles.privacyNote}>
          Privacy Guarantee: Raw notification content is processed on your device and is not uploaded to Zentra.
        </Text>

        <View style={styles.btnRow}>
          <PrimaryButton
            title={listenerEnabled ? 'Manage Notification Access' : 'Enable Notification Access'}
            onPress={handleToggleAccess}
            style={styles.actionBtn}
          />
          <TouchableOpacity
            style={styles.infoLink}
            onPress={() => setInfoModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.infoLinkText}>How Detection Works</Text>
          </TouchableOpacity>

          {isDevelopment && (
            <SecondaryButton
              title="⚡ Test Synthetic Payment Notifications (DEV)"
              onPress={() => setSyntheticModalVisible(true)}
              style={styles.syntheticBtn}
            />
          )}
        </View>
      </GlassCard>

      {/* Medium Confidence Review Card */}
      {mediumReviewItem && (
        <GlassCard style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconMargin}>
              <Icon name="alerts" size={22} color="#D97706" />
            </View>
            <Text style={styles.reviewTitle}>Possible Payment Detected</Text>
          </View>
          <Text style={styles.reviewAmount}>
            {formatINR(mediumReviewItem.candidate.amount)} ({mediumReviewItem.candidate.transactionType})
          </Text>
          {mediumReviewItem.candidate.merchantName && (
            <Text style={styles.reviewSub}>
              Merchant: {mediumReviewItem.candidate.merchantName}
            </Text>
          )}
          <Text style={styles.reviewSub}>Source: Android Payment Notification</Text>

          <View style={styles.reviewBtnRow}>
            <PrimaryButton
              title="Add to Activity"
              onPress={handleAcceptMedium}
              style={styles.reviewBtn}
            />
            <SecondaryButton
              title="Ignore"
              onPress={handleIgnoreMedium}
              style={styles.reviewBtn}
            />
          </View>
        </GlassCard>
      )}

      {/* Educational Guidance Cards */}
      {SAFETY_TOPICS.map((topic, index) => (
        <GlassCard key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconMargin}>
              <Icon name={topic.iconName} size={22} color={colors.primary.main} />
            </View>
            <Text style={styles.cardTitle}>{topic.title}</Text>
          </View>
          <Text style={styles.cardText}>{topic.text}</Text>
        </GlassCard>
      ))}

      {/* How Detection Works Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>How Payment Detection Works</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalSubHeader}>What Zentra reads:</Text>
              <Text style={styles.modalBodyText}>
                Eligible Android payment notifications from installed bank and UPI applications.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSubHeader}>What Zentra extracts:</Text>
              <Text style={styles.modalBodyText}>
                Transaction amount, type (Debit/Credit), reference number (UTR/TxID), and merchant/payee name where available.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSubHeader}>What stays on your device:</Text>
              <Text style={styles.modalBodyText}>
                Raw notification title, full notification message body, and non-financial content remain strictly on your phone.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSubHeader}>What is sent to Zentra:</Text>
              <Text style={styles.modalBodyText}>
                Only structured transaction metadata needed to record your activity history.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSubHeader}>How to disable:</Text>
              <Text style={styles.modalBodyText}>
                Open Android Notification Access settings at any time and turn off access for Zentra.
              </Text>
            </View>

            <PrimaryButton
              title="Got It"
              onPress={() => setInfoModalVisible(false)}
              style={styles.modalCloseBtn}
            />
          </GlassCard>
        </View>
      </Modal>

      {/* DEV ONLY Synthetic Notification Testing Modal */}
      <Modal
        visible={syntheticModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSyntheticModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Synthetic Notification Test Suite</Text>
            <Text style={styles.modalSubtitleText}>
              Development tool for physical/emulator testing without spending real money.
            </Text>

            <ScrollView style={styles.syntheticScroll}>
              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('HDFC Bank', 'Rs. 1,500.00 debited from A/c XX4321 at Starbucks via UPI Ref 123456789012')}
              >
                <Text style={styles.testTitle}>1. Synthetic UPI Debit (₹1,500.00)</Text>
                <Text style={styles.testDesc}>High confidence → Auto-adds transaction</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('Axis Bank', '₹ 12,500.00 credited to A/c XX9988 by Ramesh Sharma via UPI UTR 987654321012')}
              >
                <Text style={styles.testTitle}>2. Synthetic UPI Credit (₹12,500.00)</Text>
                <Text style={styles.testDesc}>High confidence → Auto-adds credit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('HDFC Bank Cards', 'Spent INR 2,499.00 at D-Mart using Card ending 1234')}
              >
                <Text style={styles.testTitle}>3. Synthetic Card Debit (₹2,499.00)</Text>
                <Text style={styles.testDesc}>High confidence → Card account mask</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('Paytm Alert', 'INR 350.00 refunded for Zomato order via UPI Ref 778899')}
              >
                <Text style={styles.testTitle}>4. Synthetic Refund / Reversal (₹350.00)</Text>
                <Text style={styles.testDesc}>Medium confidence → Requires review</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('SBI Card', 'Your OTP for Rs 5000 at Flipkart is 458912. Never share OTP.')}
              >
                <Text style={styles.testTitle}>5. Synthetic OTP Message</Text>
                <Text style={styles.testDesc}>Native filter → IGNORED</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('Bank Offer', 'Get up to ₹ 500 cashback offer on your next UPI transaction!')}
              >
                <Text style={styles.testTitle}>6. Synthetic Promotional Ad</Text>
                <Text style={styles.testDesc}>Native filter → IGNORED</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testItem}
                onPress={() => triggerSyntheticTest('UPI Alert', 'Transaction of ₹ 1500 failed due to insufficient funds in A/c XX1234')}
              >
                <Text style={styles.testTitle}>7. Synthetic Failed Transaction</Text>
                <Text style={styles.testDesc}>Native filter → IGNORED</Text>
              </TouchableOpacity>
            </ScrollView>

            <SecondaryButton
              title="Close Test Suite"
              onPress={() => setSyntheticModalVisible(false)}
              style={styles.modalCloseBtn}
            />
          </GlassCard>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
    lineHeight: 20,
  },
  card: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconMargin: {
    marginRight: 10,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primary.main,
    flex: 1,
  },
  cardText: {
    ...typography.body,
    color: colors.base.textSecondary,
    lineHeight: 20,
  },
  privacyNote: {
    ...typography.caption,
    color: colors.primary.main,
    marginTop: 8,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeOn: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeOff: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextOn: {
    color: '#15803D',
  },
  statusTextOff: {
    color: '#64748B',
  },
  btnRow: {
    marginTop: 14,
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    width: '100%',
  },
  syntheticBtn: {
    marginTop: 4,
    width: '100%',
  },
  infoLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLinkText: {
    ...typography.caption,
    color: colors.primary.main,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  reviewCard: {
    marginBottom: 14,
    borderColor: '#F59E0B',
    borderWidth: 1,
    backgroundColor: '#FFFBEB',
  },
  reviewTitle: {
    ...typography.h3,
    color: '#92400E',
    flex: 1,
  },
  reviewAmount: {
    ...typography.h2,
    color: '#B45309',
    marginVertical: 4,
  },
  reviewSub: {
    ...typography.caption,
    color: '#78350F',
  },
  reviewBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  reviewBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    padding: 20,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.primary.main,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitleText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginBottom: 14,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 10,
  },
  modalSubHeader: {
    ...typography.h3,
    fontSize: 14,
    color: colors.primary.main,
    marginBottom: 2,
  },
  modalBodyText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    lineHeight: 18,
  },
  modalCloseBtn: {
    marginTop: 14,
  },
  syntheticScroll: {
    maxHeight: 280,
    marginVertical: 6,
  },
  testItem: {
    padding: 10,
    backgroundColor: colors.base.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.base.border,
  },
  testTitle: {
    ...typography.h3,
    fontSize: 13,
    color: colors.primary.main,
  },
  testDesc: {
    ...typography.caption,
    color: colors.base.textSecondary,
    marginTop: 2,
  },
});
