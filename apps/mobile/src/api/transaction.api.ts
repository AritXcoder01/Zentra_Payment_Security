import { apiClient } from './client';
import { Transaction, TransactionSummary, TransactionType } from '../types/domain.types';

export interface CreateTransactionPayload {
  transactionType: TransactionType;
  amount: number;
  currency?: string;
  transactionReference?: string;
  merchantName?: string;
  merchantVpa?: string;
  accountMask?: string;
  transactionDate: string;
}

export interface QueryTransactionsParams {
  type?: TransactionType;
  search?: string;
  page?: number;
  limit?: number;
}

export const transactionApi = {
  async createTransaction(payload: CreateTransactionPayload) {
    return apiClient.request<Transaction>('/transactions', 'POST', payload);
  },

  async getTransactions(params?: QueryTransactionsParams) {
    const queryParts: string[] = [];
    if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return apiClient.request<{ items: Transaction[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/transactions${queryString}`,
      'GET',
    );
  },

  async getSummary() {
    return apiClient.request<TransactionSummary>('/transactions/summary', 'GET');
  },

  async getTransactionById(id: string) {
    return apiClient.request<Transaction>(`/transactions/${id}`, 'GET');
  },
};
