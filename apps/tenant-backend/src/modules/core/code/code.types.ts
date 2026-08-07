// ============================================
// FILE: backend/src/modules/core/code/code.types.ts
// Type definitions for Code Configuration module
// ============================================

export interface CreateCodeConfigRequest {
  entity: string;
  prefix: string;
  digitCount: number;
}

export interface UpdateCodeConfigRequest {
  prefix?: string;
  digitCount?: number;
  isActive?: boolean;
}

export interface CodeConfigResponse {
  id: string;
  entity: string;
  prefix: string;
  digitCount: number;
  lastNumber: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeGenerationRequest {
  entity: string;
}

export interface CodeGenerationResponse {
  code: string;
  entity: string;
  prefix: string;
  nextNumber: number;
}