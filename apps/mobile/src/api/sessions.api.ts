import { apiClient } from './client';
import { UserSession } from '../types/domain.types';

export const sessionsApi = {
  async getSessions() {
    return apiClient.request<UserSession[]>('/sessions', 'GET');
  },

  async revokeSession(id: string) {
    return apiClient.request<{ success: boolean; message: string }>(`/sessions/${id}/revoke`, 'POST');
  },

  async revokeOtherSessions() {
    return apiClient.request<{ success: boolean; count: number; message: string }>('/sessions/revoke-others', 'POST');
  },
};
