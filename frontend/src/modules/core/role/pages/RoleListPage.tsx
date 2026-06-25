// FILE: frontend/src/modules/core/role/pages/RoleListPage.tsx
import { useState } from 'react';
import { roleApi } from '@/shared/api/role.api';
import { useRoles } from '../hooks/useRoles';
import { RoleForm } from '../components/RoleForm';
import { PermissionGate } from '@/app/PermissionGate';
import { RoleFormData } from '../role.schema';
import { Role } from '@/shared/types';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { READ_ONLY } from '@/shared/config/readOnly';

// ── Helpers ───────────────────────────────────────────────────
const fmtEntity = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
const fmtAction = (s: string) => {
  const map: Record<string, string> = {
    view: 'Lihat', create: 'Buat', edit: 'Edit', delete: 'Hapus',
    approve: 'Setujui', manage: 'Kelola', export: 'Ekspor',
    adjust: 'Sesuaikan', advanced: 'Lanjutan',
  };
  return map[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
};

const MODULE_NAMES: Record<string, string> = {
  core: 'Core', data: 'Data', operations: 'Operasional', reporting: 'Laporan',
};

const ACTION_STYLE: Record<string, { bg: string; text: string }> = {
  view:     { bg: '#f8fafc', text: '#475569' },
  create:   { bg: '#f0fdf4', text: '#065f46' },
  edit:     { bg: '#eff6ff', text: '#1e40af' },
  delete:   { bg: '#fff1f2', text: '#991b1b' },
  approve:  { bg: '#f5f3ff', text: '#5b21b6' },
  manage:   { bg: '#fffbeb', text: '#92400e' },
  export:   { bg: '#ecfdf5', text: '#065f46' },
  adjust:   { bg: '#fdf4ff', text: '#6b21a8' },
  advanced: { bg: '#fff7ed', text: '#9a3412' },
};

const AVATAR_GRADS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #0ea5e9, #2563eb)',
  'linear-gradient(135deg, #10b981, #0d9488)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
];
const avatarGrad = (name: string) => AVATAR_GRADS[name.charCodeAt(0) % AVATAR_GRADS.length];

function groupByEntity(perms: string[]) {
  const out: Record<string, Record<string, string[]>> = {};
  perms.forEach((p) => {
    const [mod, ent, act] = p.split('.');
    if (!mod || !ent || !act) return;
    if (!out[mod]) out[mod] = {};
    if (!out[mod][ent]) out[mod][ent] = [];
    out[mod][ent].push(act);
  });
  return out;
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: 'left',
      fontSize: 10.5, fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em',
      color: '#94a3b8', background: '#f8fafc',
      borderBottom: '1px solid #f1f5f9',
      whiteSpace: 'nowrap' as const, fontFamily: 'inherit',
    }}>
      {children}
    </th>
  );
}

