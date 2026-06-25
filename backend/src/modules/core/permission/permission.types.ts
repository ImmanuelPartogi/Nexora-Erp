// ============================================
// src/modules/core/permission/permission.types.ts
// ============================================
export interface PermissionListQuery {
  page?: number;
  limit?: number;
  moduleCode?: string;
  action?: string;
  search?: string;
}

export interface PermissionByModuleResponse {
  [moduleCode: string]: {
    moduleName: string;
    permissions: Array<{
      id: string;
      code: string;
      action: string;
      description: string | null;
    }>;
  };
}