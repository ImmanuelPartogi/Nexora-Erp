// FILE: src/modules/operations/stock/pages/StockMovementPage.tsx
import { useState } from 'react';
import { useStockMovements } from '../hooks/useStocks';
import { StockMovement } from '@/shared/types';

// ── Movement type config ───────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string; prefix: string; qtyColor: string }> = {
  in:         { label: 'Masuk',     bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981', prefix: '+', qtyColor: '#059669' },
  out:        { label: 'Keluar',    bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#f43f5e', prefix: '−', qtyColor: '#e11d48' },
  adjustment: { label: 'Adj',      bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6', prefix: '±', qtyColor: '#2563eb' },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const, fontFamily: 'inherit' }}>
      {children}
    </th>
  );
}

function getPaginationPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ════════════════════════════════════════════════════════════════
export const StockMovementPage = () => {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStockMovements({ page, limit: 20, type: type || undefined });
  const pagination = data?.pagination;
  const hasFilter  = !!type;

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', boxShadow: '0 4px 12px rgba(13,148,136,0.28)' }}>
              <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Riwayat Mutasi Stok</h1>
              <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Semua transaksi pergerakan stok</p>
            </div>
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
              {hasFilter && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4' }}>Aktif</span>}
            </div>
            {hasFilter && (
              <button onClick={() => { setType(''); setPage(1); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 p-3.5">
            {/* Type filter — visual pill buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: '', label: 'Semua Tipe' },
                { value: 'in', label: 'Masuk' },
                { value: 'out', label: 'Keluar' },
                { value: 'adjustment', label: 'Penyesuaian' },
              ].map(({ value, label }) => {
                const active = type === value;
                const tc = value ? TYPE_CONFIG[value] : null;
                return (
                  <button key={value} onClick={() => { setType(value); setPage(1); }}
                    style={{ padding: '6px 14px', fontSize: 12.5, fontWeight: active ? 700 : 500, borderRadius: 8, border: active && tc ? `1px solid ${tc.border}` : '1px solid #e2e8f0', background: active && tc ? tc.bg : active ? '#1e293b' : '#ffffff', color: active && tc ? tc.text : active ? '#ffffff' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
                    {active && tc && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: tc.dot, marginRight: 5, verticalAlign: 'middle' }} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Table card ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {isLoading ? (
            <div style={{ padding: 4 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ width: 55, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 160, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 100, height: 10, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 60, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#f0fdfa', border: '1px solid #99f6e4' }}>
                <svg className="w-6 h-6" style={{ color: '#0d9488' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada mutasi stok</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>
                {hasFilter ? 'Tidak ada hasil untuk filter ini.' : 'Belum ada transaksi pergerakan stok tercatat.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> transaksi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><TH>Tanggal</TH><TH>Tipe</TH><TH>Produk</TH><TH>Gudang</TH><TH>Kuantitas</TH><TH>Referensi</TH><TH>Catatan</TH></tr>
                  </thead>
                  <tbody>
                    {data.data.map((mv: StockMovement, idx: number) => {
                      const tc = TYPE_CONFIG[mv.type] ?? TYPE_CONFIG.adjustment;
                      return (
                        <tr key={mv.id ?? idx}
                          style={{ borderBottom: '1px solid #f8fafc', background: idx % 2 === 1 ? '#fafafa' : '#ffffff', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdfa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 1 ? '#fafafa' : '#ffffff')}>

                          {/* Tanggal */}
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontSize: 12.5, fontWeight: 500, color: '#1e293b' }}>{fmtDate(mv.createdAt)}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{fmtTime(mv.createdAt)}</p>
                          </td>

                          {/* Tipe badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span className="inline-flex items-center gap-1.5"
                              style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
                              {tc.label}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 500, color: '#1e293b' }}>{mv.productName}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{mv.warehouseName}</td>

                          {/* Kuantitas */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: tc.qtyColor, fontFamily: 'ui-monospace, monospace' }}>
                              {tc.prefix}{Number(mv.quantity).toLocaleString('id-ID')}
                            </span>
                          </td>

                          {/* Referensi */}
                          <td style={{ padding: '12px 16px' }}>
                            {mv.referenceNo ? (
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', fontFamily: 'ui-monospace, monospace', padding: '3px 8px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                {mv.referenceNo}
                              </span>
                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                            {mv.notes || <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
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
                <strong style={{ color: '#1e293b' }}>{pagination.totalPages}</strong>{' '}
                · <strong style={{ color: '#1e293b' }}>{pagination.total}</strong> total
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
    </div>
  );
};