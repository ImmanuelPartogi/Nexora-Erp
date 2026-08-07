// FILE: frontend/src/modules/data/employee/pages/EmployeeDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '@/shared/api/employee.api';
import { useEmployee } from '../hooks/useEmployees';
import { EmployeeForm } from '../components/EmployeeForm';
import { PermissionGate } from '@/app/PermissionGate';
import { EmployeeFormData } from '../employee.schema';

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

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4" style={{ padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', width: 128, flexShrink: 0, paddingTop: 2 }}>
      {label}
    </span>
    <span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: 500, flex: 1 }}>
      {value || <span style={{ color: '#cbd5e1', fontWeight: 400 }}>—</span>}
    </span>
  </div>
);

function SectionCard({ dotColor, title, children, colSpan2 }: { dotColor: string; title: string; children: React.ReactNode; colSpan2?: boolean }) {
  return (
    <div className={`bg-white rounded-xl overflow-hidden${colSpan2 ? ' md:col-span-2' : ''}`}
      style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>{title}</span>
      </div>
      <div style={{ padding: '0 20px 8px' }}>{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export const EmployeeDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id!);
  const [editOpen,   setEditOpen]   = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdate = async (formData: EmployeeFormData) => {
    try {
      setIsUpdating(true);
      await employeeApi.update(id!, formData);
      setEditOpen(false); showToast('Karyawan berhasil diperbarui');
      window.location.reload();
    } catch { alert('Gagal memperbarui karyawan.'); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus karyawan "${employee?.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try { await employeeApi.delete(id!); navigate('/employees'); }
    catch { alert('Gagal menghapus karyawan.'); }
  };

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5 flex items-center gap-3 animate-pulse">
            <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 180, height: 16, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 120, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid #e9ecef' }}>
              {[...Array(3)].map((_, j) => <div key={j} style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 14 }} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4" style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg className="w-7 h-7" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Karyawan tidak ditemukan</p>
          <button onClick={() => navigate('/employees')}
            style={{ marginTop: 14, padding: '8px 18px', fontSize: 13.5, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const stCfg = STATUS_CONFIG[employee.status] ?? { label: employee.status, bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' };

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

            {/* Left: breadcrumb + identity */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/employees')}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Karyawan
              </button>

              <svg className="w-3 h-3" style={{ color: '#e2e8f0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>

              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{ width: 44, height: 44, borderRadius: '50%', background: avatarGrad(employee.name), fontSize: 17, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {employee.name}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2" style={{ marginTop: 5 }}>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: '#f5f3ff', color: '#5b21b6' }}>
                      {employee.code}
                    </span>
                    <span className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: stCfg.bg, color: stCfg.text, border: `1px solid ${stCfg.border}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: stCfg.dot }} />
                      {stCfg.label}
                    </span>
                    {employee.user && (
                      <span className="inline-flex items-center gap-1.5"
                        style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        Punya Akun
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <PermissionGate permission="data.employee.edit">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5"
                  style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit
                </button>
              </PermissionGate>
              <PermissionGate permission="data.employee.delete">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5"
                  style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ffe4e6'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Hapus
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ──────────────────────────────────── */}
      <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <SectionCard dotColor="#34d399" title="Informasi Pribadi">
          <DetailRow label="Email"         value={employee.email} />
          <DetailRow label="Telepon"        value={employee.phone} />
          <DetailRow label="Tgl. Bergabung" value={employee.joinDate
            ? new Date(employee.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
            : null} />
        </SectionCard>

        <SectionCard dotColor="#94a3b8" title="Informasi Kepegawaian">
          <DetailRow label="Jabatan"    value={employee.position} />
          <DetailRow label="Departemen" value={employee.department} />
          <DetailRow label="Gaji"       value={employee.salary
            ? `Rp ${Number(employee.salary).toLocaleString('id-ID')}`
            : null} />
        </SectionCard>

        {/* Akun Pengguna — full width */}
        {employee.user && (
          <div className="md:col-span-2 bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #dbeafe', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid #dbeafe', background: '#eff6ff' }}>
              <svg className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#3b82f6' }}>
                Akun Pengguna Sistem
              </span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Email Login', value: employee.user.email },
                  { label: 'Role',        value: employee.user.role?.name || '—' },
                ].map((item) => (
                  <div key={item.label} style={{ padding: 14, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 5 }}>{item.label}</p>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{item.value}</p>
                  </div>
                ))}
                <div style={{ padding: 14, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 7 }}>Status Akun</p>
                  <span className="inline-flex items-center gap-1.5"
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                      ...(employee.user.isActive
                        ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                        : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                    }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: employee.user.isActive ? '#10b981' : '#94a3b8' }} />
                    {employee.user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
                Karyawan ini memiliki akun dan dapat login ke sistem. Untuk mengubah password atau role, buka modul Manajemen User.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit modal ────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={() => setEditOpen(false)} />
          <div className="relative bg-white w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 660, maxHeight: '90vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 50%, #0ea5e9 100%)', flexShrink: 0 }} />
            <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Edit Karyawan</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Perbarui data karyawan</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <EmployeeForm employee={employee} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} isLoading={isUpdating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};