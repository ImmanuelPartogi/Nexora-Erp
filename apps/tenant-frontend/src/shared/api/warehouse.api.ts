// ============================================
// FILE: src/shared/api/warehouse.api.ts
// FIX: Gunakan getPaginated() untuk list endpoint
// ============================================
import { apiClient } from './client';
import { Warehouse, ListQueryParams } from '../types';

export interface CreateWarehouseRequest {
  name: string;
  code?: string;
  location?: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  location?: string;
  isActive?: boolean;
}

export const warehouseApi = {
  // ✅ FIX: Ganti dari get() ke getPaginated()
  list: (params?: ListQueryParams) => 
    apiClient.getPaginated<Warehouse>('/warehouses', params),

  getById: (id: string) => 
    apiClient.get<Warehouse>(`/warehouses/${id}`),

  create: (data: CreateWarehouseRequest) => 
    apiClient.post<Warehouse>('/warehouses', data),

  update: (id: string, data: UpdateWarehouseRequest) => 
    apiClient.put<Warehouse>(`/warehouses/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/warehouses/${id}`),
};