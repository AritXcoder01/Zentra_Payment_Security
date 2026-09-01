import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// In-Memory Access Token Cache (High security: never saved to disk)
let inMemoryAccessToken: string | null = null;

/**
 * 1. SECURE AUTHENTICATION STORAGE (Android Keystore backed)
 * Stores sensitive authentication secrets (Refresh Token, Access Token, Pending Queue, Dedup Cache)
 */
export const SecureAuthStorage = {
  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'zentra_refresh_token' });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('zentra_auth_user', token, {
      service: 'zentra_refresh_token',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
  },

  async getAccessToken(): Promise<string | null> {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'zentra_access_token' });
      if (credentials) {
        inMemoryAccessToken = credentials.password;
        return credentials.password;
      }
      return null;
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    inMemoryAccessToken = token;
    await Keychain.setGenericPassword('zentra_auth_user', token, {
      service: 'zentra_access_token',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
  },

  async getPendingNotificationQueue(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'zentra_pending_notification_queue' });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },

  async setPendingNotificationQueue(queueJson: string): Promise<void> {
    await Keychain.setGenericPassword('zentra_auth_user', queueJson, {
      service: 'zentra_pending_notification_queue',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
  },

  async getPersistentDedupCache(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'zentra_persistent_dedup_cache' });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },

  async setPersistentDedupCache(cacheJson: string): Promise<void> {
    await Keychain.setGenericPassword('zentra_auth_user', cacheJson, {
      service: 'zentra_persistent_dedup_cache',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
  },

  async clearSecureTokens(): Promise<void> {
    inMemoryAccessToken = null;
    try {
      await Keychain.resetGenericPassword({ service: 'zentra_refresh_token' });
      await Keychain.resetGenericPassword({ service: 'zentra_access_token' });
      await Keychain.resetGenericPassword({ service: 'zentra_pending_notification_queue' });
      await Keychain.resetGenericPassword({ service: 'zentra_persistent_dedup_cache' });
    } catch {
      // Ignore reset error if service key missing
    }
  },
};

/**
 * 2. APP PREFERENCE STORAGE (AsyncStorage)
 * Stores NON-SENSITIVE local flags ONLY (Onboarding completion status).
 * Personal user data (email, name) is NEVER saved to AsyncStorage.
 */
const PREF_KEYS = {
  ONBOARDING_COMPLETED: 'zentra_pref_onboarding_completed',
};

export const AppPreferenceStorage = {
  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(PREF_KEYS.ONBOARDING_COMPLETED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await AsyncStorage.setItem(PREF_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
  },

  async clearPreferences(): Promise<void> {
    // Zero user data stored in AsyncStorage
  },
};

/**
 * Unified Storage Service Facade
 */
export const storageService = {
  // Secure Auth Token delegation
  getRefreshToken: SecureAuthStorage.getRefreshToken,
  setRefreshToken: SecureAuthStorage.setRefreshToken,
  getAccessToken: SecureAuthStorage.getAccessToken,
  setAccessToken: SecureAuthStorage.setAccessToken,
  getPendingNotificationQueue: SecureAuthStorage.getPendingNotificationQueue,
  setPendingNotificationQueue: SecureAuthStorage.setPendingNotificationQueue,
  getPersistentDedupCache: SecureAuthStorage.getPersistentDedupCache,
  setPersistentDedupCache: SecureAuthStorage.setPersistentDedupCache,
  clearSecureTokens: SecureAuthStorage.clearSecureTokens,

  // Preferences delegation
  getOnboardingCompleted: AppPreferenceStorage.getOnboardingCompleted,
  setOnboardingCompleted: AppPreferenceStorage.setOnboardingCompleted,

  // Compatibility stubs (returns null, stores nothing to AsyncStorage)
  getUserData: async () => null,
  setUserData: async (_user: any) => {},

  // Full Session Purge (Logout / Account Deletion / Expiration)
  async clearAuthSession(): Promise<void> {
    await SecureAuthStorage.clearSecureTokens();
    await AppPreferenceStorage.clearPreferences();
  },
};
