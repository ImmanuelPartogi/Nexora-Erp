// ============================================
// src/modules/core/user/user.types.ts
// ============================================
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  roleId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  companyUser?: {
    role: {
      id: string;
      name: string;
    };
  };
}