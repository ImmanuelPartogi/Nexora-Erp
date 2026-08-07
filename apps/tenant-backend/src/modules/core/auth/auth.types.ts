// src/modules/core/auth/auth.types.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface CompanyAccess {
  id: string;
  name: string;
  role: string;
}

// ✅ UPDATED: Tambahkan permissions
export interface LoginResponse {
  token: string;
  user: AuthUser;
  companies: CompanyAccess[];
  permissions: string[]; // ✅ TAMBAHAN INI
}