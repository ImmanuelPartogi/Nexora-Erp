// src/shared/api/customer.api.ts
import { apiClient } from './client';
import { Customer, ListQueryParams } from '../types';

export interface CreateCustomerRequest {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export const customerApi = {
  // ✅ GANTI dari get() ke getPaginated()
  list: (params?: ListQueryParams) => 
    apiClient.getPaginated<Customer>('/customers', params),

  getById: (id: string) => 
    apiClient.get<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerRequest) => 
    apiClient.post<Customer>('/customers', data),

  update: (id: string, data: UpdateCustomerRequest) => 
    apiClient.put<Customer>(`/customers/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/customers/${id}`),
};