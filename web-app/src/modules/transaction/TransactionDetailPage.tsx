// ============================================
// FILE: web-app/src/modules/transaction/TransactionDetailPage.tsx
// Transaction detail with info section + approve action.
// ============================================
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { FullScreenSpinner } from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { statusTone } from '../../shared/constants/statusTone';
import { CheckIcon } from '../../shared/components/Icons';
import { useResource } from '../../shared/hooks/useResource';
import { useAuth } from '../../shared/hooks/useAuth';
import { apiClient } from '../../shared/api/client';
import { transactionApi } from './transaction.api';
import type { Transaction } from '../../shared/types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n || 0);

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { can } = useAuth();
  const [approving, setApproving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetcher = useCallback(
    () => transactionApi.getById(id),
    [id]
  );
  const { data: tx, loading, error, refetch } = useResource<Transaction>(
    fetcher,
    [id]
  );

  const canApprove =
    tx?.status === 'draft' && can('transaction.approve');

  const handleApprove = async () => {
    setActionError(null);
    setApproving(true);
    try {
      await transactionApi.approve(id);
      refetch();
    } catch (err) {
      setActionError(apiClient.getMessage(err));
    } finally {
      setApproving(false);
    }
  };

  if (loading) return (
    <>
      <PageHeader title="Detail Transaksi" showBack />
      <FullScreenSpinner />
    </>
  );

  if (error || !tx) return (
    <>
      <PageHeader title="Detail Transaksi" showBack />
      <EmptyState
        error
        title="Gagal memuat transaksi"
        description={error ?? undefined}
        onRetry={refetch}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title={tx.code || 'Detail Transaksi'}
        subtitle={tx.category ?? undefined}
        showBack
        action={
          <StatusBadge tone={statusTone(tx.status)}>
            {tx.status}
          </StatusBadge>
        }
      />

      <main className="app-content mx-auto max-w-md space-y-4 px-4">
        {/* Amount hero */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              tx.type === 'income' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatCurrency(tx.amount)}
          </p>
        </section>

        {/* Info */}
        <section className="rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-sm">
          <h2 className="border-b border-gray-100 py-2 text-sm font-semibold text-gray-700">
            Informasi Transaksi
          </h2>
          <Row label="Tanggal" value={formatDateTime(tx.date)} />
          {tx.category && <Row label="Kategori" value={tx.category} />}
          <Row
            label="Tipe"
            value={tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          />
          <Row label="Dibuat" value={formatDateTime(tx.createdAt)} />
        </section>

        {/* Description */}
        {tx.description && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-gray-700">
              Deskripsi
            </h2>
            <p className="text-sm text-gray-600">{tx.description}</p>
          </section>
        )}

        {/* Action */}
        {canApprove && (
          <section className="space-y-2">
            {actionError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving}
              className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white active:bg-emerald-700 disabled:opacity-60"
            >
              <CheckIcon size={18} />
              {approving ? 'Memproses...' : 'Setujui Transaksi'}
            </button>
          </section>
        )}
      </main>
    </>
  );
}