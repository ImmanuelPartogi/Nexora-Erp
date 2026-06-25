// ============================================
// FILE: web-app/src/app/router.tsx
// Route definitions: public login + protected app routes.
// ============================================
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { FullScreenSpinner } from '../shared/components/LoadingSpinner';
import { BottomNav } from '../shared/components/BottomNav';
import { useAuth } from '../shared/hooks/useAuth';

// Lazy-load pages for code-splitting.
const LoginPage = lazy(() => import('../modules/auth/LoginPage'));
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const TransactionListPage = lazy(
  () => import('../modules/transaction/TransactionListPage')
);
const TransactionDetailPage = lazy(
  () => import('../modules/transaction/TransactionDetailPage')
);
const StockListPage = lazy(() => import('../modules/stock/StockListPage'));
const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'));

/** Layout shell for authenticated routes: content + bottom nav. */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 pb-16">{children}</div>
      <BottomNav />
    </div>
  );
}

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            }
          />
          <Route
            path="/transactions"
            element={
              <AppLayout>
                <TransactionListPage />
              </AppLayout>
            }
          />
          <Route
            path="/transactions/:id"
            element={
              <AppLayout>
                <TransactionDetailPage />
              </AppLayout>
            }
          />
          <Route
            path="/stock"
            element={
              <AppLayout>
                <StockListPage />
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}