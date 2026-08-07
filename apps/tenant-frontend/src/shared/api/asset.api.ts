// src/shared/api/asset.api.ts
import { apiClient } from './client';
import { Asset, ListQueryParams } from '../types';

export interface CreateAssetRequest {
  name: string;
  code?: string;
  type?: 'equipment' | 'vehicle' | 'building' | 'furniture' | 'other';
  category?: string;
  locationId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'maintenance';
  description?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateAssetRequest {
  name?: string;
  type?: 'equipment' | 'vehicle' | 'building' | 'furniture' | 'other';
  category?: string;
  locationId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'maintenance';
  description?: string;
  notes?: string;
  isActive?: boolean;
}

export const assetApi = {
  // ✅ GANTI dari get() ke getPaginated()
  list: (params?: ListQueryParams & { locationId?: string; condition?: string }) => 
    apiClient.getPaginated<Asset>('/assets', params as Record<string, unknown>),

  getById: (id: string) => 
    apiClient.get<Asset>(`/assets/${id}`),

  create: (data: CreateAssetRequest) => 
    apiClient.post<Asset>('/assets', data),

  update: (id: string, data: UpdateAssetRequest) => 
    apiClient.put<Asset>(`/assets/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/assets/${id}`),
};