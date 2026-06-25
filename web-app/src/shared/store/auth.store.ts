// ============================================
// FILE: web-app/src/shared/store/auth.store.ts
// Zustand auth store (persisted to localStorage).
// Single source of truth — never touch localStorage directly elsewhere.
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, CompanyAccess } from '../types';

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: string[];
  companies: CompanyAccess[];
  activeCompanyId: string | null;
  activeCompanyName: string | null;
  activeRole: string | null;
  setAuth: (data: {
    token: string;
    user: AuthUser;
    permissions: string[];
    companies: CompanyAccess[];
  }) => void;
  setCompany: (id: string, name: string, role?: string) => void;
  setPermissions: (permissions: string[]) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: [],
      companies: [],
      activeCompanyId: null,
      activeCompanyName: null,
      activeRole: null,

      setAuth: ({ token, user, permissions, companies }) =>
        set({
          token,
          user,
          permissions,
          companies,
          // Default to the first company if none is active yet.
          activeCompanyId: companies[0]?.id ?? null,
          activeCompanyName: companies[0]?.name ?? null,
          activeRole: companies[0]?.role ?? null,
        }),

      setCompany: (id, name, role) =>
        set({
          activeCompanyId: id,
          activeCompanyName: name,
          activeRole: role ?? null,
        }),

      setPermissions: (permissions) => set({ permissions }),

      hasPermission: (permission) => get().permissions.includes(permission),

      hasAnyPermission: (permissions) =>
        permissions.some((p) => get().permissions.includes(p)),

      logout: () =>
        set({
          token: null,
          user: null,
          permissions: [],
          companies: [],
          activeCompanyId: null,
          activeCompanyName: null,
          activeRole: null,
        }),
    }),
    {
      name: 'nexora_web_auth',
    }
  )
);