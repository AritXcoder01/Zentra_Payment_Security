import { apiClient } from './client';
import { SecurityAlert } from '../types/domain.types';

export const alertsApi = {
  async getAlerts() {
    return apiClient.request<SecurityAlert[]>('/security-alerts', 'GET');
  },

  async markAsRead(id: string) {
    return apiClient.request<{ success: boolean; message: string }>(`/security-alerts/${id}/read`, 'PATCH');
  },
};
