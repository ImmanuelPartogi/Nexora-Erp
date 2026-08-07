  // FILE: src/shared/api/audit.api.ts
  import { apiClient } from './client';
  import { AuditLog, PaginatedResponse, ListQueryParams } from '../types';

  export const auditApi = {
    list: (params?: ListQueryParams & { module?: string; action?: string; userId?: string }) => 
      apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', params),

    getById: (id: string) => 
      apiClient.get<AuditLog>(`/audit-logs/${id}`),
  };