// ============================================
// FILE: src/shared/api/product.api.ts
// ============================================
import { apiClient } from './client';
import { Product, ListQueryParams } from '../types';

export interface CreateProductRequest {
  name: string;
  code?: string;
  type: 'goods' | 'service' | 'raw_material' | 'finished_goods';
  unit: string;
  price?: number;
  cost?: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  type?: 'goods' | 'service' | 'raw_material' | 'finished_goods';
  unit?: string;
  price?: number;
  cost?: number;
  description?: string;
  isActive?: boolean;
}

export const productApi = {
  // ✅ GANTI dari get() ke getPaginated()
  list: (params?: ListQueryParams & { type?: string }) => 
    apiClient.getPaginated<Product>('/products', params),

  getById: (id: string) => 
    apiClient.get<Product>(`/products/${id}`),

  create: (data: CreateProductRequest) => 
    apiClient.post<Product>('/products', data),

  update: (id: string, data: UpdateProductRequest) => 
    apiClient.put<Product>(`/products/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/products/${id}`),
};