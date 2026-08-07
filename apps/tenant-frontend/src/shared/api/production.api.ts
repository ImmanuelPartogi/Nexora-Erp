// frontend/src/shared/api/production.api.ts
import { apiClient } from './client';
import { Production, ListQueryParams } from '../types';

export interface CreateProductionRequest {
  batchNo?: string;
  productId: string;
  quantity: number;
  date: string;
  notes?: string;
  inputs: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface ProductionListParams extends ListQueryParams {
  status?: string;
  search?: string;
}

export const productionApi = {
  list: (params?: ProductionListParams) =>
    apiClient.getPaginated<Production>('/productions', params),

  getById: (id: string) =>
    apiClient.get<Production>(`/productions/${id}`),

  create: (data: CreateProductionRequest) =>
    apiClient.post<Production>('/productions', data),

  // ✅ NEW: Start production (draft → in_progress)
  start: (id: string) =>
    apiClient.post<Production>(`/productions/${id}/start`),

  // ✅ NEW: Complete production (in_progress → completed)
  complete: (id: string) =>
    apiClient.post<Production>(`/productions/${id}/complete`),

  // ✅ NEW: Cancel production
  cancel: (id: string) =>
    apiClient.post<Production>(`/productions/${id}/cancel`),
};