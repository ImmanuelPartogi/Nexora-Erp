// ============================================
// FILE: src/shared/api/location.api.ts
// ============================================
import { apiClient } from './client';
import { Location, ListQueryParams } from '../types';

export interface CreateLocationRequest {
  name: string;
  code?: string;
  address?: string;
  type?: 'warehouse' | 'office' | 'store' | 'other';
}

export interface UpdateLocationRequest {
  name?: string;
  address?: string;
  type?: 'warehouse' | 'office' | 'store' | 'other';
  isActive?: boolean;
}

export const locationApi = {
  // ✅ GANTI dari get() ke getPaginated()
  list: (params?: ListQueryParams & { type?: string }) => 
    apiClient.getPaginated<Location>('/locations', params as Record<string, unknown>),

  getById: (id: string) => 
    apiClient.get<Location>(`/locations/${id}`),

  create: (data: CreateLocationRequest) => 
    apiClient.post<Location>('/locations', data),

  update: (id: string, data: UpdateLocationRequest) => 
    apiClient.put<Location>(`/locations/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/locations/${id}`),
};