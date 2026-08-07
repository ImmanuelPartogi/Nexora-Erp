// src/shared/hooks/usePermission.ts
import { useCompanyStore } from '../store/company.store';

export const usePermission = (permission: string): boolean => {
  return useCompanyStore((state) => state.hasPermission(permission));
};

export const usePermissions = (permissions: string[]): boolean => {
  const hasPermission = useCompanyStore((state) => state.hasPermission);
  return permissions.every((p) => hasPermission(p));
};