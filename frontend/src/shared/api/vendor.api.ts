// ============================================
// FILE: src/shared/api/vendor.api.ts
// ============================================
import { apiClient } from './client';
import { Vendor, ListQueryParams } from '../types';

export interface CreateVendorRequest {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export const vendorApi = {
  // ✅ GANTI dari get() ke getPaginated()
  list: (params?: ListQueryParams) => 
    apiClient.getPaginated<Vendor>('/vendors', params),

  getById: (id: string) => 
    apiClient.get<Vendor>(`/vendors/${id}`),

  create: (data: CreateVendorRequest) => 
    apiClient.post<Vendor>('/vendors', data),

  update: (id: string, data: UpdateVendorRequest) => 
    apiClient.put<Vendor>(`/vendors/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/vendors/${id}`),
};