// ── ModalShell — accent colour is purple/blue for Role module ──
function ModalShell({
  title, subtitle, onClose, maxWidth = 560, children,
}: {
  title: string; subtitle?: string; onClose: () => void;
  maxWidth?: number; children: React.ReactNode;
}) {
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
          maxWidth, maxHeight: '92vh', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)',
        }}
      >
        {/* accent bar — purple/blue for Role module */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, #7c3aed 0%, #4f46e5 55%, #2563eb 100%)', flexShrink: 0 }} />
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}
        >
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg"
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
export const RoleListPage = () => {
  const { data, isLoading, refetch } = useRoles();
  const [createOpen,   setCreateOpen]   = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [permOpen,     setPermOpen]     = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permRole,     setPermRole]     = useState<Role | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async (fd: RoleFormData) => {
    try {
      setIsProcessing(true);
      await roleApi.create(fd);
      setCreateOpen(false); refetch(); showToast('Role berhasil dibuat');
    } catch { alert('Gagal membuat role'); }
    finally { setIsProcessing(false); }
  };

  const handleUpdate = async (fd: RoleFormData) => {
    if (!selectedRole) return;
    try {
      setIsProcessing(true);
      await roleApi.update(selectedRole.id, fd);
      setEditOpen(false); setSelectedRole(null); refetch(); showToast('Role berhasil diperbarui');
    } catch { alert('Gagal memperbarui role'); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus role ini?')) return;
    try { await roleApi.delete(id); refetch(); showToast('Role dihapus'); }
    catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal menghapus role'); }
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const canDelete  = (r: Role) => r.name.toLowerCase() !== 'owner';
  const viewPerms  = (r: Role) => { setPermRole(r); setPermOpen(true); };
  const grouped    = permRole ? groupByEntity(permRole.permissions) : {};
  const isOwner    = permRole?.name.toLowerCase() === 'owner';
  const closeEdit  = () => { setEditOpen(false); setSelectedRole(null); };

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
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#10b981',
            flexShrink: 0, display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
          }} />
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.28)',
                }}
              >
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Role & Izin Akses</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Kelola level akses pengguna di sistem</p>
              </div>
            </div>

            {!READ_ONLY && (
              <PermissionGate permission={PERMISSIONS.ROLE_CREATE}>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 font-semibold text-white rounded-xl"
                  style={{
                    padding: '8px 16px', fontSize: 13.5, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.3)', fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Buat Role
                </button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Role table ───────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {isLoading ? (
            <div style={{ padding: 4 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ padding: '14px 16px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 130, height: 13, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 200, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 70, height: 22, background: '#f1f5f9', borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16">
              <div className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <svg className="w-6 h-6" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <p className="font-semibold" style={{ fontSize: 14, color: '#475569' }}>Belum ada role</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>Klik "Buat Role" untuk menambah role baru.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  <strong style={{ color: '#475569' }}>{data.data.length}</strong> role terdaftar
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><TH>Role</TH><TH>Izin</TH><TH>Tipe</TH><TH>Aksi</TH></tr>
                  </thead>
                  <tbody>
                    {data.data.map((role) => (
                      <tr
                        key={role.id}
                        style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; setHoveredId(role.id); }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; setHoveredId(null); }}
                      >
                        {/* Role name + avatar */}
                        <td style={{ padding: '12px 16px' }}>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center flex-shrink-0 text-white font-bold"
                              style={{ width: 34, height: 34, borderRadius: 10, background: avatarGrad(role.name), fontSize: 13 }}
                            >
                              {role.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{role.name}</p>
                              {role.description && (
                                <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{role.description}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Permissions count */}
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => viewPerms(role)}
                            style={{
                              fontSize: 12.5, fontWeight: 600, color: '#2563eb',
                              background: '#eff6ff', border: '1px solid #bfdbfe',
                              padding: '4px 10px', borderRadius: 7,
                              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#dbeafe'}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#eff6ff'}
                          >
                            {role.name.toLowerCase() === 'owner' ? 'Semua Izin' : `${role.permissions.length} izin`}
                          </button>
                        </td>

                        {/* Type badge */}
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            className="inline-flex items-center gap-1.5"
                            style={{
                              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                              ...(role.isDefault
                                ? { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }
                                : { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }),
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: role.isDefault ? '#f59e0b' : '#10b981' }} />
                            {role.isDefault ? 'Sistem' : 'Kustom'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px' }}>
                          {!READ_ONLY && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: hoveredId === role.id ? 1 : 0, transition: "opacity 0.15s" }}>
                              <PermissionGate permission={PERMISSIONS.ROLE_EDIT}>
                                <button
                                  onClick={() => { setSelectedRole(role); setEditOpen(true); }}
                                  style={{
                                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                    color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
                                    borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}
                                >
                                  Edit
                                </button>
                              </PermissionGate>
                              {canDelete(role) && (
                                <PermissionGate permission={PERMISSIONS.ROLE_DELETE}>
                                  <button
                                    onClick={() => handleDelete(role.id)}
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Permission detail modal ─────────────────────────── */}
      {permOpen && permRole && (
        <ModalShell
          title={`Izin: ${permRole.name}`}
          subtitle={`${isOwner ? 'Akses penuh sistem' : `${permRole.permissions.length} izin ditetapkan`}`}
          onClose={() => setPermOpen(false)}
          maxWidth={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '55vh', overflowY: 'auto', paddingRight: 4 }}>
            {isOwner && (
              <div className="flex items-start gap-2.5 rounded-xl"
                style={{ padding: '11px 14px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p style={{ fontSize: 13, color: '#92400e' }}>Role Owner memiliki akses ke seluruh fitur secara otomatis.</p>
              </div>
            )}

            {!isOwner && permRole.permissions.length === 0 && (
              <div className="text-center py-10">
                <svg className="w-10 h-10 mx-auto mb-3" style={{ color: '#e2e8f0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Belum ada izin ditetapkan</p>
              </div>
            )}

            {Object.entries(grouped).map(([mod, entities]) => (
              <div key={mod} className="rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef' }}>
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                  <h4 style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {MODULE_NAMES[mod] ?? mod}
                  </h4>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(entities).map(([ent, acts]) => (
                    <div key={ent} style={{ marginLeft: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>{fmtEntity(ent)}</p>
                      <div className="flex flex-wrap gap-1.5" style={{ marginLeft: 4 }}>
                        {acts.sort().map((a) => {
                          const s = ACTION_STYLE[a] ?? ACTION_STYLE.view;
                          return (
                            <span key={a} style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.text }}>
                              {fmtAction(a)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => setPermOpen(false)}
              className="font-semibold text-white rounded-xl"
              style={{
                padding: '8px 20px', fontSize: 13.5, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)'}
            >
              Tutup
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Create modal ─────────────────────────────────────── */}
      {createOpen && !READ_ONLY && (
        <ModalShell title="Buat Role Baru" subtitle="Tentukan nama dan izin akses role" onClose={() => setCreateOpen(false)} maxWidth={680}>
          <RoleForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isLoading={isProcessing} />
        </ModalShell>
      )}

      {/* ── Edit modal ───────────────────────────────────────── */}
      {editOpen && selectedRole && !READ_ONLY && (
        <ModalShell title="Edit Role" subtitle="Perbarui nama dan izin akses role" onClose={closeEdit} maxWidth={680}>
          <RoleForm role={selectedRole} onSubmit={handleUpdate} onCancel={closeEdit} isLoading={isProcessing} />
        </ModalShell>
      )}
    </div>
  );
};