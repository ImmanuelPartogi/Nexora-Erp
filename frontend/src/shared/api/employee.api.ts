// ============================================
// FILE: frontend/src/shared/api/employee.api.ts
// ✅ UPDATED: Support User account creation
// ============================================

import { apiClient } from './client';
import { Employee, ListQueryParams } from '../types';

export interface CreateEmployeeRequest {
  // Employee basic info
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: string;
  salary?: number;
  
  // ✅ TAMBAHAN: User account creation
  createUserAccount?: boolean;
  password?: string;
  roleId?: string;
}

export interface UpdateEmployeeRequest {
  // Employee basic info
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: string;
  salary?: number;
  status?: 'active' | 'inactive' | 'resigned';
  
  // ✅ TAMBAHAN: Update user account
  updateUserAccount?: boolean;
  password?: string;
  roleId?: string;
  userIsActive?: boolean;
}

export const employeeApi = {
  list: (params?: ListQueryParams & { status?: string; department?: string; hasUserAccount?: boolean }) => 
    apiClient.getPaginated<Employee>('/employees', params),

  getById: (id: string) => 
    apiClient.get<Employee>(`/employees/${id}`),

  create: (data: CreateEmployeeRequest) => 
    apiClient.post<Employee>('/employees', data),

  update: (id: string, data: UpdateEmployeeRequest) => 
    apiClient.put<Employee>(`/employees/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/employees/${id}`),
};