// ============================================
// FILE: backend/src/modules/data/employee/employee.types.ts
// ✅ UPDATED: Support creating User account from Employee
// ============================================

export interface CreateEmployeeRequest {
  // Employee basic info
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: Date;
  salary?: number;
  
  // ✅ TAMBAHAN: User account creation (optional)
  createUserAccount?: boolean;  // Flag untuk create user account
  password?: string;            // Password untuk user account
  roleId?: string;              // Role yang akan di-assign
}

export interface UpdateEmployeeRequest {
  // Employee basic info
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: Date;
  salary?: number;
  status?: string; // active, inactive, resigned
  isActive?: boolean;
  
  // ✅ TAMBAHAN: Update user account
  updateUserAccount?: boolean;  // Flag untuk update user account
  password?: string;            // Update password (optional)
  roleId?: string;              // Update role
  userIsActive?: boolean;       // Activate/deactivate user account
}

export interface EmployeeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  isActive?: boolean;
  hasUserAccount?: boolean;     // ✅ TAMBAHAN: Filter by user account status
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeResponse {
  id: string;
  companyId: string;
  userId?: string;              // ✅ TAMBAHAN
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: Date;
  salary?: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // ✅ TAMBAHAN: User account info (if exists)
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    role?: {
      id: string;
      name: string;
    };
  };
}