import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { notificationParserService, ParsedTransactionCandidate } from './notification-parser.service';
import { apiClient } from '../api/client';
import { SecureAuthStorage } from './storage.service';

const NotificationListenerModule = NativeModules ? NativeModules.NotificationListenerModule : null;

export interface MediumConfidenceReviewItem {
  id: string;
  candidate: ParsedTransactionCandidate;
  receivedAt: string;
}

export const MAX_PENDING_QUEUE_SIZE = 25;
export const QUEUE_EXPIRY_MS = 72 * 60 * 60 * 1000; // 72 Hours

class NotificationBridgeService {
  private eventEmitter: NativeEventEmitter | null = null;
  private pendingQueue: ParsedTransactionCandidate[] = [];
  private mediumConfidenceListeners: ((item: MediumConfidenceReviewItem | null) => void)[] = [];
  private currentMediumItem: MediumConfidenceReviewItem | null = null;

  constructor() {
    if (Platform.OS === 'android' && NotificationListenerModule) {
      this.eventEmitter = new NativeEventEmitter(NotificationListenerModule);
    }
  }

  /**
   * Checks if Android Notification Listener Access is enabled.
   */
  async isNotificationListenerEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android' || !NotificationListenerModule) {
      return false;
    }
    try {
      return await NotificationListenerModule.isNotificationListenerEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Opens Android Notification Listener Settings UI.
   */
  async openNotificationListenerSettings(): Promise<boolean> {
    if (Platform.OS !== 'android' || !NotificationListenerModule) {
      return false;
    }
    try {
      return await NotificationListenerModule.openNotificationListenerSettings();
    } catch {
      return false;
    }
  }

  /**
   * Posts synthetic payment notification for DEVELOPMENT testing without real money.
   */
  async postSyntheticNotification(title: string, text: string): Promise<boolean> {
    if (Platform.OS === 'android' && NotificationListenerModule?.postSyntheticNotification) {
      try {
        await NotificationListenerModule.postSyntheticNotification(title, text);
        return true;
      } catch {
        return false;
      }
    } else {
      // Fallback for JS test environment
      const candidate = notificationParserService.parseNotification(title, text);
      if (!candidate) return false;

      if (candidate.confidence === 'HIGH') {
        return await this.processHighConfidenceCandidate(candidate);
      } else if (candidate.confidence === 'MEDIUM') {
        this.handleMediumConfidenceCandidate(candidate);
        return true;
      }
      return false;
    }
  }

  /**
   * Starts listening to native Android notification events and flushes pending native/offline queues.
   */
  initNotificationListener(onTransactionProcessed?: () => void, currentUserId?: string | null) {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener(
      'onNotificationReceived',
      async (event: { title?: string; text?: string; packageName?: string; timestamp?: string }) => {
        const candidate = notificationParserService.parseNotification(
          event.title,
          event.text,
          event.timestamp,
          currentUserId,
        );

        if (!candidate) return;

        if (candidate.confidence === 'HIGH') {
          await this.processHighConfidenceCandidate(candidate, onSuccess, currentUserId);
        } else if (candidate.confidence === 'MEDIUM') {
          this.handleMediumConfidenceCandidate(candidate);
        }
      },
    );

    const onSuccess = () => {
      if (onTransactionProcessed) onTransactionProcessed();
    };

    // Flush native SharedPreferences queue and persistent offline queue
    this.flushNativeAndOfflineQueue(onSuccess, currentUserId);
  }

  /**
   * Flushes native SharedPreferences queue (from when JS process was dead) & offline JS queue.
   */
  async flushNativeAndOfflineQueue(onSuccess?: () => void, currentUserId?: string | null) {
    // 1. Flush Native SharedPreferences Queue
    if (Platform.OS === 'android' && NotificationListenerModule?.getPendingNativeNotifications) {
      try {
        const pendingStr = await NotificationListenerModule.getPendingNativeNotifications();
        if (pendingStr && pendingStr !== '[]') {
          const rawItems: { title?: string; text?: string; timestamp?: string }[] = JSON.parse(pendingStr);
          for (const item of rawItems) {
            const candidate = notificationParserService.parseNotification(
              item.title,
              item.text,
              item.timestamp,
              currentUserId,
            );
            if (candidate && candidate.confidence === 'HIGH') {
              await this.processHighConfidenceCandidate(candidate, onSuccess, currentUserId);
            } else if (candidate && candidate.confidence === 'MEDIUM') {
              this.handleMediumConfidenceCandidate(candidate);
            }
          }
        }
      } catch {
        // Ignore native flush error
      }
    }

    // 2. Flush Offline JS Queue
    await this.flushPendingQueue(onSuccess, currentUserId);
  }

  /**
   * Automatically posts HIGH-confidence candidate to backend API.
   */
  async processHighConfidenceCandidate(
    candidate: ParsedTransactionCandidate,
    onSuccess?: () => void,
    currentUserId?: string | null,
  ): Promise<boolean> {
    // SECURITY GUARD: User Ownership Isolation
    if (candidate.userId && currentUserId && candidate.userId !== currentUserId) {
      // Candidate belongs to a different logged-out user account: DO NOT post to current user!
      return false;
    }

    const payload = {
      transactionType: candidate.transactionType,
      amount: candidate.amount,
      currency: candidate.currency,
      transactionReference: candidate.transactionReference || undefined,
      merchantName: candidate.merchantName || undefined,
      accountMask: candidate.accountMask || undefined,
      transactionDate: candidate.transactionDate,
      source: 'NOTIFICATION',
    };

    // STRICT PRIVACY VERIFICATION: Confirm NO raw notification text is included
    if (
      'rawNotification' in payload ||
      'notificationText' in payload ||
      'body' in payload ||
      'otp' in payload
    ) {
      return false;
    }

    try {
      const res = await apiClient.request('/transactions', 'POST', payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        return true;
      } else {
        await this.queueOfflineCandidate(candidate);
        return true; // Candidate queued safely
      }
    } catch {
      await this.queueOfflineCandidate(candidate);
      return true; // Candidate queued safely
    }
  }

  /**
   * Enqueues candidate metadata to protected offline queue with Max Size (25) & User Tagging.
   */
  private async queueOfflineCandidate(candidate: ParsedTransactionCandidate) {
    // Trim queue if size exceeds max allowed (25)
    while (this.pendingQueue.length >= MAX_PENDING_QUEUE_SIZE) {
      this.pendingQueue.shift(); // Remove oldest entry
    }

    this.pendingQueue.push(candidate);
    await SecureAuthStorage.setPendingNotificationQueue(
      JSON.stringify(this.pendingQueue),
    );
  }

  /**
   * Flushes offline queued candidates with Expiry (72h) & User Isolation.
   */
  async flushPendingQueue(onSuccess?: () => void, currentUserId?: string | null) {
    try {
      const storedQueueStr = await SecureAuthStorage.getPendingNotificationQueue();
      if (!storedQueueStr) return;

      const queue: ParsedTransactionCandidate[] = JSON.parse(storedQueueStr);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const now = Date.now();
      const remaining: ParsedTransactionCandidate[] = [];
      let anyProcessed = false;

      for (const candidate of queue) {
        const candidateTime = new Date(candidate.transactionDate).getTime();

        // 1. Expiry Check (72 Hours)
        if (now - candidateTime > QUEUE_EXPIRY_MS) {
          continue; // Expired queue item dropped!
        }

        // 2. User Isolation Check
        if (candidate.userId && currentUserId && candidate.userId !== currentUserId) {
          remaining.push(candidate); // Keep for original user, do not post to current user!
          continue;
        }

        const payload = {
          transactionType: candidate.transactionType,
          amount: candidate.amount,
          currency: candidate.currency,
          transactionReference: candidate.transactionReference || undefined,
          merchantName: candidate.merchantName || undefined,
          accountMask: candidate.accountMask || undefined,
          transactionDate: candidate.transactionDate,
          source: 'NOTIFICATION',
        };

        const res = await apiClient.request('/transactions', 'POST', payload);
        if (res.success) {
          anyProcessed = true;
        } else {
          remaining.push(candidate);
        }
      }

      this.pendingQueue = remaining;
      await SecureAuthStorage.setPendingNotificationQueue(
        JSON.stringify(remaining),
      );

      if (anyProcessed && onSuccess) {
        onSuccess();
      }
    } catch {
      // Ignore queue error
    }
  }

  /**
   * Handles MEDIUM-confidence candidates for user review.
   */
  private handleMediumConfidenceCandidate(candidate: ParsedTransactionCandidate) {
    const item: MediumConfidenceReviewItem = {
      id: candidate.fingerprint,
      candidate,
      receivedAt: new Date().toISOString(),
    };
    this.currentMediumItem = item;
    this.notifyMediumListeners(item);
  }

  subscribeMediumConfidence(listener: (item: MediumConfidenceReviewItem | null) => void) {
    this.mediumConfidenceListeners.push(listener);
    listener(this.currentMediumItem);
    return () => {
      this.mediumConfidenceListeners = this.mediumConfidenceListeners.filter((l) => l !== listener);
    };
  }

  private notifyMediumListeners(item: MediumConfidenceReviewItem | null) {
    this.mediumConfidenceListeners.forEach((l) => l(item));
  }

  async acceptMediumConfidenceCandidate(
    item: MediumConfidenceReviewItem,
    onSuccess?: () => void,
    currentUserId?: string | null,
  ): Promise<boolean> {
    const success = await this.processHighConfidenceCandidate(item.candidate, onSuccess, currentUserId);
    this.currentMediumItem = null;
    this.notifyMediumListeners(null);
    return success;
  }

  ignoreMediumConfidenceCandidate() {
    this.currentMediumItem = null;
    this.notifyMediumListeners(null);
  }

  async clearQueueOnLogout() {
    this.pendingQueue = [];
    this.currentMediumItem = null;
    this.notifyMediumListeners(null);
    await SecureAuthStorage.setPendingNotificationQueue('[]');
  }
}

export const notificationBridgeService = new NotificationBridgeService();
