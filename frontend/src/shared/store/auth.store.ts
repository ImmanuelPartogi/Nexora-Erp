// ============================================
// FILE: frontend/src/shared/store/auth.store.ts
// Updated: Synchronous localStorage init to prevent race conditions
// ============================================

import { create } from 'zustand';
import { AuthUser, CompanyAccess } from '../types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  companies: CompanyAccess[];
  permissions: string[];
  isAuthenticated: boolean;
  
  setAuth: (token: string, user: AuthUser, companies: CompanyAccess[], permissions?: string[]) => void;
  clearAuth: () => void;
  updateUser: (user: AuthUser) => void;
  setPermissions: (permissions: string[]) => void;
  initAuth: () => void;
}

// ── Synchronous init from localStorage ────────────────────────
// Prevents race condition where components render with empty state
// before useEffect-based initAuth() runs (caused "no modules" bug).
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null, companies: [], permissions: [], isAuthenticated: false };
  }
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const companiesStr = localStorage.getItem('companies');
  const permissionsStr = localStorage.getItem('permissions');

  if (token && userStr && companiesStr) {
    try {
      const user = JSON.parse(userStr) as AuthUser;
      const companies = JSON.parse(companiesStr) as CompanyAccess[];
      const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
      return { token, user, companies, permissions, isAuthenticated: true };
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('companies');
      localStorage.removeItem('permissions');
    }
  }
  return { token: null, user: null, companies: [], permissions: [], isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setAuth: (token, user, companies, permissions = []) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('companies', JSON.stringify(companies));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    
    set({
      token,
      user,
      companies,
      permissions,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('companies');
    localStorage.removeItem('activeCompanyId');
    localStorage.removeItem('permissions');
    
    set({
      token: null,
      user: null,
      companies: [],
      permissions: [],
      isAuthenticated: false,
    });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setPermissions: (permissions) => {
    localStorage.setItem('permissions', JSON.stringify(permissions));
    set({ permissions });
  },

  initAuth: () => {
    // Kept for backward compatibility; but state is now initialized synchronously.
    // This acts as a safety net to re-sync if localStorage changes externally.
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const companiesStr = localStorage.getItem('companies');
    const permissionsStr = localStorage.getItem('permissions');

    if (token && userStr && companiesStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser;
        const companies = JSON.parse(companiesStr) as CompanyAccess[];
        const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
        
        set({
          token,
          user,
          companies,
          permissions,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('companies');
        localStorage.removeItem('permissions');
      }
    }
  },
}));