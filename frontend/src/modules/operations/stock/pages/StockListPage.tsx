// FILE: src/modules/operations/stock/pages/StockListPage.tsx
import { useState } from 'react';
import { stockApi } from '@/shared/api/stock.api';
import { useStocks } from '../hooks/useStocks';
import { StockInForm } from '../components/StockInForm';
import { StockOutForm } from '../components/StockOutForm';
import { PermissionGate } from '@/app/PermissionGate';
import { StockInFormData, StockOutFormData } from '../stock.schema';
import { Stock } from '@/shared/types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const, fontFamily: 'inherit' }}>
      {children}
    </th>
  );
}

function ModalShell({ title, subtitle, accentFrom, accentTo, onClose, children }: {
  title: string; subtitle?: string; accentFrom: string; accentTo: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose} />
      <div className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 520, maxHeight: '92vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accentFrom} 0%, ${accentTo} 100%)`, flexShrink: 0 }} />
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
export const StockListPage = () => {
  const [page,           setPage]           = useState(1);
  const [stockInOpen,    setStockInOpen]    = useState(false);
  const [stockOutOpen,   setStockOutOpen]   = useState(false);
  const [isProcessing,   setIsProcessing]   = useState(false);
  const [toast,          setToast]          = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading, refetch } = useStocks({ page, limit: 10 });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const handleStockIn = async (formData: StockInFormData) => {
    try {
      setIsProcessing(true);
      await stockApi.movement({ ...formData, type: 'in' });
      setStockInOpen(false); refetch(); showToast('Stok masuk berhasil diproses');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || 'Gagal memproses stok masuk', 'error');
    } finally { setIsProcessing(false); }
  };

  const handleStockOut = async (formData: StockOutFormData) => {
    try {
      setIsProcessing(true);
      const check = await stockApi.checkStock(formData.productId, formData.warehouseId);
      if (check.quantity < formData.quantity) {
        showToast(`Stok tidak cukup! Tersedia: ${check.quantity} ${check.productUnit || ''}, Diminta: ${formData.quantity} ${check.productUnit || ''}`, 'error');
        return;
      }
      await stockApi.movement({ ...formData, type: 'out' });
      setStockOutOpen(false); refetch(); showToast('Stok keluar berhasil diproses');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError.response?.data?.message || 'Gagal memproses stok keluar', 'error');
    } finally { setIsProcessing(false); }
  };

  const pagination = data?.pagination;

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
                style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', boxShadow: '0 4px 12px rgba(13,148,136,0.28)' }}>
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Stok</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Manajemen level inventori</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PermissionGate permission="operations.stock.create">
                <button onClick={() => setStockInOpen(true)}
                  className="flex items-center gap-1.5 font-semibold text-white rounded-xl"
                  style={{ padding: '8px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', boxShadow: '0 4px 14px rgba(13,148,136,0.3)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(13,148,136,0.42)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(13,148,136,0.3)'}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Stok Masuk
                </button>
              </PermissionGate>
              <PermissionGate permission="operations.stock.create">
                <button onClick={() => setStockOutOpen(true)}
                  className="flex items-center gap-1.5 font-semibold rounded-xl"
                  style={{ padding: '8px 16px', fontSize: 13.5, fontWeight: 600, color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ccfbf1'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#f0fdfa'}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                  Stok Keluar
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Table card ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {isLoading ? (
            <div style={{ padding: 4 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 180, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 120, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 70, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#f0fdfa', border: '1px solid #99f6e4' }}>
                <svg className="w-6 h-6" style={{ color: '#0d9488' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada data stok</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>Mulai dengan memproses stok masuk pertama.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> item stok
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><TH>Produk</TH><TH>Gudang</TH><TH>Kuantitas</TH><TH>Terakhir Diperbarui</TH></tr>
                  </thead>
                  <tbody>
                    {data.data.map((stock: Stock) => {
                      const qty = Number(stock.quantity);
                      const low = qty <= 10;
                      return (
                        <tr key={stock.id} className="group"
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{stock.productName}</p>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{stock.warehouseName}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: 14, fontWeight: 700, color: low ? '#991b1b' : '#0f172a' }}>
                                {qty.toLocaleString('id-ID')}
                              </span>
                              {stock.productUnit && <span style={{ fontSize: 11, color: '#94a3b8' }}>{stock.productUnit}</span>}
                              {low && (
                                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3' }}>Rendah</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{fmtDate(stock.updatedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

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
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>Prev
                </button>
                {getPaginationPages(page, pagination.totalPages).map((p, idx) =>
                  p === '...'
                    ? <span key={`e-${idx}`} style={{ width: 30, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>…</span>
                    : <button key={p} onClick={() => setPage(p as number)} style={{ width: 30, height: 30, fontSize: 12, fontWeight: p === page ? 700 : 500, borderRadius: 7, border: p === page ? 'none' : '1px solid #e2e8f0', background: p === page ? '#1e293b' : '#ffffff', color: p === page ? '#ffffff' : '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                )}
                <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}
                  className="flex items-center gap-1"
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page >= pagination.totalPages ? 0.4 : 1, fontFamily: 'inherit' }}>
                  Next<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {stockInOpen && (
        <ModalShell title="Stok Masuk" subtitle="Proses penerimaan stok ke gudang" accentFrom="#0d9488" accentTo="#2dd4bf" onClose={() => setStockInOpen(false)}>
          <StockInForm onSubmit={handleStockIn} onCancel={() => setStockInOpen(false)} isLoading={isProcessing} />
        </ModalShell>
      )}
      {stockOutOpen && (
        <ModalShell title="Stok Keluar" subtitle="Proses pengeluaran stok dari gudang" accentFrom="#0d9488" accentTo="#2dd4bf" onClose={() => setStockOutOpen(false)}>
          <StockOutForm onSubmit={handleStockOut} onCancel={() => setStockOutOpen(false)} isLoading={isProcessing} />
        </ModalShell>
      )}
    </div>
  );
};