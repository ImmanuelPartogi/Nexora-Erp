// ============================================
// FILE 1: src/modules/core/audit/audit.types.ts
// ============================================
export interface AuditLogListQuery {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  action?: string;
  userId?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogResponse {
  id: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  oldData?: string;
  newData?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}