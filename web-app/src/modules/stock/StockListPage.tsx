// ============================================
// FILE: web-app/src/modules/stock/StockListPage.tsx
// Stock list with search + warehouse bottom-sheet filter.
// ============================================
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { ListItemSkeleton } from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';
import { SearchIcon, BuildingIcon, XIcon } from '../../shared/components/Icons';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { stockApi } from './stock.api';
import { apiClient } from '../../shared/api/client';
import type { Stock, Warehouse } from '../../shared/types';

const LOW_STOCK_THRESHOLD = 10;

export default function StockListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [items, setItems] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Load warehouses once for the filter.
  useEffect(() => {
    stockApi
      .warehouses()
      .then(setWarehouses)
      .catch(() => setWarehouses([]));
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockApi.list({
        search: debouncedSearch || undefined,
        warehouseId,
        limit: 100,
      });
      setItems(res.data);
    } catch (err) {
      setError(apiClient.getMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, warehouseId]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const activeWarehouse = warehouses.find((w) => w.id === warehouseId);

  return (
    <>
      <PageHeader title="Stok" />

      {/* Sticky search + warehouse filter */}
      <div className="sticky top-[56px] z-10 space-y-2 border-b border-gray-100 bg-gray-50/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="tap-target w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap-target flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-600"
        >
          <span className="flex items-center gap-2">
            <BuildingIcon size={16} />
            {activeWarehouse ? activeWarehouse.name : 'Semua Gudang'}
          </span>
          <span className="text-xs text-brand-600">
            {warehouseId ? 'Ubah' : 'Pilih'}
          </span>
        </button>
      </div>

      <main className="app-content mx-auto max-w-md space-y-3 px-4">
        {error ? (
          <EmptyState
            error
            title="Gagal memuat stok"
            description={error}
            onRetry={fetchStocks}
          />
        ) : loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))
        ) : items.length === 0 ? (
          <EmptyState title="Tidak ada stok" description="Coba ubah filter." />
        ) : (
          <ul className="space-y-3">
            {items.map((s) => {
              const low = s.quantity < LOW_STOCK_THRESHOLD;
              return (
                <li key={s.id}>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {s.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {s.productCode || '—'} • {s.warehouseName}
                        </p>
                      </div>
                      {low && (
                        <StatusBadge tone="red">Stok Menipis</StatusBadge>
                      )}
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Jumlah</p>
                        <p
                          className={`text-xl font-bold ${
                            low ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          {s.quantity}{' '}
                          <span className="text-sm font-normal text-gray-400">
                            {s.productUnit || 'unit'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Warehouse bottom sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-4 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Pilih Gudang
              </h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="tap-target -mr-2 flex items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
                aria-label="Tutup"
              >
                <XIcon size={20} />
              </button>
            </div>
            <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setWarehouseId(undefined);
                    setSheetOpen(false);
                  }}
                  className={`tap-target flex w-full items-center justify-between rounded-xl px-4 text-left text-sm ${
                    !warehouseId
                      ? 'bg-brand-50 font-semibold text-brand-700'
                      : 'text-gray-700 active:bg-gray-50'
                  }`}
                >
                  Semua Gudang
                </button>
              </li>
              {warehouses.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setWarehouseId(w.id);
                      setSheetOpen(false);
                    }}
                    className={`tap-target flex w-full items-center justify-between rounded-xl px-4 text-left text-sm ${
                      warehouseId === w.id
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    {w.name}
                    {w.code && (
                      <span className="text-xs text-gray-400">{w.code}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}