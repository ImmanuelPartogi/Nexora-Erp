// ============================================
// FILE: web-app/src/modules/auth/auth.api.ts
// Auth endpoints. Login returns token + user + companies + permissions.
// ============================================
import { apiClient } from '../../shared/api/client';
import type { LoginResponse } from '../../shared/types';

export const authApi = {
  /**
   * POST /auth/login
   * Backend responds with { token, user, companies, permissions }.
   */
  login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  /** GET /auth/me — fetch the current user profile (token required). */
  me(): Promise<{ id: string; name: string; email: string }> {
    return apiClient.get('/auth/me');
  },
};