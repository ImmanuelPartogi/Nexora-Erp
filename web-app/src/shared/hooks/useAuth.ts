// ============================================
// FILE: web-app/src/shared/hooks/useAuth.ts
// Convenience selectors + permission helpers for the auth store.
// ============================================
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const companies = useAuthStore((s) => s.companies);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const activeCompanyName = useAuthStore((s) => s.activeCompanyName);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setCompany = useAuthStore((s) => s.setCompany);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const logout = useAuthStore((s) => s.logout);

  const isAuthenticated = Boolean(token && user);
  const hasMultipleCompanies = companies.length > 1;

  const can = (code: string) => permissions.includes(code);
  const canAny = (codes: string[]) => codes.some((c) => permissions.includes(c));

  return {
    token,
    user,
    permissions,
    companies,
    activeCompanyId,
    activeCompanyName,
    activeRole,
    isAuthenticated,
    hasMultipleCompanies,
    can,
    canAny,
    setAuth,
    setCompany,
    setPermissions,
    logout,
  };
}