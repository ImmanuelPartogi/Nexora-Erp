// ============================================
// FILE: web-app/src/modules/transaction/TransactionListPage.tsx
// Search + filter chips + card list with load-more.
// ============================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { ListItemSkeleton } from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { statusTone } from '../../shared/constants/statusTone';
import { SearchIcon } from '../../shared/components/Icons';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { transactionApi } from './transaction.api';
import { apiClient } from '../../shared/api/client';
import type {
  Pagination,
  Transaction,
  TransactionStatus,
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

type Filter = 'all' | TransactionStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'draft', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
];

export default function TransactionListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const [items, setItems] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Debounce search input (300ms).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Initial / filtered fetch (resets to page 1).
  const fetchFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const res = await transactionApi.list({
        page: 1,
        limit: 10,
        search: debouncedSearch || undefined,
        status: filter === 'all' ? undefined : filter,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(apiClient.getMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchFirst();
  }, [fetchFirst]);

  const canLoadMore =
    pagination && pagination.page < pagination.totalPages;

  const loadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await transactionApi.list({
        page: nextPage,
        limit: 10,
        search: debouncedSearch || undefined,
        status: filter === 'all' ? undefined : filter,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setItems((prev) => [...prev, ...res.data]);
      setPagination(res.pagination);
      setPage(nextPage);
    } catch (err) {
      setError(apiClient.getMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  // Sentinel for infinite scroll via IntersectionObserver.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !canLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadMore, loadingMore, debouncedSearch, filter]);

  return (
    <>
      <PageHeader title="Transaksi" />

      {/* Sticky search + filters */}
      <div className="sticky top-[56px] z-10 space-y-2 border-b border-gray-100 bg-gray-50/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="tap-target w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`tap-target shrink-0 rounded-full px-4 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <main className="app-content mx-auto max-w-md space-y-3 px-4">
        {error ? (
          <EmptyState
            error
            title="Gagal memuat data"
            description={error}
            onRetry={fetchFirst}
          />
        ) : loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi"
            description="Coba ubah kata kunci atau filter."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/transactions/${t.id}`}
                  className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">
                      {t.code || t.category || 'Transaksi'}
                    </span>
                    <StatusBadge tone={statusTone(t.status)}>
                      {t.status}
                    </StatusBadge>
                  </div>
                  {t.description && (
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {t.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDate(t.date)}
                    </span>
                    <span
                      className={`text-sm font-bold ${
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

        {/* Infinite scroll sentinel */}
        {canLoadMore && (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center py-4"
          >
            {loadingMore && <LoadingSpinner size={20} />}
          </div>
        )}
      </main>
    </>
  );
}