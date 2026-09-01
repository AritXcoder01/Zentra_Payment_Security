import { Platform } from 'react-native';

/**
 * Zentra Mobile Development API Target Modes:
 * - ANDROID_EMULATOR: 'http://10.0.2.2:3000/api/v1' (Android Emulator loopback to host PC)
 * - USB_PHYSICAL_DEVICE: 'http://localhost:3000/api/v1' (Physical phone via `adb reverse tcp:3000 tcp:3000`)
 */
export type DevTargetMode = 'ANDROID_EMULATOR' | 'USB_PHYSICAL_DEVICE';

export const ACTIVE_DEV_MODE: DevTargetMode = 'USB_PHYSICAL_DEVICE';

export const getApiBaseUrl = (mode: DevTargetMode = ACTIVE_DEV_MODE): string => {
  if (mode === 'USB_PHYSICAL_DEVICE') {
    return 'http://localhost:3000/api/v1';
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
};

export const isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const config = {
  apiBaseUrl: getApiBaseUrl(ACTIVE_DEV_MODE),
  appName: 'Zentra',
  appVersion: '1.0',
  isDemoMode: isDevelopment,
  demoOtpCode: isDevelopment ? '123456' : '',
};
