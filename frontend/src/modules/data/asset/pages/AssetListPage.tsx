// FILE: frontend/src/modules/data/asset/pages/AssetListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetApi } from '@/shared/api/asset.api';
import { useAssets } from '../hooks/useAssets';
import { AssetForm } from '../components/AssetForm';
import { PermissionGate } from '@/app/PermissionGate';
import { AssetFormData } from '../asset.schema';
import { Asset } from '@/shared/types';
import { READ_ONLY } from '@/shared/config/readOnly';

const CONDITION: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  excellent:   { label: 'Sempurna',  bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe', dot: '#7c3aed' },
  good:        { label: 'Baik',      bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
  fair:        { label: 'Cukup',     bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  poor:        { label: 'Buruk',     bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#ef4444' },
  maintenance: { label: 'Perawatan', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
};

const TYPE_LABELS: Record<string, string> = {
  equipment: 'Peralatan', vehicle: 'Kendaraan',
  building: 'Gedung', furniture: 'Furnitur', other: 'Lainnya',
};

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: 'left',
      fontSize: 10.5, fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em',
      color: '#94a3b8', background: '#f8fafc',
      borderBottom: '1px solid #f1f5f9',
      whiteSpace: 'nowrap' as const,
      fontFamily: 'inherit',
    }}>
      {children}
    </th>
  );
}

function FilterInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1" style={{ minWidth: 200 }}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 13px 8px 36px', fontSize: 13.5,
          border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none',
          background: '#ffffff', color: '#1e293b',
          transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function FilterSelect({ value, onChange, children }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative" style={{ width: 180 }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: '8px 32px 8px 13px', fontSize: 13.5,
          border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none',
          background: '#ffffff', color: value ? '#1e293b' : '#94a3b8',
          appearance: 'none', cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Modal shell ────────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(15,23,42,0.45)' }}
        onClick={onClose}
      />
      <div
        className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 520, maxHeight: '90vh', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ height: 2, background: 'linear-gradient(90deg, #0ea5e9 0%, #2563eb 50%, #7c3aed 100%)', flexShrink: 0 }} />
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ASSET LIST PAGE
// ════════════════════════════════════════════════════════════════
export const AssetListPage = () => {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [condition,  setCondition]  = useState('');
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const { data, isLoading, refetch } = useAssets({ page, limit: 10, search, condition: condition || undefined });
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async (formData: AssetFormData) => {
    try {
      setIsCreating(true);
      await assetApi.create(formData);
      setModalOpen(false); refetch(); showToast('Aset berhasil ditambahkan');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal membuat aset.'); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus aset "${name}"?`)) return;
    try { await assetApi.delete(id); refetch(); showToast('Aset dihapus'); }
    catch { alert('Gagal menghapus aset.'); }
  };

  const pagination  = data?.pagination;
  const hasFilter   = !!(search || condition);

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl font-medium text-white"
          style={{
            padding: '10px 16px', fontSize: 13.5,
            background: 'linear-gradient(135deg, #0e1420 0%, #1e1b4b 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          {toast}
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(14,165,233,0.28)',
                }}
              >
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>
                  Aset Perusahaan
                </h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                  Kelola inventaris aset tetap perusahaan
                </p>
              </div>
            </div>

            {!READ_ONLY && (
              <PermissionGate permission="data.asset.create">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 font-semibold text-white rounded-xl transition-all"
                  style={{
                    padding: '8px 16px', fontSize: 13.5,
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                    boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(14,165,233,0.42)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(14,165,233,0.3)'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah Aset
                </button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Filter bar ────────────────────────────────────── */}
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                Filter
              </span>
              {hasFilter && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd' }}>
                  Aktif
                </span>
              )}
            </div>
            {hasFilter && (
              <button
                onClick={() => { setSearch(''); setCondition(''); setPage(1); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 p-3.5">
            <FilterInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Cari nama atau kode aset..."
            />
            <FilterSelect value={condition} onChange={(e) => { setCondition(e.currentTarget.value); setPage(1); }}>
              <option value="">Semua Kondisi</option>
              {Object.entries(CONDITION).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </FilterSelect>
          </div>
        </div>

        {/* ── Table card ─────────────────────────────────────── */}
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {isLoading ? (
            <div style={{ padding: 4 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 150, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 90, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 70, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                  <div style={{ width: 70, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div
                className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#f0f9ff', border: '1px solid #bae6fd' }}
              >
                <svg className="w-6 h-6" style={{ color: '#7dd3fc' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada aset</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>
                {hasFilter ? 'Tidak ada hasil untuk filter ini.' : 'Klik "Tambah Aset" untuk menambahkan data aset.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table info bar */}
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> aset
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <TH>Aset</TH>
                      <TH>Kode</TH>
                      <TH>Tipe</TH>
                      <TH>Lokasi</TH>
                      <TH>Kondisi</TH>
                      <TH>Status</TH>
                      <TH>Aksi</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((asset: Asset) => {
                      const cond = CONDITION[asset.condition] ?? { label: asset.condition, bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
                      return (
                        <tr
                          key={asset.id}
                          className="group"
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Asset name + date */}
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-3">
                              <div
                                className="flex items-center justify-center flex-shrink-0"
                                style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd' }}
                              >
                                <svg className="w-4 h-4" style={{ color: '#38bdf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                              </div>
                              <div>
                                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{asset.name}</p>
                                {asset.purchaseDate && (
                                  <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                                    {new Date(asset.purchaseDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Code */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700,
                              padding: '4px 9px', borderRadius: 7, background: '#f5f3ff', color: '#5b21b6',
                            }}>
                              {asset.code}
                            </span>
                          </td>

                          {/* Type */}
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                            {asset.type ? (TYPE_LABELS[asset.type] ?? '—') : '—'}
                          </td>

                          {/* Location */}
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                            {(asset as { locationName?: string }).locationName || '—'}
                          </td>

                          {/* Condition */}
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: cond.bg, color: cond.text, border: `1px solid ${cond.border}` }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cond.dot }} />
                              {cond.label}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{
                                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                                ...(asset.isActive
                                  ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                                  : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: asset.isActive ? '#10b981' : '#94a3b8' }} />
                              {asset.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PermissionGate permission="data.asset.view">
                                <button
                                  onClick={() => navigate(`/assets/${asset.id}`)}
                                  style={{
                                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                    color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
                                    borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}
                                >
                                  Detail
                                </button>
                              </PermissionGate>
                              {!READ_ONLY && (
                                <PermissionGate permission="data.asset.delete">
                                  <button
                                    onClick={() => handleDelete(asset.id, asset.name)}
                                    style={{
                                      padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                      color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3',
                                      borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ffe4e6'}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}
                                  >
                                    Hapus
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
            <div
              className="flex items-center justify-between"
              style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}
            >
              <p style={{ fontSize: 12, color: '#64748b' }}>
                Halaman <strong style={{ color: '#1e293b' }}>{pagination.page}</strong> dari{' '}
                <strong style={{ color: '#1e293b' }}>{pagination.totalPages}</strong>{' '}
                · <strong style={{ color: '#1e293b' }}>{pagination.total}</strong> aset
              </p>
              <div className="flex items-center gap-1.5">
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const p = i + 1;
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 30, height: 30, fontSize: 12, fontWeight: isActive ? 700 : 500,
                        borderRadius: 7, border: isActive ? 'none' : '1px solid #e2e8f0',
                        background: isActive ? '#1e293b' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="flex items-center gap-1"
                  style={{
                    padding: '5px 12px', fontSize: 12, fontWeight: 500,
                    color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
                    borderRadius: 7, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    opacity: page >= pagination.totalPages ? 0.4 : 1, fontFamily: 'inherit',
                  }}
                >
                  Selanjutnya
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create modal ──────────────────────────────────── */}
      {modalOpen && !READ_ONLY && (
        <ModalShell title="Tambah Aset Baru" onClose={() => setModalOpen(false)}>
          <AssetForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} isLoading={isCreating} />
        </ModalShell>
      )}
    </div>
  );
};