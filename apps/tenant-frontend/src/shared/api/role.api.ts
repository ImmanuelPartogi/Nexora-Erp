// ============================================
// FILE: frontend/src/shared/api/role.api.ts
// Updated - added listAll function
// ============================================

import { apiClient } from './client';
import { Role, PermissionGroup } from '../types';

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const roleApi = {
  /**
   * List roles with pagination
   * GET /roles
   */
  list: () => 
    apiClient.getPaginated<Role>('/roles'),

  /**
   * List all roles (no pagination) - for dropdowns
   * GET /roles?limit=1000
   */
  listAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/roles', { limit: 1000 });
    return response;
  },

  /**
   * Get role by ID
   * GET /roles/:id
   */
  getById: (id: string) => 
    apiClient.get<Role>(`/roles/${id}`),

  /**
   * Create new role
   * POST /roles
   */
  create: (data: CreateRoleRequest) => 
    apiClient.post<Role>('/roles', data),

  /**
   * Update existing role
   * PUT /roles/:id
   */
  update: (id: string, data: UpdateRoleRequest) => 
    apiClient.put<Role>(`/roles/${id}`, data),

  /**
   * Delete role (soft delete)
   * DELETE /roles/:id
   */
  delete: (id: string) => 
    apiClient.delete<void>(`/roles/${id}`),

  /**
   * Get available permissions grouped by module
   * GET /roles/permissions
   */
  getPermissions: () =>
    apiClient.get<PermissionGroup[]>('/roles/permissions'),
};
