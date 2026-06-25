// FILE: src/modules/operations/production/pages/ProductionListPage.tsx
import { useState } from 'react';
import { productionApi } from '@/shared/api/production.api';
import { useProductions } from '../hooks/useProductions';
import { ProductionForm } from '../components/ProductionForm';
import { PermissionGate } from '@/app/PermissionGate';
import { ProductionFormData } from '../production.schema';
import { Production } from '@/shared/types';
import { READ_ONLY } from '@/shared/config/readOnly';

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  draft:       { label: 'Draft',       bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  in_progress: { label: 'Berlangsung', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  completed:   { label: 'Selesai',     bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
  cancelled:   { label: 'Dibatalkan',  bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#f43f5e' },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const, fontFamily: 'inherit' }}>
      {children}
    </th>
  );
}

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose} />
      <div className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 560, maxHeight: '92vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #e11d48 0%, #f43f5e 55%, #fb7185 100%)', flexShrink: 0 }} />
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

function getPaginationPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ════════════════════════════════════════════════════════════════
export const ProductionListPage = () => {
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading, refetch } = useProductions({ page, limit: 10, search, status: status || undefined });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async (formData: ProductionFormData) => {
    try {
      setIsCreating(true);
      await productionApi.create({ ...formData, inputs: [] });
      setModalOpen(false); refetch(); showToast('Batch produksi berhasil dibuat');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || 'Gagal membuat produksi', 'error');
    } finally { setIsCreating(false); }
  };

  const handleStart = async (id: string, batchNo?: string) => {
    try {
      await productionApi.start(id); refetch(); showToast(`Batch ${batchNo} mulai diproses`);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || 'Gagal memulai produksi', 'error');
    }
  };

  const handleComplete = async (id: string, batchNo?: string) => {
    if (!confirm(`Tandai batch ${batchNo} sebagai selesai?`)) return;
    try {
      await productionApi.complete(id); refetch(); showToast(`Batch ${batchNo} berhasil diselesaikan`);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || 'Gagal menyelesaikan produksi', 'error');
    }
  };

  const pagination = data?.pagination;
  const hasFilter  = !!(search || status);

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl font-medium text-white"
          style={{ padding: '10px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #0e1420 0%, #1e1b4b 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: toast.type === 'error' ? '#f43f5e' : '#10b981', flexShrink: 0, display: 'inline-block', boxShadow: `0 0 0 3px ${toast.type === 'error' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}` }} />
          {toast.msg}
        </div>
      )}

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', boxShadow: '0 4px 12px rgba(225,29,72,0.28)' }}>
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Produksi</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Manajemen batch produksi</p>
              </div>
            </div>
            {!READ_ONLY && (
            <PermissionGate permission="operations.production.create">
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 font-semibold text-white rounded-xl"
                style={{ padding: '8px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', boxShadow: '0 4px 14px rgba(225,29,72,0.3)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(225,29,72,0.42)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(225,29,72,0.3)'}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Produksi Baru
              </button>
            </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Filter bar ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Filter</span>
              {hasFilter && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3' }}>Aktif</span>}
            </div>
            {hasFilter && (
              <button onClick={() => { setSearch(''); setStatus(''); setPage(1); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 p-3.5">
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </div>
              <input type="text" placeholder="Cari batch atau produk..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '8px 13px 8px 36px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: '#1e293b', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div className="relative" style={{ width: 180 }}>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '8px 32px 8px 13px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: status ? '#1e293b' : '#94a3b8', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                <option value="">Semua Status</option>
                {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table card ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {isLoading ? (
            <div style={{ padding: 4 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 120, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 180, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 80, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                  <div style={{ width: 60, height: 22, background: '#f1f5f9', borderRadius: 7 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#fff1f2', border: '1px solid #fecdd3' }}>
                <svg className="w-6 h-6" style={{ color: '#e11d48' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada produksi</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>
                {hasFilter ? 'Tidak ada hasil untuk filter ini.' : 'Klik "Produksi Baru" untuk membuat batch pertama.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> batch
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><TH>No. Batch</TH><TH>Produk</TH><TH>Kuantitas</TH><TH>Tanggal</TH><TH>Status</TH><TH>Aksi</TH></tr>
                  </thead>
                  <tbody>
                    {data.data.map((prod: Production) => {
                      const sc = STATUS_CONFIG[prod.status] ?? STATUS_CONFIG.draft;
                      return (
                        <tr key={prod.id} className="group"
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', fontFamily: 'ui-monospace, monospace' }}>{prod.batchNo || '—'}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#334155', fontWeight: 500 }}>{prod.productName}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                            {Number(prod.quantity).toLocaleString('id-ID')}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{fmtDate(prod.date)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="inline-flex items-center gap-1.5"
                              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                              {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {prod.status === 'draft' && !READ_ONLY && (
                                <PermissionGate permission="operations.production.edit">
                                  <button onClick={() => handleStart(prod.id, prod.batchNo)}
                                    style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#dbeafe'}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#eff6ff'}>
                                    Mulai
                                  </button>
                                </PermissionGate>
                              )}
                              {prod.status === 'in_progress' && !READ_ONLY && (
                                <PermissionGate permission="operations.production.edit">
                                  <button onClick={() => handleComplete(prod.id, prod.batchNo)}
                                    style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#065f46', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#dcfce7'}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}>
                                    Selesaikan
                                  </button>
                                </PermissionGate>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={{ fontSize: 12, color: '#64748b' }}>
                Halaman <strong style={{ color: '#1e293b' }}>{pagination.page}</strong> dari{' '}
                <strong style={{ color: '#1e293b' }}>{pagination.totalPages}</strong>
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(page - 1)} disabled={page <= 1}
                  className="flex items-center gap-1"
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontFamily: 'inherit' }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  Prev
                </button>
                {getPaginationPages(page, pagination.totalPages).map((p, idx) =>
                  p === '...'
                    ? <span key={`e-${idx}`} style={{ width: 30, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>…</span>
                    : (
                      <button key={p} onClick={() => setPage(p as number)}
                        style={{ width: 30, height: 30, fontSize: 12, fontWeight: p === page ? 700 : 500, borderRadius: 7, border: p === page ? 'none' : '1px solid #e2e8f0', background: p === page ? '#1e293b' : '#ffffff', color: p === page ? '#ffffff' : '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {p}
                      </button>
                    )
                )}
                <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}
                  className="flex items-center gap-1"
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page >= pagination.totalPages ? 0.4 : 1, fontFamily: 'inherit' }}>
                  Next
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create modal ─────────────────────────────────── */}
      {modalOpen && !READ_ONLY && (
        <ModalShell title="Batch Produksi Baru" subtitle="Isi detail batch produksi di bawah ini" onClose={() => setModalOpen(false)}>
          <ProductionForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} isLoading={isCreating} />
        </ModalShell>
      )}
    </div>
  );
};