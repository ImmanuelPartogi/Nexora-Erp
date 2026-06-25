// ============================================
// FILE: web-app/src/shared/hooks/usePermission.ts
// React bindings for the permission helpers in the auth store.
// ============================================
import { useAuthStore } from '../store/auth.store';

/** Returns true if the current user has the given permission. */
export const usePermission = (permission: string): boolean => {
  return useAuthStore((state) => state.permissions.includes(permission));
};

/** Returns true if the current user has ALL of the given permissions. */
export const usePermissions = (permissions: string[]): boolean => {
  const userPermissions = useAuthStore((state) => state.permissions);
  return permissions.every((p) => userPermissions.includes(p));
};

/** Returns true if the current user has ANY of the given permissions. */
export const useAnyPermission = (permissions: string[]): boolean => {
  const userPermissions = useAuthStore((state) => state.permissions);
  return permissions.some((p) => userPermissions.includes(p));
};