// FILE: src/modules/operations/transaction/pages/TransactionDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionApi } from '@/shared/api/transaction.api';
import { Transaction } from '@/shared/types';
import { TransactionForm } from '../components/TransactionForm';
import { PermissionGate } from '@/app/PermissionGate';
import { TransactionFormData } from '../transaction.schema';

// ── Config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  draft:     { label: 'Draft',      bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  approved:  { label: 'Disetujui',  bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
  cancelled: { label: 'Dibatalkan', bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#f43f5e' },
};

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string; amountColor: string }> = {
  income:  { label: 'Pemasukan',   bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981', amountColor: '#059669' },
  expense: { label: 'Pengeluaran', bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#f43f5e', amountColor: '#ef4444' },
};

const fmtIDR  = (n: number, type: string) => (type === 'income' ? '+' : '−') + ' Rp ' + n.toLocaleString('id-ID');
const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4" style={{ padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', width: 120, flexShrink: 0, paddingTop: 2 }}>
      {label}
    </span>
    <span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: 500, flex: 1 }}>
      {value || <span style={{ color: '#cbd5e1', fontWeight: 400 }}>—</span>}
    </span>
  </div>
);

function SectionCard({ dotColor, title, children }: { dotColor: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>{title}</span>
      </div>
      <div style={{ padding: '0 20px 8px' }}>{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export const TransactionDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [editOpen,    setEditOpen]    = useState(false);
  const [isUpdating,  setIsUpdating]  = useState(false);
  const [toast,       setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchTransaction = async () => {
    try {
      setIsLoading(true);
      const data = await transactionApi.getById(id!);
      setTransaction(data);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => { fetchTransaction(); }, [id]);

  const handleUpdate = async (formData: TransactionFormData) => {
    try {
      setIsUpdating(true);
      await transactionApi.update(id!, formData);
      setEditOpen(false); showToast('Transaksi berhasil diperbarui');
      fetchTransaction();
    } catch { alert('Gagal memperbarui transaksi.'); }
    finally { setIsUpdating(false); }
  };

  const handleApprove = async () => {
    if (!confirm('Setujui transaksi ini?')) return;
    try { await transactionApi.approve(id!); showToast('Transaksi berhasil disetujui'); fetchTransaction(); }
    catch { alert('Gagal menyetujui transaksi.'); }
  };

  const handleCancel = async () => {
    if (!confirm('Batalkan transaksi ini?')) return;
    try { await transactionApi.cancel(id!); showToast('Transaksi dibatalkan'); fetchTransaction(); }
    catch { alert('Gagal membatalkan transaksi.'); }
  };

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5 flex items-center gap-3 animate-pulse">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 200, height: 16, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 140, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid #e9ecef' }}>
              {[0, 1, 2, 3].map((j) => <div key={j} style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 14 }} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4"
            style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg className="w-7 h-7" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Transaksi tidak ditemukan</p>
          <button onClick={() => navigate('/transactions')}
            style={{ marginTop: 14, padding: '8px 18px', fontSize: 13.5, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const sc = STATUS_CONFIG[transaction.status] ?? STATUS_CONFIG.draft;
  const tc = TYPE_CONFIG[transaction.type]     ?? TYPE_CONFIG.income;

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl font-medium text-white"
          style={{ padding: '10px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #0e1420 0%, #1e1b4b 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          {toast}
        </div>
      )}

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-start justify-between gap-4">

            {/* Left */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => navigate('/transactions')}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Transaksi
              </button>

              <svg className="w-3 h-3" style={{ color: '#e2e8f0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <svg width={20} height={20} style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {transaction.referenceNo || `TRX-${transaction.id.slice(0, 8).toUpperCase()}`}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2" style={{ marginTop: 5 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                      {fmtDate(transaction.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
                      {tc.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                      {sc.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {transaction.status === 'draft' && (
                <>
                  <PermissionGate permission="operations.transaction.edit">
                    <button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5"
                      style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                      Edit
                    </button>
                  </PermissionGate>
                  <PermissionGate permission="operations.transaction.approve">
                    <button onClick={handleApprove} className="flex items-center gap-1.5"
                      style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#065f46', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#dcfce7'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Setujui
                    </button>
                  </PermissionGate>
                  <PermissionGate permission="operations.transaction.delete">
                    <button onClick={handleCancel} className="flex items-center gap-1.5"
                      style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ffe4e6'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Batalkan
                    </button>
                  </PermissionGate>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ──────────────────────────────────── */}
      <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <SectionCard dotColor="#059669" title="Informasi Transaksi">
          <DetailRow label="No. Referensi" value={transaction.referenceNo} />
          <DetailRow label="Kategori"      value={transaction.category} />
          <DetailRow label="Tanggal"       value={fmtDate(transaction.date)} />
          <DetailRow label="Tipe"          value={
            <span className="inline-flex items-center gap-1.5"
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
              {tc.label}
            </span>
          } />
        </SectionCard>

        {/* Financial card */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>Keuangan</span>
          </div>
          <div style={{ padding: '0 20px 8px' }}>
            <DetailRow label="Jumlah" value={
              <span style={{ fontSize: 22, fontWeight: 800, color: tc.amountColor }}>
                {fmtIDR(Number(transaction.amount), transaction.type)}
              </span>
            } />
            <DetailRow label="Status" value={
              <span className="inline-flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                {sc.label}
              </span>
            } />
          </div>
        </div>

        <SectionCard dotColor="#94a3b8" title="Informasi Tambahan">
          <DetailRow label="Deskripsi"  value={transaction.description} />
          <DetailRow label="Dibuat"     value={fmtDate(transaction.createdAt)} />
          <DetailRow label="Diperbarui" value={fmtDate(transaction.updatedAt)} />
        </SectionCard>
      </div>

      {/* ── Edit modal ────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={() => setEditOpen(false)} />
          <div className="relative bg-white w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 560, maxHeight: '92vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, #059669 0%, #10b981 55%, #34d399 100%)', flexShrink: 0 }} />
            <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Edit Transaksi</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Perbarui informasi transaksi</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <TransactionForm transaction={transaction} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} isLoading={isUpdating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};