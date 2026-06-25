// FILE: frontend/src/modules/data/location/pages/LocationListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationApi } from '@/shared/api/location.api';
import { useLocations } from '../hooks/useLocations';
import { LocationForm } from '../components/LocationForm';
import { PermissionGate } from '@/app/PermissionGate';
import { LocationFormData } from '../location.schema';
import { Location } from '@/shared/types';

// ── Type config (inline styles) ───────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string; icon: React.ReactNode }> = {
  warehouse: {
    label: 'Gudang', bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b',
    icon: <svg className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>,
  },
  office: {
    label: 'Kantor', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6',
    icon: <svg className="w-4 h-4" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  },
  store: {
    label: 'Toko', bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe', dot: '#7c3aed',
    icon: <svg className="w-4 h-4" style={{ color: '#7c3aed' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>,
  },
  other: {
    label: 'Lainnya', bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8',
    icon: <svg className="w-4 h-4" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  },
};

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8',
      background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
      whiteSpace: 'nowrap' as const, fontFamily: 'inherit',
    }}>
      {children}
    </th>
  );
}

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose} />
      <div className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 480, maxHeight: '90vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 60%, #ef4444 100%)', flexShrink: 0 }} />
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-lg"
            style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
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

// ════════════════════════════════════════════════════════════════
export const LocationListPage = () => {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [type,       setType]       = useState('');
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const { data, isLoading, refetch } = useLocations({ page, limit: 10, search, type: type || undefined });
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async (formData: LocationFormData) => {
    try {
      setIsCreating(true);
      await locationApi.create(formData);
      setModalOpen(false); refetch(); showToast('Lokasi berhasil ditambahkan');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal membuat lokasi.'); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus lokasi "${name}"?`)) return;
    try { await locationApi.delete(id); refetch(); showToast('Lokasi dihapus'); }
    catch { alert('Gagal menghapus lokasi.'); }
  };

  const pagination = data?.pagination;
  const hasFilter  = !!(search || type);

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', boxShadow: '0 4px 12px rgba(245,158,11,0.28)' }}>
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Lokasi</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Manajemen lokasi bisnis dan gudang</p>
              </div>
            </div>

            <PermissionGate permission="data.location.create">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 font-semibold text-white rounded-xl"
                style={{ padding: '8px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(245,158,11,0.42)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(245,158,11,0.3)'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Lokasi
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Filter bar ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Filter</span>
              {hasFilter && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                  Aktif
                </span>
              )}
            </div>
            {hasFilter && (
              <button onClick={() => { setSearch(''); setType(''); setPage(1); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 p-3.5">
            {/* Search */}
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </div>
              <input
                type="text" placeholder="Cari nama atau alamat..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '8px 13px 8px 36px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: '#1e293b', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Type select */}
            <div className="relative" style={{ width: 170 }}>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '8px 32px 8px 13px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: type ? '#1e293b' : '#94a3b8', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <option value="">Semua Tipe</option>
                {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
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
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 140, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 200, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 70, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <svg className="w-6 h-6" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada lokasi</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>
                {hasFilter ? 'Tidak ada hasil untuk filter ini.' : 'Klik "Tambah Lokasi" untuk menambahkan data.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> lokasi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><TH>Lokasi</TH><TH>Tipe</TH><TH>Alamat</TH><TH>Status</TH><TH>Aksi</TH></tr>
                  </thead>
                  <tbody>
                    {data.data.map((loc: Location) => {
                      const tc = TYPE_CONFIG[loc.type ?? ''] ?? TYPE_CONFIG.other;
                      return (
                        <tr key={loc.id} className="group"
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>

                          {/* Name */}
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center flex-shrink-0"
                                style={{ width: 36, height: 36, borderRadius: 10, background: tc.bg, border: `1px solid ${tc.border}` }}>
                                {tc.icon}
                              </div>
                              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{loc.name}</p>
                            </div>
                          </td>

                          {/* Type */}
                          <td style={{ padding: '12px 16px' }}>
                            <span className="inline-flex items-center gap-1.5"
                              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
                              {tc.label}
                            </span>
                          </td>

                          {/* Address */}
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', maxWidth: 220 }}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {loc.address || '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <span className="inline-flex items-center gap-1.5"
                              style={{
                                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                                ...(loc.isActive
                                  ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                                  : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                              }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: loc.isActive ? '#10b981' : '#94a3b8' }} />
                              {loc.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PermissionGate permission="data.location.view">
                                <button onClick={() => navigate(`/locations/${loc.id}`)}
                                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}>
                                  Detail
                                </button>
                              </PermissionGate>
                              <PermissionGate permission="data.location.delete">
                                <button onClick={() => handleDelete(loc.id, loc.name)}
                                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ffe4e6'}
                                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}>
                                  Hapus
                                </button>
                              </PermissionGate>
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
                <strong style={{ color: '#1e293b' }}>{pagination.totalPages}</strong>{' '}
                · <strong style={{ color: '#1e293b' }}>{pagination.total}</strong> total
              </p>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const p = i + 1; const isActive = p === page;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 30, height: 30, fontSize: 12, fontWeight: isActive ? 700 : 500, borderRadius: 7, border: isActive ? 'none' : '1px solid #e2e8f0', background: isActive ? '#1e293b' : '#ffffff', color: isActive ? '#ffffff' : '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}
                  className="flex items-center gap-1"
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page >= pagination.totalPages ? 0.4 : 1, fontFamily: 'inherit' }}>
                  Selanjutnya
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create modal ─────────────────────────────────── */}
      {modalOpen && (
        <ModalShell title="Tambah Lokasi Baru" subtitle="Isi detail lokasi di bawah ini" onClose={() => setModalOpen(false)}>
          <LocationForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} isLoading={isCreating} />
        </ModalShell>
      )}
    </div>
  );
};