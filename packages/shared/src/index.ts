export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  timestamp: string;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum ServiceStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED',
}

export interface HealthCheckResponse {
  status: ServiceStatus;
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  dependencies: {
    database: {
      status: ServiceStatus;
      latencyMs?: number;
      error?: string;
    };
    redis: {
      status: ServiceStatus;
      latencyMs?: number;
      error?: string;
    };
  };
}

/**
 * Mobile Number Normalization Utility
 * Accepts Indian numbers (+91, 91, 0, or 10 digits) and normalizes to standard +91XXXXXXXXXX E.164 format.
 * Throws an Error if format is invalid.
 */
export function normalizeMobileNumber(mobile: string): string {
  if (!mobile || typeof mobile !== 'string') {
    throw new Error('Mobile number must be a non-empty string');
  }

  // Remove spaces, hyphens, parentheses
  const cleaned = mobile.trim().replace(/[\s\-\(\)]/g, '');

  let digitsOnly = cleaned;
  if (cleaned.startsWith('+')) {
    digitsOnly = cleaned.substring(1);
  }

  // Handle Indian country code 91
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    digitsOnly = digitsOnly.substring(2);
  } else if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    digitsOnly = digitsOnly.substring(1);
  }

  // Validate 10-digit Indian mobile number starting with 6, 7, 8, 9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(digitsOnly)) {
    throw new Error('Invalid mobile number format. Expected valid 10-digit Indian mobile number.');
  }

  return `+91${digitsOnly}`;
}

/**
 * Extracts plain 12-digit number (91XXXXXXXXXX) for providers like MSG91
 */
export function toMsg91MobileFormat(mobile: string): string {
  const normalized = normalizeMobileNumber(mobile);
  return normalized.replace('+', '');
}
