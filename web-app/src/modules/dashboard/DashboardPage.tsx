// ============================================
// FILE: web-app/src/modules/dashboard/DashboardPage.tsx
// Metric grid + recent transactions.
// ============================================
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import {
  ListItemSkeleton,
  MetricCardSkeleton,
} from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { statusTone } from '../../shared/constants/statusTone';
import { PullToRefresh } from '../../shared/components/PullToRefresh';
import { useResource } from '../../shared/hooks/useResource';
import { useAuth } from '../../shared/hooks/useAuth';
import { apiClient } from '../../shared/api/client';
import { transactionApi } from '../transaction/transaction.api';
import type {
  DashboardStats,
  Transaction,
} from '../../shared/types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n || 0);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function DashboardPage() {
  const { user, activeCompanyName } = useAuth();

  const fetchDashboard = useCallback(
    () => apiClient.get<DashboardStats>('/reports/dashboard'),
    []
  );
  const { data: stats, loading, error, refetch } = useResource(fetchDashboard, []);

  // Recent 5 transactions (independent fetch for resilience).
  const fetchRecent = useCallback(
    () => transactionApi.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  );
  const {
    data: recent,
    loading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useResource(fetchRecent, []);

  const metrics = useMemo(() => {
    const f = stats?.financial;
    return [
      {
        label: 'Transaksi Hari Ini',
        value: f?.todayTransactions ?? 0,
        tone: 'text-brand-600',
      },
      {
        label: 'Pendapatan Bulan Ini',
        value: formatCurrency(f?.monthlyRevenue ?? 0),
        tone: 'text-emerald-600',
      },
      {
        label: 'Item Stok',
        value: stats?.operations?.stockItems ?? 0,
        tone: 'text-blue-600',
      },
      {
        label: 'Pengeluaran Bulan Ini',
        value: formatCurrency(f?.monthlyExpense ?? 0),
        tone: 'text-amber-600',
      },
    ];
  }, [stats]);

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchRecent()]);
  };

  return (
    <>
      <PageHeader
        title={`Halo, ${user?.name?.split(' ')[0] ?? 'User'}`}
        subtitle={activeCompanyName ?? undefined}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="app-content mx-auto max-w-md space-y-6 px-4">
          {/* Metrics */}
          <section>
            <h2 className="mb-2 px-1 text-sm font-semibold text-gray-500">
              Ringkasan
            </h2>
            {error ? (
              <EmptyState
                error
                title="Gagal memuat data"
                description={error}
                onRetry={refetch}
              />
            ) : loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <p className="text-xs font-medium text-gray-500">
                      {m.label}
                    </p>
                    <p className={`mt-2 text-lg font-bold ${m.tone}`}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent transactions */}
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-gray-500">
                Transaksi Terbaru
              </h2>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-brand-600"
              >
                Lihat semua
              </Link>
            </div>

            {recentError ? (
              <EmptyState
                error
                title="Gagal memuat transaksi"
                onRetry={refetchRecent}
              />
            ) : recentLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            ) : !recent || !Array.isArray(recent.data) || recent.data.length === 0 ? (
              <EmptyState title="Belum ada transaksi" />
            ) : (
              <ul className="space-y-3">
                {recent.data.map((t: Transaction) => (
                  <li key={t.id}>
                    <Link
                      to={`/transactions/${t.id}`}
                      className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">
                          {t.code || t.category || 'Transaksi'}
                        </span>
                        <StatusBadge tone={statusTone(t.status)}>
                          {t.status}
                        </StatusBadge>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(t.date)}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            t.type === 'income'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </PullToRefresh>
    </>
  );
}