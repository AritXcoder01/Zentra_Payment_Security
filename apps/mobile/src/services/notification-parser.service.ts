import { SecureAuthStorage } from './storage.service';

export type ParsedTransactionType = 'CREDIT' | 'DEBIT' | 'OTHER';
export type ParsedConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ParsedTransactionCandidate {
  transactionType: ParsedTransactionType;
  amount: number;
  amountFormatted: string; // Exact 2-decimal string e.g. "1500.00", "1.50"
  currency: string;
  merchantName?: string | null;
  transactionReference?: string | null;
  accountMask?: string | null;
  transactionDate: string;
  source: 'NOTIFICATION';
  confidence: ParsedConfidence;
  fingerprint: string; // SHA-256 Hash e.g. "a3f9e01b..."
  userId?: string | null;
}

interface DedupRecord {
  fingerprintHash: string; // SHA-256 Hash ONLY
  createdAt: number;
  expiresAt: number;
}

// Synchronous SHA-256 Hash Digest Function
export function computeSha256(str: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);

  const bitLen = bytes.length * 8;
  const paddingLen = (bytes.length % 64 < 56) ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const padded = new Uint8Array(bytes.length + paddingLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setBigUint64(padded.length - 8, BigInt(bitLen), false);

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const w = new Uint32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t-15] >>> 7) | (w[t-15] << 25)) ^ ((w[t-15] >>> 18) | (w[t-15] << 14)) ^ (w[t-15] >>> 3);
      const s1 = ((w[t-2] >>> 17) | (w[t-2] << 15)) ^ ((w[t-2] >>> 19) | (w[t-2] << 13)) ^ (w[t-2] >>> 10);
      w[t] = (w[t-16] + s0 + w[t-7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}

// Ignore list patterns (OTP, promos, loans, KYC, security, failed/declined)
const IGNORE_PATTERNS = [
  /\bOTP\b/i,
  /\bone[- ]time[- ]password\b/i,
  /\bverification code\b/i,
  /\bsecret code\b/i,
  /\bpromo\b/i,
  /\bpromotional\b/i,
  /\bcashback offer\b/i,
  /\bloan\b/i,
  /\bcredit limit\b/i,
  /\bapply for\b/i,
  /\bpre[- ]approved\b/i,
  /\bKYC\b/i,
  /\bsecurity alert\b/i,
  /\blogin detected\b/i,
  /\bfailed\b/i,
  /\bdeclined\b/i,
  /\bunsuccessful\b/i,
  /\brejected\b/i,
];

// Amount RegEx: ₹1,250 | ₹1250.50 | Rs. 1250 | INR 1,250.50 | Rs 1250.00
const AMOUNT_REGEX = /(?:₹|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;

// Debit verbs
const DEBIT_REGEX = /\b(debited|paid|spent|purchase|sent|withdrawn|charged|debit)\b/i;

// Credit / Refund verbs
const CREDIT_REGEX = /\b(credited|received|added|deposited|credit)\b/i;
const REFUND_REGEX = /\b(refunded|reversed|reversal|refund)\b/i;

// Reference RegEx: UTR 123456789012 | Ref 12345678 | Txn ID 987654321
const REF_REGEX = /(?:UTR|Ref(?:erence)?|Txn\s*ID|Transaction\s*ID)\s*[:#-]?\s*([A-Za-z0-9]{6,20})/i;

// Masked Account RegEx: A/c XX1234 | Card ending 5678 | ****1234
const MASK_REGEX = /(?:A\/c|Acct|Account|Card)\s*(?:ending|no\.?|num)?\s*[:#-]?\s*([X*]{2,12}\d{3,4}|\d{4})/i;

// Merchant RegEx: at Starbucks | to PhonePe Merchant | paid to Zomato | for Amazon
const MERCHANT_REGEX = /(?:at|paid to|for|to)\s+([A-Za-z0-9&.-]+(?:\s+[A-Za-z0-9&.-]+)*?)(?=\s+via|\s+on|\s+ref|\s+a\/c|\s+using|\.|$)/i;

class NotificationParserService {
  private persistentDedupCache = new Map<string, DedupRecord>();
  private readonly DEDUP_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 Hours

  constructor() {
    this.loadPersistentDedup();
  }

  private async loadPersistentDedup() {
    try {
      const jsonStr = await SecureAuthStorage.getPersistentDedupCache();
      if (jsonStr) {
        const records: DedupRecord[] = JSON.parse(jsonStr);
        const now = Date.now();
        records.forEach((r) => {
          if (r.expiresAt > now) {
            this.persistentDedupCache.set(r.fingerprintHash, r);
          }
        });
      }
    } catch {
      // Ignore load error
    }
  }

  private async savePersistentDedup() {
    try {
      const records = Array.from(this.persistentDedupCache.values());
      await SecureAuthStorage.setPersistentDedupCache(JSON.stringify(records));
    } catch {
      // Ignore save error
    }
  }

  /**
   * Helper to format currency amount into exact 2-decimal string e.g. "1500.00", "1.50"
   */
  formatAmountDecimal(rawAmountStr: string): string {
    const cleanStr = rawAmountStr.replace(/,/g, '');
    const num = parseFloat(cleanStr);
    if (isNaN(num) || num <= 0) return '0.00';
    return num.toFixed(2);
  }

  /**
   * Parses raw notification title and text on-device.
   * ABSOLUTELY NO raw notification content is returned or stored outside this function scope.
   */
  parseNotification(
    title: string | null | undefined,
    body: string | null | undefined,
    timestampIso?: string,
    currentUserId?: string | null,
  ): ParsedTransactionCandidate | null {
    const text = `${title || ''} ${body || ''}`.trim();
    if (!text) return null;

    // 1. Filter out ignore patterns (OTP, promos, loans, KYC, failed transactions)
    for (const pattern of IGNORE_PATTERNS) {
      if (pattern.test(text)) {
        return null;
      }
    }

    // 2. Extract Amount & Format Precision
    const amountMatch = text.match(AMOUNT_REGEX);
    if (!amountMatch) return null;

    const amountFormatted = this.formatAmountDecimal(amountMatch[1]);
    const amount = parseFloat(amountFormatted);
    if (amount <= 0) return null;

    // 3. Determine Transaction Type (DEBIT, CREDIT, or REFUND/REVERSAL)
    const isDebit = DEBIT_REGEX.test(text);
    const isCredit = CREDIT_REGEX.test(text);
    const isRefund = REFUND_REGEX.test(text);

    if (!isDebit && !isCredit && !isRefund) {
      return null;
    }

    let transactionType: ParsedTransactionType = 'DEBIT';
    if (isCredit || isRefund) {
      transactionType = 'CREDIT';
    }

    // 4. Extract Merchant / Payee Name
    let merchantName: string | null = null;
    const merchantMatch = text.match(MERCHANT_REGEX);
    if (merchantMatch) {
      const candidate = merchantMatch[1].trim();
      if (candidate && !/^(UPI|Card|Bank|Account|Ref|INR|Rs|A\/c)$/i.test(candidate)) {
        merchantName = candidate;
      }
    }

    if (isRefund) {
      merchantName = merchantName ? `Reversal: ${merchantName}` : 'Transaction Reversal / Refund';
    }

    // 5. Extract Reference (UTR / TxID)
    let transactionReference: string | null = null;
    const refMatch = text.match(REF_REGEX);
    if (refMatch) {
      transactionReference = refMatch[1];
    }

    // 6. Extract Account Mask
    let accountMask: string | null = null;
    const maskMatch = text.match(MASK_REGEX);
    if (maskMatch) {
      accountMask = maskMatch[1];
      if (!accountMask.startsWith('X') && !accountMask.startsWith('*')) {
        accountMask = `XX${accountMask}`;
      }
    }

    // 7. Determine Confidence Level
    const hasFinancialKeywords = /\b(UPI|Card|Bank|Account|A\/c|Wallet|ATM|NetBanking|Salary|Ref|UTR)\b/i.test(text);

    let confidence: ParsedConfidence = 'LOW';

    if (isRefund) {
      // Reversals/Refunds require MEDIUM confidence to mandate user review
      confidence = 'MEDIUM';
    } else if (hasFinancialKeywords && (transactionReference || merchantName || accountMask)) {
      confidence = 'HIGH';
    } else if (hasFinancialKeywords || merchantName) {
      confidence = 'MEDIUM';
    }

    if (confidence === 'LOW') return null;

    // 8. Generate SHA-256 Fingerprint Hash (Raw normalized string dropped immediately!)
    const dateBucket = (timestampIso ? new Date(timestampIso) : new Date()).toISOString().substring(0, 10);
    const refKey = transactionReference || `${merchantName || 'NONE'}:${amountFormatted}`;
    const rawFingerprint = `NOTIFICATION:${amountFormatted}:${transactionType}:${refKey}:${dateBucket}`;
    const fingerprintHash = computeSha256(rawFingerprint);

    // 9. Check Persistent SHA-256 Deduplication Cache
    if (this.isDuplicate(fingerprintHash)) {
      return null;
    }

    return {
      transactionType,
      amount,
      amountFormatted,
      currency: 'INR',
      merchantName,
      transactionReference,
      accountMask,
      transactionDate: timestampIso || new Date().toISOString(),
      source: 'NOTIFICATION',
      confidence,
      fingerprint: fingerprintHash,
      userId: currentUserId || null,
    };
  }

  /**
   * Checks if fingerprint SHA-256 hash has already been processed within 48 hours.
   */
  isDuplicate(fingerprintHash: string): boolean {
    const now = Date.now();
    this.cleanExpiredDedup(now);

    if (this.persistentDedupCache.has(fingerprintHash)) {
      return true;
    }

    const record: DedupRecord = {
      fingerprintHash,
      createdAt: now,
      expiresAt: now + this.DEDUP_EXPIRY_MS,
    };
    this.persistentDedupCache.set(fingerprintHash, record);
    this.savePersistentDedup();
    return false;
  }

  private cleanExpiredDedup(now: number) {
    for (const [key, record] of this.persistentDedupCache.entries()) {
      if (now > record.expiresAt) {
        this.persistentDedupCache.delete(key);
      }
    }
  }

  public async clearDedupCache() {
    this.persistentDedupCache.clear();
    await this.savePersistentDedup();
  }
}

export const notificationParserService = new NotificationParserService();
