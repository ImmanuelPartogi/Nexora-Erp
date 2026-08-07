// FILE: frontend/src/modules/data/customer/pages/CustomerListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '@/shared/api/customer.api';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerForm } from '../components/CustomerForm';
import { PermissionGate } from '@/app/PermissionGate';
import { CustomerFormData } from '../customer.schema';
import { Customer } from '@/shared/types';
import { READ_ONLY } from '@/shared/config/readOnly';

// ── Avatar gradient ───────────────────────────────────────────
const AVATAR_GRADS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #0ea5e9, #2563eb)',
  'linear-gradient(135deg, #10b981, #0d9488)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];
const avatarGrad = (name: string) => AVATAR_GRADS[name.charCodeAt(0) % AVATAR_GRADS.length];

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

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose} />
      <div
        className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 520, maxHeight: '90vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}
      >
        <div style={{ height: 2, background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 50%, #0ea5e9 100%)', flexShrink: 0 }} />
        <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
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
        <div style={{ padding: 20, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export const CustomerListPage = () => {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const { data, isLoading, refetch } = useCustomers({ page, limit: 10, search });
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async (formData: CustomerFormData) => {
    try {
      setIsCreating(true);
      await customerApi.create(formData);
      setModalOpen(false); refetch(); showToast('Customer berhasil ditambahkan');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal membuat customer.'); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus customer "${name}"?`)) return;
    try { await customerApi.delete(id); refetch(); showToast('Customer dihapus'); }
    catch { alert('Gagal menghapus customer.'); }
  };

  const pagination = data?.pagination;
  const hasFilter  = !!search;

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl font-medium text-white"
          style={{ padding: '10px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #0e1420 0%, #1e1b4b 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          {toast}
        </div>
      )}

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', boxShadow: '0 4px 12px rgba(124,58,237,0.28)' }}
              >
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Customer</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Kelola database pelanggan perusahaan</p>
              </div>
            </div>

            {!READ_ONLY && (
            <PermissionGate permission="data.customer.create">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 font-semibold text-white rounded-xl"
                style={{ padding: '8px 16px', fontSize: 13.5, background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Customer
              </button>
            </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Search bar ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Pencarian</span>
              {hasFilter && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                  Aktif
                </span>
              )}
            </div>
            {hasFilter && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reset
              </button>
            )}
          </div>
          <div className="p-3.5">
            <div className="relative" style={{ maxWidth: 360 }}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari nama, kode, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '8px 13px 8px 36px', fontSize: 13.5,
                  border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none',
                  background: '#ffffff', color: '#1e293b',
                  transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* ── Table card ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {isLoading ? (
            <div style={{ padding: 4 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 150, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 100, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 80, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                  <div style={{ width: 64, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div
                className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#f5f3ff', border: '1px solid #ddd6fe' }}
              >
                <svg className="w-6 h-6" style={{ color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada customer</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>
                {hasFilter ? 'Tidak ada hasil untuk pencarian ini.' : 'Klik "Tambah Customer" untuk menambahkan data baru.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table info bar */}
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> customer
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <TH>Customer</TH>
                      <TH>Kode</TH>
                      <TH>Telepon</TH>
                      <TH>Status</TH>
                      <TH>Terdaftar</TH>
                      <TH>Aksi</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((customer: Customer) => (
                      <tr
                        key={customer.id}
                        className="group"
                        style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Name + email */}
                        <td style={{ padding: '12px 16px' }}>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center flex-shrink-0 text-white font-bold"
                              style={{ width: 34, height: 34, borderRadius: '50%', background: avatarGrad(customer.name), fontSize: 13 }}
                            >
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{customer.name}</p>
                              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{customer.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 7, background: '#f5f3ff', color: '#5b21b6' }}>
                            {customer.code}
                          </span>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                          {customer.phone || '—'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            className="inline-flex items-center gap-1.5"
                            style={{
                              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                              ...(customer.isActive
                                ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                                : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: customer.isActive ? '#10b981' : '#94a3b8' }} />
                            {customer.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>

                        {/* Created */}
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                          {new Date(customer.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px' }}>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PermissionGate permission="data.customer.view">
                              <button
                                onClick={() => navigate(`/customers/${customer.id}`)}
                                style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}
                              >
                                Detail
                              </button>
                            </PermissionGate>
                            {!READ_ONLY && (
                            <PermissionGate permission="data.customer.delete">
                              <button
                                onClick={() => handleDelete(customer.id, customer.name)}
                                style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
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
                    ))}
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
                  const p = i + 1;
                  const isActive = p === page;
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, fontSize: 12, fontWeight: isActive ? 700 : 500, borderRadius: 7, border: isActive ? 'none' : '1px solid #e2e8f0', background: isActive ? '#1e293b' : '#ffffff', color: isActive ? '#ffffff' : '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="flex items-center gap-1"
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page >= pagination.totalPages ? 0.4 : 1, fontFamily: 'inherit' }}
                >
                  Selanjutnya
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create modal ─────────────────────────────────── */}
      {modalOpen && !READ_ONLY && (
        <ModalShell title="Tambah Customer Baru" subtitle="Isi data pelanggan di bawah ini" onClose={() => setModalOpen(false)}>
          <CustomerForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} isLoading={isCreating} />
        </ModalShell>
      )}
    </div>
  );
};