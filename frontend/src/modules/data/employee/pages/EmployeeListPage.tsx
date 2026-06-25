// FILE: frontend/src/modules/data/employee/pages/EmployeeListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '@/shared/api/employee.api';
import { useEmployees } from '../hooks/useEmployees';
import { EmployeeForm } from '../components/EmployeeForm';
import { PermissionGate } from '@/app/PermissionGate';
import { EmployeeFormData } from '../employee.schema';
import { Employee } from '@/shared/types';

// ── Status config (inline styles) ────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  active:   { label: 'Aktif',    bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
  inactive: { label: 'Nonaktif', bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  resigned: { label: 'Resign',   bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#ef4444' },
};

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
      padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8',
      background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
      whiteSpace: 'nowrap' as const, fontFamily: 'inherit',
    }}>
      {children}
    </th>
  );
}

function ModalShell({ title, subtitle, maxWidth = 640, onClose, children }: { title: string; subtitle?: string; maxWidth?: number; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose} />
      <div className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{ maxWidth, maxHeight: '90vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 50%, #0ea5e9 100%)', flexShrink: 0 }} />
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
export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const { data, isLoading, refetch } = useEmployees({ page, limit: 10, search, status: status || undefined });
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async (formData: EmployeeFormData) => {
    try {
      setIsCreating(true);
      await employeeApi.create(formData);
      setModalOpen(false); refetch(); showToast('Karyawan berhasil ditambahkan');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal membuat karyawan.'); }
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus karyawan "${name}"?`)) return;
    try { await employeeApi.delete(id); refetch(); showToast('Karyawan dihapus'); }
    catch { alert('Gagal menghapus karyawan.'); }
  };

  const pagination = data?.pagination;
  const hasFilter  = !!(search || status);

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
                style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', boxShadow: '0 4px 12px rgba(16,185,129,0.28)' }}>
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Karyawan</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Manajemen data karyawan perusahaan</p>
              </div>
            </div>

            <PermissionGate permission="data.employee.create">
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
                Tambah Karyawan
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
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                  Aktif
                </span>
              )}
            </div>
            {hasFilter && (
              <button onClick={() => { setSearch(''); setStatus(''); setPage(1); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 p-3.5">
            {/* Search input */}
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari nama, kode, jabatan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '8px 13px 8px 36px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: '#1e293b', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Status select */}
            <div className="relative" style={{ width: 170 }}>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '8px 32px 8px 13px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: status ? '#1e293b' : '#94a3b8', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="resigned">Resign</option>
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
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 140, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 100, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 70, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                  <div style={{ width: 64, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 px-6">
              <div className="flex items-center justify-center mx-auto mb-4" style={{ width: 52, height: 52, borderRadius: 14, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <svg className="w-6 h-6" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada karyawan</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5 }}>
                {hasFilter ? 'Tidak ada hasil untuk filter ini.' : 'Klik "Tambah Karyawan" untuk menambahkan data.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                  <strong style={{ color: '#475569' }}>{pagination?.total ?? data.data.length}</strong> karyawan
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <TH>Karyawan</TH>
                      <TH>Kode</TH>
                      <TH>Jabatan</TH>
                      <TH>Departemen</TH>
                      <TH>Status</TH>
                      <TH>Akun</TH>
                      <TH>Aksi</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((emp: Employee) => {
                      const stCfg = STATUS_CONFIG[emp.status] ?? { label: emp.status, bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
                      return (
                        <tr key={emp.id} className="group"
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>

                          {/* Name + email */}
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center flex-shrink-0 text-white font-bold"
                                style={{ width: 36, height: 36, borderRadius: '50%', background: avatarGrad(emp.name), fontSize: 13 }}>
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{emp.name}</p>
                                <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{emp.email || '—'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Code */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 7, background: '#f5f3ff', color: '#5b21b6' }}>
                              {emp.code}
                            </span>
                          </td>

                          {/* Position */}
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{emp.position || '—'}</td>

                          {/* Department */}
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{emp.department || '—'}</td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <span className="inline-flex items-center gap-1.5"
                              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: stCfg.bg, color: stCfg.text, border: `1px solid ${stCfg.border}` }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: stCfg.dot }} />
                              {stCfg.label}
                            </span>
                          </td>

                          {/* Account */}
                          <td style={{ padding: '12px 16px' }}>
                            {emp.user ? (
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center justify-center" style={{ width: 22, height: 22, borderRadius: '50%', background: '#eff6ff' }}>
                                  <svg className="w-3 h-3" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                  </svg>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 500, color: '#3b82f6' }}>{emp.user.role?.name ?? 'User'}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PermissionGate permission="data.employee.view">
                                <button onClick={() => navigate(`/employees/${emp.id}`)}
                                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}>
                                  Detail
                                </button>
                              </PermissionGate>
                              <PermissionGate permission="data.employee.delete">
                                <button onClick={() => handleDelete(emp.id, emp.name)}
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
        <ModalShell title="Tambah Karyawan Baru" subtitle="Isi data karyawan di bawah ini" maxWidth={660} onClose={() => setModalOpen(false)}>
          <EmployeeForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} isLoading={isCreating} />
        </ModalShell>
      )}
    </div>
  );
};