// ============================================
// FILE: web-app/src/app/PermissionGate.tsx
// Conditionally render children based on a permission code.
// Supports single permission OR any-of (permissions[]) modes.
// ============================================
import type { ReactNode } from 'react';
import { usePermission, useAnyPermission } from '../shared/hooks/usePermission';

interface PermissionGateProps {
  /** Single permission code required to render children. */
  permission?: string;
  /** Alternative: render children if user has ANY of these permissions. */
  anyOf?: string[];
  children: ReactNode;
  /** Rendered when permission is missing. Defaults to null. */
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  anyOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasSingle = usePermission(permission ?? '');
  const hasAny = useAnyPermission(anyOf ?? []);

  const allowed = permission ? hasSingle : anyOf ? hasAny : true;

  return <>{allowed ? children : fallback}</>;
}