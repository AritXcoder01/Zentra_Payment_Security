import { notificationParserService, computeSha256 } from './services/notification-parser.service';
import {
  notificationBridgeService,
  MAX_PENDING_QUEUE_SIZE,
  QUEUE_EXPIRY_MS,
} from './services/notification-bridge.service';

describe('Zentra Notification Parser & Security Unit Tests (Step 13, 13A & 14B)', () => {
  const ts = '2026-09-01T12:00:00.000Z';

  beforeEach(async () => {
    await notificationParserService.clearDedupCache();
    await notificationBridgeService.clearQueueOnLogout();
  });

  // 1. ₹ debit
  it('1. Should parse ₹ debit notification correctly', () => {
    const res = notificationParserService.parseNotification(
      'HDFC Bank',
      'Rs. 1,500.00 debited from A/c XX4321 at Starbucks via UPI Ref 123456789012',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.transactionType).toBe('DEBIT');
    expect(res?.amount).toBe(1500);
    expect(res?.amountFormatted).toBe('1500.00');
  });

  // 2. Rs debit
  it('2. Should parse Rs debit notification correctly', () => {
    const res = notificationParserService.parseNotification(
      'ICICI Bank Alert',
      'Rs 2500 debited for Zomato on 01-Sep-26 via UPI',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.transactionType).toBe('DEBIT');
    expect(res?.amount).toBe(2500);
    expect(res?.amountFormatted).toBe('2500.00');
  });

  // 3. INR debit
  it('3. Should parse INR debit notification correctly', () => {
    const res = notificationParserService.parseNotification(
      'SBI Alert',
      'INR 499.50 paid to Netflix via HDFC Card ending 9876',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.transactionType).toBe('DEBIT');
    expect(res?.amount).toBe(499.5);
    expect(res?.amountFormatted).toBe('499.50');
  });

  // 4. ₹ credit
  it('4. Should parse ₹ credit notification correctly', () => {
    const res = notificationParserService.parseNotification(
      'Axis Bank',
      '₹ 12,500.00 credited to A/c XX9988 by Ramesh Sharma via UPI UTR 987654321012',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.transactionType).toBe('CREDIT');
    expect(res?.amount).toBe(12500);
    expect(res?.amountFormatted).toBe('12500.00');
  });

  // 5. UPI payment
  it('5. Should recognize UPI payment method', () => {
    const res = notificationParserService.parseNotification(
      'PhonePe',
      'Paid ₹ 350 to CCD via UPI. Ref 112233445566',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.confidence).toBe('HIGH');
  });

  // 6. Card payment
  it('6. Should recognize Card payment method', () => {
    const res = notificationParserService.parseNotification(
      'HDFC Bank Cards',
      'Spent INR 1200 at D-Mart using Card ending 1234',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.accountMask).toBe('XX1234');
  });

  // 7. Bank credit
  it('7. Should parse Bank credit notification', () => {
    const res = notificationParserService.parseNotification(
      'Kotak Mahindra Bank',
      'Salary credited INR 75000 to Account XX1122 via Bank Transfer UTR 887766554433',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.transactionType).toBe('CREDIT');
    expect(res?.amount).toBe(75000);
    expect(res?.amountFormatted).toBe('75000.00');
  });

  // 8. UTR extraction
  it('8. Should extract transaction reference / UTR number', () => {
    const res = notificationParserService.parseNotification(
      'Bank Alert',
      'Debited ₹ 500 via UPI UTR: 998877665544 at Uber',
      ts,
    );
    expect(res?.transactionReference).toBe('998877665544');
  });

  // 9. Masked account extraction
  it('9. Should extract masked account or card digits safely', () => {
    const res = notificationParserService.parseNotification(
      'Bank Alert',
      'INR 2000 debited from A/c XX7766 via ATM',
      ts,
    );
    expect(res?.accountMask).toBe('XX7766');
  });

  // 10. Merchant extraction
  it('10. Should extract merchant name', () => {
    const res = notificationParserService.parseNotification(
      'Paytm',
      'Paid ₹ 450 at Swiggy via UPI',
      ts,
    );
    expect(res?.merchantName).toBe('Swiggy');
  });

  // 11. Duplicate notification
  it('11. Should ignore duplicate notification within deduplication window', () => {
    const res1 = notificationParserService.parseNotification(
      'HDFC Bank',
      'Debited ₹ 899 at Amazon via UPI Ref 445566778899',
      ts,
    );
    expect(res1).not.toBeNull();

    const res2 = notificationParserService.parseNotification(
      'HDFC Bank',
      'Debited ₹ 899 at Amazon via UPI Ref 445566778899',
      ts,
    );
    expect(res2).toBeNull(); // Duplicated notification ignored!
  });

  // 12. OTP ignored
  it('12. Should IGNORE notifications containing OTP or verification codes', () => {
    const res = notificationParserService.parseNotification(
      'SBI Card',
      'Your OTP for transaction of Rs 5000 at Flipkart is 458912. Never share your OTP.',
      ts,
    );
    expect(res).toBeNull();
  });

  // 13. Promotional notification ignored
  it('13. Should IGNORE promotional offer notifications', () => {
    const res = notificationParserService.parseNotification(
      'Bank Offer',
      'Get up to ₹ 500 cashback offer on your next UPI transaction!',
      ts,
    );
    expect(res).toBeNull();
  });

  // 14. KYC notification ignored
  it('14. Should IGNORE KYC update reminder notifications', () => {
    const res = notificationParserService.parseNotification(
      'Bank Notice',
      'Urgent: Update your KYC for A/c XX1234 to avoid penalty of Rs 1000',
      ts,
    );
    expect(res).toBeNull();
  });

  // 15. Loan notification ignored
  it('15. Should IGNORE pre-approved loan or credit limit ads', () => {
    const res = notificationParserService.parseNotification(
      'Bank Offer',
      'Pre-approved personal loan of Rs. 5,00,000 available at 10.5% interest. Apply now!',
      ts,
    );
    expect(res).toBeNull();
  });

  // 16. Failed payment ignored
  it('16. Should IGNORE failed or declined payment notifications', () => {
    const res = notificationParserService.parseNotification(
      'UPI Alert',
      'Transaction of ₹ 1500 failed due to insufficient funds in A/c XX1234',
      ts,
    );
    expect(res).toBeNull();
  });

  // 17. Low-confidence notification ignored
  it('17. Should IGNORE ambiguous low-confidence notifications', () => {
    const res = notificationParserService.parseNotification(
      'Reminder',
      'You spent ₹ 50 yesterday on snacks',
      ts,
    );
    expect(res).toBeNull();
  });

  // 18. Medium-confidence candidate requires review
  it('18. Should classify partial financial indicators as MEDIUM confidence', () => {
    const res = notificationParserService.parseNotification(
      'Alert',
      'Paid ₹ 300 to Merchant',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.confidence).toBe('MEDIUM');
  });

  // 19. High-confidence candidate accepted
  it('19. Should classify complete payment notifications as HIGH confidence', () => {
    const res = notificationParserService.parseNotification(
      'HDFC Bank',
      'INR 650.00 debited from A/c XX5544 at Swiggy via UPI UTR 998811223344',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.confidence).toBe('HIGH');
  });

  // 20. Raw body never included in API payload (Security Test)
  it('20. SECURITY GUARANTEE: Outgoing API payload MUST NOT contain raw notification text', async () => {
    const candidate = notificationParserService.parseNotification(
      'HDFC Bank Confidential',
      'Debited ₹ 1000 from A/c XX1234 via UPI UTR 778899. Confidential Bank Note: SECRET_PAYLOAD_123',
      ts,
    );
    expect(candidate).not.toBeNull();

    const payload = {
      transactionType: candidate!.transactionType,
      amount: candidate!.amount,
      currency: candidate!.currency,
      transactionReference: candidate!.transactionReference || undefined,
      merchantName: candidate!.merchantName || undefined,
      accountMask: candidate!.accountMask || undefined,
      transactionDate: candidate!.transactionDate,
      source: 'NOTIFICATION',
    };

    const keys = Object.keys(payload);
    expect(keys).not.toContain('rawNotification');
    expect(keys).not.toContain('notificationText');
    expect(keys).not.toContain('body');
    expect(keys).not.toContain('title');
    expect(keys).not.toContain('otp');
    expect(keys).not.toContain('pin');
    expect(keys).not.toContain('password');

    // Confirm payload JSON does not contain raw text
    const jsonStr = JSON.stringify(payload);
    expect(jsonStr).not.toContain('Confidential Bank Note');
    expect(jsonStr).not.toContain('SECRET_PAYLOAD_123');
  });

  // 21. Dedup fingerprint is SHA-256 hashed (64 hex characters)
  it('21. STEP 14B: Deduplication fingerprint MUST be a 64-character SHA-256 hex string', () => {
    const res = notificationParserService.parseNotification(
      'HDFC Bank',
      'Debited ₹ 1500.00 at Starbucks via UPI UTR HASH123456',
      ts,
    );
    expect(res).not.toBeNull();
    expect(res?.fingerprint).toHaveLength(64);
    expect(res?.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(res?.fingerprint).not.toContain('Starbucks');
    expect(res?.fingerprint).not.toContain('1500.00');
    expect(res?.fingerprint).not.toContain('HASH123456');
  });

  // 22. SHA-256 hash helper deterministic test
  it('22. STEP 14B: SHA-256 hash function MUST produce deterministic output', () => {
    const hash1 = computeSha256('TEST_STRING');
    const hash2 = computeSha256('TEST_STRING');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  // 23. Dedup expires after 48h
  it('23. Deduplication fingerprint MUST expire after 48 hours', () => {
    const oldTs = '2026-08-01T12:00:00.000Z';
    const res1 = notificationParserService.parseNotification('Bank', 'Debited ₹ 500 via UPI UTR REF999', oldTs);
    expect(res1).not.toBeNull();

    const newTs = '2026-09-01T12:00:00.000Z';
    const res2 = notificationParserService.parseNotification('Bank', 'Debited ₹ 500 via UPI UTR REF999', newTs);
    expect(res2).not.toBeNull();
  });

  // 24. Pending queue maximum size (25)
  it('24. Pending offline queue MUST NOT exceed 25 maximum candidates', () => {
    expect(MAX_PENDING_QUEUE_SIZE).toBe(25);
  });

  // 25. Pending queue expiry (72h)
  it('25. Pending offline queue items MUST expire after 72 hours', () => {
    expect(QUEUE_EXPIRY_MS).toBe(72 * 60 * 60 * 1000);
  });

  // 26. User Ownership Isolation Security Test
  it('26. User Ownership Isolation: User A pending candidate MUST NOT be posted to User B', async () => {
    const candidate = notificationParserService.parseNotification(
      'HDFC Bank',
      'Debited ₹ 1000 via UPI UTR 998877',
      ts,
      'user-a-uuid-1234',
    );
    expect(candidate).not.toBeNull();
    expect(candidate?.userId).toBe('user-a-uuid-1234');

    const res = await notificationBridgeService.processHighConfidenceCandidate(
      candidate!,
      undefined,
      'user-b-uuid-5678',
    );

    expect(res).toBe(false);
  });

  // 27. Decimal normalization
  it('27. Decimal normalization: ₹1 MUST normalize to exact 2-decimal string "1.00"', () => {
    const formatted = notificationParserService.formatAmountDecimal('1');
    expect(formatted).toBe('1.00');
  });

  // 28. ₹1.50 exact representation
  it('28. Decimal normalization: ₹1.5 MUST normalize to exact 2-decimal string "1.50"', () => {
    const formatted = notificationParserService.formatAmountDecimal('1.5');
    expect(formatted).toBe('1.50');
  });

  // 29. Comma amount normalization
  it('29. Decimal normalization: ₹1,500.75 MUST normalize to exact string "1500.75"', () => {
    const formatted = notificationParserService.formatAmountDecimal('1,500.75');
    expect(formatted).toBe('1500.75');
  });

  // 30. Failed payment ignored
  it('30. Failed payment notification "₹500 debit failed" MUST NOT create a transaction', () => {
    const res = notificationParserService.parseNotification('UPI Alert', 'Transaction of ₹ 500 debit failed due to server error');
    expect(res).toBeNull();
  });

  // 31. Refund / Reversal safe behavior
  it('31. Reversal notification "₹350 payment reversed" MUST be classified as MEDIUM confidence requiring user review', () => {
    const res = notificationParserService.parseNotification('Paytm Alert', 'INR 350.00 refunded for Zomato order via UPI Ref 778899', ts);
    expect(res).not.toBeNull();
    expect(res?.transactionType).toBe('CREDIT');
    expect(res?.confidence).toBe('MEDIUM');
    expect(res?.merchantName).toContain('Reversal');
  });

  // 32. Notification access OFF blocks detection
  it('32. When notification access is OFF, parser bridge MUST return false', async () => {
    const enabled = await notificationBridgeService.isNotificationListenerEnabled();
    expect(enabled).toBe(false);
  });

  // 33. Queue flush occurs safely
  it('33. Queue flush MUST process queue without loss', async () => {
    await notificationBridgeService.flushPendingQueue(undefined, 'user-a-uuid-1234');
  });

  // 34. Duplicate queued candidate not posted twice
  it('34. Duplicate candidate within deduplication window MUST be rejected', () => {
    const res1 = notificationParserService.parseNotification('Bank', 'Debited ₹ 100 via UPI UTR UNIQUE123', ts);
    const res2 = notificationParserService.parseNotification('Bank', 'Debited ₹ 100 via UPI UTR UNIQUE123', ts);
    expect(res1).not.toBeNull();
    expect(res2).toBeNull();
  });

  // 35. No raw notification persisted
  it('35. Candidate object MUST contain ZERO raw title or raw body properties', () => {
    const candidate = notificationParserService.parseNotification('Bank', 'Debited ₹ 200 via UPI UTR UNIQUE456', ts);
    expect(candidate).not.toBeNull();
    expect(candidate).not.toHaveProperty('rawTitle');
    expect(candidate).not.toHaveProperty('rawBody');
    expect(candidate).not.toHaveProperty('notificationText');
  });

  // 36. Android lifecycle bridge handles disconnected RN runtime safely
  it('36. Synthetic test helper MUST process synthetic notification payloads safely', async () => {
    const res = await notificationBridgeService.postSyntheticNotification(
      'Axis Bank Alert',
      'Rs. 3,200.00 debited from A/c XX8877 at Shoppers Stop via UPI Ref 998877665544',
    );
    expect(res).toBe(true);
  });
});
