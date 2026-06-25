// src/app/App.tsx
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';

export const App = () => {
  const initAuth = useAuthStore((state) => state.initAuth);
  const initCompany = useCompanyStore((state) => state.initCompany);

  useEffect(() => {
    initAuth();
    initCompany();
  }, [initAuth, initCompany]);

  return <RouterProvider router={router} />;
};