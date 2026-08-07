// ============================================
// FILE: frontend/src/shared/api/lease.api.ts
// FIX: Gunakan getPaginated untuk list endpoint
// ============================================
import { apiClient } from './client';
import { Lease, ListQueryParams } from '../types';

export interface CreateLeaseRequest {
  customerId: string;
  unitName: string; // ✅ Ubah dari unitId ke unitName
  startDate: string;
  endDate: string;
  amount: number | string; // ✅ Support string dari form
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UpdateLeaseRequest {
  customerId?: string;
  unitName?: string;
  startDate?: string;
  endDate?: string;
  amount?: number | string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export const leaseApi = {
  // ✅ FIX: Pakai getPaginated untuk list
  list: (params?: ListQueryParams & { status?: string; customerId?: string }) => 
    apiClient.getPaginated<Lease>('/leases', params),

  getById: (id: string) => 
    apiClient.get<Lease>(`/leases/${id}`),

  create: (data: CreateLeaseRequest) => 
    apiClient.post<Lease>('/leases', data),

  update: (id: string, data: UpdateLeaseRequest) => 
    apiClient.put<Lease>(`/leases/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/leases/${id}`),

  approve: (id: string) =>
    apiClient.post<Lease>(`/leases/${id}/approve`, {}),

  complete: (id: string) =>
    apiClient.post<Lease>(`/leases/${id}/complete`, {}),

  cancel: (id: string) =>
    apiClient.post<Lease>(`/leases/${id}/cancel`, {}),
};