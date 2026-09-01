import { apiClient } from './client';
import { OfficialResource, PaymentMode, ResourceType } from '../types/domain.types';

export interface QueryResourcesParams {
  fraudCategory?: string;
  paymentMode?: PaymentMode;
  resourceType?: ResourceType;
}

export const resourceApi = {
  async getResources(params?: QueryResourcesParams) {
    const queryParts: string[] = [];
    if (params?.fraudCategory) queryParts.push(`fraudCategory=${encodeURIComponent(params.fraudCategory)}`);
    if (params?.paymentMode) queryParts.push(`paymentMode=${encodeURIComponent(params.paymentMode)}`);
    if (params?.resourceType) queryParts.push(`resourceType=${encodeURIComponent(params.resourceType)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return apiClient.request<OfficialResource[]>(`/resources${queryString}`, 'GET');
  },
};
