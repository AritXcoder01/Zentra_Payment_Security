export type TransactionType = 'CREDIT' | 'DEBIT' | 'OTHER';
export type TransactionSource = 'MANUAL' | 'SMS_PARSER' | 'NOTIFICATION' | 'API' | 'OTHER';
export type PaymentMode = 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'ATM' | 'OTHER';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ResourceType = 'WEBSITE' | 'PHONE' | 'EMAIL';

export interface UserProfile {
  id: string;
  mobileNumber: string;
  email?: string | null;
  fullName?: string | null;
  profilePhoto?: string | null;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amount: number | string;
  currency: string;
  transactionReference?: string | null;
  merchantName?: string | null;
  merchantVpa?: string | null;
  accountMask?: string | null;
  transactionDate: string;
  source: TransactionSource;
  createdAt: string;
}

export interface TransactionSummary {
  moneyIn: number;
  moneyOut: number;
  transactionCount: number;
}

export interface FraudCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  recommendedActions?: string[];
  isActive: boolean;
}

export interface FraudReport {
  id: string;
  userId: string;
  fraudCategoryId: string;
  paymentMode: PaymentMode;
  amount: number | string;
  currency: string;
  incidentDate: string;
  description: string;
  transactionReference?: string | null;
  transactionId?: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  fraudCategory?: FraudCategory;
}

export interface FraudGuidance {
  reportCategory: string;
  paymentMode: PaymentMode;
  severity: string;
  immediateActions: string[];
  safetyRecommendations: string[];
  officialResources: OfficialResource[];
}

export interface OfficialResource {
  id: string;
  authorityName: string;
  fraudCategoryId?: string | null;
  paymentMode?: PaymentMode | null;
  resourceType: ResourceType;
  websiteUrl?: string | null;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  instructions?: string | null;
  priority: number;
  isActive: boolean;
  lastVerifiedAt?: string | null;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  alertType: string;
  severity: SeverityLevel;
  title: string;
  message: string;
  fraudReportId?: string | null;
  transactionId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UserSession {
  id: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  currentSession: boolean;
  device?: {
    platform: string;
    deviceModel?: string | null;
    appVersion?: string | null;
  } | null;
}
