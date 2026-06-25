// src/app/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeCompanyId = useCompanyStore((state) => state.activeCompanyId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!activeCompanyId) {
    return <Navigate to="/select-company" replace />;
  }

  return <>{children}</>;
};









