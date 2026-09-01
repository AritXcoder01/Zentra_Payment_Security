import { apiClient } from './client';
import { FraudCategory, FraudReport, FraudGuidance, PaymentMode } from '../types/domain.types';

export interface CreateFraudReportPayload {
  fraudCategory: string;
  paymentMode: PaymentMode;
  amount: number;
  incidentDate: string;
  description: string;
  transactionReference?: string;
  relatedTransactionId?: string;
}

export const fraudApi = {
  async getCategories() {
    return apiClient.request<FraudCategory[]>('/fraud/categories', 'GET');
  },

  async createReport(payload: CreateFraudReportPayload) {
    return apiClient.request<FraudReport>('/fraud/reports', 'POST', payload);
  },

  async getReports() {
    return apiClient.request<FraudReport[]>('/fraud/reports', 'GET');
  },

  async getReportById(id: string) {
    return apiClient.request<FraudReport>(`/fraud/reports/${id}`, 'GET');
  },

  async getGuidance(id: string) {
    return apiClient.request<FraudGuidance>(`/fraud/reports/${id}/guidance`, 'GET');
  },
};
