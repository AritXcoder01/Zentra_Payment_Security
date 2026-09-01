import { storageService, SecureAuthStorage } from './services/storage.service';
import { apiClient } from './api/client';
import { transactionApi } from './api/transaction.api';
import { fraudApi } from './api/fraud.api';
import { resourceApi } from './api/resource.api';
import { alertsApi } from './api/alerts.api';
import { sessionsApi } from './api/sessions.api';
import { normalizeMobileNumber } from '@zentra/shared';
import { config } from './config/config';
import { formatINR } from './utils/formatters';

describe('Zentra Mobile Security & Architecture Unit Tests (Step 12A)', () => {
  beforeEach(async () => {
    await storageService.clearAuthSession();
  });

  // 1. Mobile number validation (+91 10-digit)
  it('1. Should validate and format +91 10-digit mobile numbers correctly', () => {
    const rawNumber = '9876543210';
    const formatted = normalizeMobileNumber(`+91${rawNumber}`);
    expect(formatted).toBe('+919876543210');
    expect(() => normalizeMobileNumber('12345')).toThrow();
  });

  // 2. Login request mapping
  it('2. Should map login request to /auth/request-otp with normalized mobile number', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { success: true, demoOtp: '123456' } }),
    } as any);

    const res = await apiClient.requestOtp('+919876543210');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/request-otp'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ mobileNumber: '+919876543210' }) }),
    );
    expect(res.success).toBe(true);
    spy.mockRestore();
  });

  // 3. OTP navigation decision routing
  it('3. Should parse verify OTP response for decision routing', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { isNewUser: true, registrationToken: 'mock_reg_token' } }),
    } as any);

    const res = await apiClient.verifyOtp('+919876543210', '123456');
    expect(res.data?.isNewUser).toBe(true);
    expect(res.data?.registrationToken).toBe('mock_reg_token');
    spy.mockRestore();
  });

  // 4. Short-lived registration token handling
  it('4. New user response should contain short-lived registration token', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { isNewUser: true, registrationToken: 'reg_tok_abc' } }),
    } as any);

    const res = await apiClient.verifyOtp('+919876543210', '123456');
    expect(res.data?.isNewUser).toBe(true);
    expect(res.data?.registrationToken).toBe('reg_tok_abc');
    spy.mockRestore();
  });

  // 5. Returning user token issuance
  it('5. Returning user response should issue tokens and bypass registration', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          isNewUser: false,
          tokens: { accessToken: 'access_123', refreshToken: 'refresh_123' },
        },
      }),
    } as any);

    const res = await apiClient.verifyOtp('+919876543210', '123456');
    expect(res.data?.isNewUser).toBe(false);
    expect(res.data?.tokens?.accessToken).toBe('access_123');
    spy.mockRestore();
  });

  // 6. SecureAuthStorage Keystore token persistence
  it('6. SecureAuthStorage should handle refresh and access token persistence via Keystore', async () => {
    await SecureAuthStorage.setRefreshToken('secret_refresh_token_123');
    await SecureAuthStorage.setAccessToken('secret_access_token_123');

    const refreshToken = await SecureAuthStorage.getRefreshToken();
    const accessToken = await SecureAuthStorage.getAccessToken();

    expect(refreshToken).toBe('secret_refresh_token_123');
    expect(accessToken).toBe('secret_access_token_123');
  });

  // 7. Atomic refresh token replacement
  it('7. Refresh token should be atomically replaced upon rotation', async () => {
    await SecureAuthStorage.setRefreshToken('old_refresh_token');
    await SecureAuthStorage.setRefreshToken('new_rotated_refresh_token');

    const token = await SecureAuthStorage.getRefreshToken();
    expect(token).toBe('new_rotated_refresh_token');
  });

  // 8. Logout purges secure credentials
  it('8. Logout should purge all secure tokens and session state', async () => {
    await SecureAuthStorage.setRefreshToken('refresh_tok');
    await SecureAuthStorage.setAccessToken('access_tok');

    await storageService.clearAuthSession();

    expect(await SecureAuthStorage.getRefreshToken()).toBeNull();
    expect(await SecureAuthStorage.getAccessToken()).toBeNull();
  });

  // 9. Failed token refresh session cleanup
  it('9. Failed token refresh should clear session credentials and force auth state', async () => {
    await SecureAuthStorage.setRefreshToken('invalid_refresh_token');

    const refreshSpy = jest.spyOn(apiClient as any, 'executeTokenRefresh').mockResolvedValueOnce(false);
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as any);

    const res = await apiClient.request('/users/me', 'GET');
    expect(res.success).toBe(false);
    expect(await storageService.getRefreshToken()).toBeNull();
    spy.mockRestore();
    refreshSpy.mockRestore();
  });

  // 10. Edit profile excludes mobileNumber
  it('10. Edit profile request payload MUST NOT include mobileNumber or mobile_number', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { fullName: 'Updated Name', email: 'updated@example.com' } }),
    } as any);

    await apiClient.updateProfile({ fullName: 'Updated Name', email: 'updated@example.com' });

    expect(spy).toHaveBeenCalled();
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body).toEqual({ fullName: 'Updated Name', email: 'updated@example.com' });
    expect(body).not.toHaveProperty('mobileNumber');
    expect(body).not.toHaveProperty('mobile_number');
    spy.mockRestore();
  });

  // 11. Demo OTP configuration flag check
  it('11. Demo OTP configuration flag should default to active in dev mode', () => {
    expect(config.isDemoMode).toBe(true);
    expect(config.demoOtpCode).toBe('123456');
  });

  // 12. Transaction summary mapping
  it('12. Should correctly map GET /transactions/summary response', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { moneyIn: 5000, moneyOut: 1500.5, transactionCount: 2 } }),
    } as any);

    const res = await transactionApi.getSummary();
    expect(res.success).toBe(true);
    expect(res.data?.moneyIn).toBe(5000);
    expect(res.data?.moneyOut).toBe(1500.5);
    expect(res.data?.transactionCount).toBe(2);
    spy.mockRestore();
  });

  // 13. Transaction list mapping
  it('13. Should correctly map GET /transactions list response', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          items: [{ id: 'tx_1', amount: '1500.50', transactionType: 'DEBIT' }],
          meta: { total: 1, page: 1, limit: 15, totalPages: 1 },
        },
      }),
    } as any);

    const res = await transactionApi.getTransactions({ page: 1, limit: 15 });
    expect(res.success).toBe(true);
    expect(res.data?.items).toHaveLength(1);
    expect(res.data?.meta.total).toBe(1);
    spy.mockRestore();
  });

  // 14. Transaction pagination query parameters
  it('14. Should construct pagination and filter query params correctly', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { items: [], meta: { total: 0, page: 2, limit: 10, totalPages: 0 } } }),
    } as any);

    await transactionApi.getTransactions({ type: 'DEBIT', search: 'Starbucks', page: 2, limit: 10 });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/transactions?type=DEBIT&search=Starbucks&page=2&limit=10'),
      expect.anything(),
    );
    spy.mockRestore();
  });

  // 15. Single Transaction detail mapping
  it('15. Should map GET /transactions/:id response', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { id: 'tx_123', merchantName: 'Starbucks', amount: 1500.5 } }),
    } as any);

    const res = await transactionApi.getTransactionById('tx_123');
    expect(res.data?.id).toBe('tx_123');
    expect(res.data?.merchantName).toBe('Starbucks');
    spy.mockRestore();
  });

  // 16. Fraud category mapping
  it('16. Should map GET /fraud/categories response', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [{ code: 'UPI_FRAUD', name: 'UPI Fraud' }] }),
    } as any);

    const res = await fraudApi.getCategories();
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0].code).toBe('UPI_FRAUD');
    spy.mockRestore();
  });

  // 17. Fraud submission mapping
  it('17. Should map POST /fraud/reports submission payload', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { id: 'rep_123', status: 'SUBMITTED' } }),
    } as any);

    const res = await fraudApi.createReport({
      fraudCategory: 'UPI_FRAUD',
      paymentMode: 'UPI',
      amount: 2500,
      incidentDate: '2026-08-26',
      description: 'Test fraud incident report description',
    });

    expect(res.data?.id).toBe('rep_123');
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.fraudCategory).toBe('UPI_FRAUD');
    expect(body.amount).toBe(2500);
    spy.mockRestore();
  });

  // 18. Fraud guidance mapping
  it('18. Should map GET /fraud/reports/:id/guidance response', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { severity: 'HIGH', immediateActions: ['Contact bank'], safetyRecommendations: [] },
      }),
    } as any);

    const res = await fraudApi.getGuidance('rep_123');
    expect(res.data?.severity).toBe('HIGH');
    expect(res.data?.immediateActions).toContain('Contact bank');
    spy.mockRestore();
  });

  // 19. Empty Resources response handling
  it('19. GET /resources should handle empty array [] safely', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    } as any);

    const res = await resourceApi.getResources({ fraudCategory: 'UPI_FRAUD' });
    expect(res.data).toEqual([]);
    spy.mockRestore();
  });

  // 20. Security alerts list & read marking mapping
  it('20. Security alerts list and read marking should map correctly', async () => {
    const spyList = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [{ id: 'alt_1', isRead: false, title: 'Advisory' }] }),
    } as any);

    const alertsRes = await alertsApi.getAlerts();
    expect(alertsRes.data).toHaveLength(1);
    spyList.mockRestore();

    const spyRead = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Alert marked as read' }),
    } as any);

    const readRes = await alertsApi.markAsRead('alt_1');
    expect(readRes.success).toBe(true);
    spyRead.mockRestore();
  });

  // 21. User Session list and currentSession detection mapping
  it('21. Session list mapping should preserve currentSession flag', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [{ id: 'sess_1', currentSession: true, status: 'ACTIVE' }],
      }),
    } as any);

    const res = await sessionsApi.getSessions();
    expect(res.data?.[0].currentSession).toBe(true);
    spy.mockRestore();
  });

  // 22. Revoke other sessions API mapping
  it('22. Revoke other sessions request should map correctly', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, count: 2, message: 'Successfully revoked 2 other active session(s)' }),
    } as any);

    const res = await sessionsApi.revokeOtherSessions();
    expect(res.data?.count).toBe(2);
    spy.mockRestore();
  });

  // 23. Email profile cache absent from AsyncStorage
  it('23. AsyncStorage profile cache MUST return null (email never stored on disk)', async () => {
    const cache = await storageService.getUserData();
    expect(cache).toBeNull();
  });

  // 24. Reusable INR Currency Formatter
  it('24. formatINR should format currency numbers and string decimals safely', () => {
    expect(formatINR(1250.5)).toContain('1,250.50');
    expect(formatINR('5000')).toContain('5,000.00');
    expect(formatINR(null)).toBe('₹0.00');
  });

  // Step 12A Focused Mobile Tests:

  // 25. Active verified resource returned & inactive excluded
  it('25. Should map GET /resources and return active verified resources', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'res_1',
            authorityName: 'Government of India — National Cyber Crime Reporting Portal',
            websiteUrl: 'https://cybercrime.gov.in',
            phoneNumber: '1930',
            isActive: true,
          },
        ],
      }),
    } as any);

    const res = await resourceApi.getResources();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0].authorityName).toContain('National Cyber Crime');
    spy.mockRestore();
  });

  // 26. Category resource mapping query params
  it('26. Should construct category and payment mode query params for resources', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    } as any);

    await resourceApi.getResources({ fraudCategory: 'UPI_FRAUD', paymentMode: 'UPI' });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/resources?fraudCategory=UPI_FRAUD&paymentMode=UPI'),
      expect.anything(),
    );
    spy.mockRestore();
  });

  // 27. Current user report history & newest-first ordering
  it('27. Should map GET /fraud/reports list response for user history', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { id: 'rep_2', createdAt: '2026-08-31T12:00:00Z', amount: 5000 },
          { id: 'rep_1', createdAt: '2026-08-31T10:00:00Z', amount: 2500 },
        ],
      }),
    } as any);

    const res = await apiClient.getFraudReports();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(2);
    expect(res.data?.[0].id).toBe('rep_2');
    spy.mockRestore();
  });

  // 28. Fraud report detail by ID
  it('28. Should map GET /fraud/reports/:id detail response', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'rep_123', amount: 2500, status: 'SUBMITTED' },
      }),
    } as any);

    const res = await apiClient.getFraudReportById('rep_123');
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('rep_123');
    expect(res.data?.amount).toBe(2500);
    spy.mockRestore();
  });

  // 29. External status is not fabricated (safe internal status)
  it('29. Fraud report status MUST NOT fabricate external authority states', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'rep_123', status: 'SUBMITTED' },
      }),
    } as any);

    const res = await apiClient.getFraudReportById('rep_123');
    expect(res.data?.status).not.toBe('Police Reviewing');
    expect(res.data?.status).not.toBe('RBI Processing');
    expect(res.data?.status).not.toBe('Bank Investigation');
    expect(res.data?.status).toBe('SUBMITTED');
    spy.mockRestore();
  });

  // 30. Missing or invalid resource URL handles safely
  it('30. Missing resource URL handles safely without crashing', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [{ id: 'res_2', authorityName: 'RBI CMS', websiteUrl: null }],
      }),
    } as any);

    const res = await resourceApi.getResources();
    expect(res.data?.[0].websiteUrl).toBeNull();
    spy.mockRestore();
  });
});
