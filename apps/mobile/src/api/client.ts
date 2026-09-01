import { config } from '../config/config';
import { storageService } from '../services/storage.service';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any,
    options: ApiRequestOptions = {},
  ): Promise<{ success: boolean; data?: T; message?: string; status: number }> {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (!options.skipAuth) {
      const accessToken = await storageService.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const resData = await response.json().catch(() => ({}));

      // Handle 401 Unauthorized -> Attempt Token Refresh ONCE with storm lock
      if (
        response.status === 401 &&
        !options.skipAuth &&
        endpoint !== '/auth/refresh'
      ) {
        const refreshed = await this.acquireTokenRefresh();
        if (refreshed) {
          // Retry original request with newly rotated token
          const newAccessToken = await storageService.getAccessToken();
          if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          const retryResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
          const retryData = await retryResponse.json().catch(() => ({}));
          return {
            success: retryResponse.ok,
            status: retryResponse.status,
            data: retryData?.data || retryData,
            message: retryData?.message || (retryResponse.ok ? 'Success' : 'Request failed'),
          };
        } else {
          await storageService.clearAuthSession();
        }
      }

      return {
        success: response.ok,
        status: response.status,
        data: resData?.data || resData,
        message: resData?.message || (response.ok ? 'Success' : 'Request failed'),
      };
    } catch {
      return {
        success: false,
        status: 0,
        message: 'Network connectivity error. Please check server availability.',
      };
    }
  }

  /**
   * Prevents concurrent 401 requests from triggering uncontrolled refresh storms
   */
  private async acquireTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.executeTokenRefresh().finally(() => {
      this.isRefreshing = false;
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async executeTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await storageService.getRefreshToken();
      if (!refreshToken) return false;

      const res = await this.request(
        '/auth/refresh',
        'POST',
        { refreshToken },
        { skipAuth: true },
      );

      if (res.success && res.data?.accessToken) {
        await storageService.setAccessToken(res.data.accessToken);
        if (res.data?.refreshToken) {
          await storageService.setRefreshToken(res.data.refreshToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth Methods
  async requestOtp(mobileNumber: string) {
    return this.request('/auth/request-otp', 'POST', { mobileNumber }, { skipAuth: true });
  }

  async verifyOtp(mobileNumber: string, otp: string) {
    return this.request('/auth/verify-otp', 'POST', { mobileNumber, otp }, { skipAuth: true });
  }

  async completeRegistration(registrationToken: string, fullName: string, email: string) {
    return this.request(
      '/auth/register/complete',
      'POST',
      { registrationToken, fullName, email },
      { skipAuth: true },
    );
  }

  async logout() {
    const refreshToken = await storageService.getRefreshToken();
    const res = await this.request('/auth/logout', 'POST', { refreshToken });
    await storageService.clearAuthSession();
    return res;
  }

  // Profile Methods
  async getProfile() {
    return this.request('/users/me', 'GET');
  }

  async updateProfile(updates: { fullName?: string; email?: string; profilePhoto?: string }) {
    return this.request('/users/me', 'PATCH', updates);
  }

  async deleteAccount() {
    const res = await this.request('/users/me', 'DELETE');
    await storageService.clearAuthSession();
    return res;
  }

  // Fraud Methods
  async getFraudCategories() {
    return this.request('/fraud/categories', 'GET');
  }

  async createFraudReport(dto: any) {
    return this.request('/fraud/reports', 'POST', dto);
  }

  async getFraudReports() {
    return this.request('/fraud/reports', 'GET');
  }

  async getFraudReportById(id: string) {
    return this.request(`/fraud/reports/${id}`, 'GET');
  }

  async getFraudReportGuidance(id: string) {
    return this.request(`/fraud/reports/${id}/guidance`, 'GET');
  }

  // Resource Methods
  async getResources(params?: { fraudCategory?: string; paymentMode?: string }) {
    let queryStr = '';
    if (params) {
      const q: string[] = [];
      if (params.fraudCategory) q.push(`fraudCategory=${encodeURIComponent(params.fraudCategory)}`);
      if (params.paymentMode) q.push(`paymentMode=${encodeURIComponent(params.paymentMode)}`);
      if (q.length > 0) queryStr = `?${q.join('&')}`;
    }
    return this.request(`/resources${queryStr}`, 'GET');
  }
}

export const apiClient = new ApiClient();
