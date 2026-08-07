// src/shared/api/auth.api.ts
import { apiClient } from './client';
import { LoginResponse, User, CompanyAccess } from '../types';

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

export const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) => 
    apiClient.post<LoginResponse>('/auth/register', data),

  getProfile: () => 
    apiClient.get<{ user: User; companies: CompanyAccess[] }>('/auth/profile'),
};