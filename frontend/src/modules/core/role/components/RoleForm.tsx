// FILE: frontend/src/modules/core/role/components/RoleForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleSchema, RoleFormData } from '../role.schema';
import { Role } from '@/shared/types';
import { usePermissions } from '../hooks/useRoles';

// ── Helpers ───────────────────────────────────────────────────
const fmtEntity = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
const fmtAction = (s: string): string => {
  const map: Record<string, string> = {
    view: 'Lihat', create: 'Buat', edit: 'Edit', delete: 'Hapus',
    approve: 'Setujui', manage: 'Kelola', export: 'Ekspor', adjust: 'Sesuaikan', advanced: 'Lanjutan',
  };
  return map[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
};

const ACTION_STYLE: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  view:     { bg: '#f8fafc', border: '#e2e8f0',  text: '#475569', dot: '#94a3b8' },
  create:   { bg: '#f0fdf4', border: '#bbf7d0',  text: '#065f46', dot: '#10b981' },
  edit:     { bg: '#eff6ff', border: '#bfdbfe',  text: '#1e40af', dot: '#3b82f6' },
  delete:   { bg: '#fff1f2', border: '#fecdd3',  text: '#991b1b', dot: '#f43f5e' },
  approve:  { bg: '#f5f3ff', border: '#ddd6fe',  text: '#5b21b6', dot: '#7c3aed' },
  manage:   { bg: '#fffbeb', border: '#fde68a',  text: '#92400e', dot: '#f59e0b' },
  export:   { bg: '#ecfdf5', border: '#a7f3d0',  text: '#065f46', dot: '#34d399' },
  adjust:   { bg: '#fdf4ff', border: '#e9d5ff',  text: '#6b21a8', dot: '#a855f7' },
  advanced: { bg: '#fff7ed', border: '#fed7aa',  text: '#9a3412', dot: '#f97316' },
};

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, onFocus, onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: '100%', padding: '9px 13px', fontSize: 13.5,
        border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
        background: '#ffffff', color: '#1e293b',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit', ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#7c3aed';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        onBlur?.(e);
      }}
    />
  );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { style, onFocus, onBlur, ...rest } = props;
  return (
    <textarea
      {...rest}
      style={{
        width: '100%', padding: '9px 13px', fontSize: 13.5,
        border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
        background: '#ffffff', color: '#1e293b', resize: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit', ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#7c3aed';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        onBlur?.(e);
      }}
    />
  );
}

export const RoleForm = ({ role, onSubmit, onCancel, isLoading = false }: RoleFormProps) => {
  const { data: availablePermissions, isLoading: permLoading, error: permError } = usePermissions();
  const isOwner = role?.name.toLowerCase() === 'owner';

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: role ?? { name: '', description: '', permissions: [] },
  });

  const selected = watch('permissions') ?? [];

  const toggle = (perm: string, onChange: (v: string[]) => void) => {
    if (isOwner) return;
    onChange(selected.includes(perm) ? selected.filter((p) => p !== perm) : [...selected, perm]);
  };

  const toggleGroup = (perms: string[], onChange: (v: string[]) => void) => {
    if (isOwner) return;
    const allChecked = perms.every((p) => selected.includes(p));
    if (allChecked) {
      onChange(selected.filter((p) => !perms.includes(p)));
    } else {
      const toAdd = perms.filter((p) => !selected.includes(p));
      onChange([...selected, ...toAdd]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* ── Basic info ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
            Nama Role <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <StyledInput
            {...register('name')}
            placeholder="cth. Manager, Staff Gudang"
            disabled={isLoading || isOwner}
            style={isOwner ? { background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' } : {}}
          />
          {errors.name && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
            Deskripsi
          </label>
          <StyledTextarea
            {...register('description')}
            rows={2}
            placeholder="Deskripsi singkat tentang role ini..."
            disabled={isLoading}
          />
          {errors.description && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.description.message}</p>}
        </div>
      </div>

      {/* ── Owner notice ────────────────────────────────── */}
      {isOwner && (
        <div
          className="flex items-start gap-2.5 rounded-xl"
          style={{ padding: '11px 14px', background: '#fffbeb', border: '1px solid #fde68a' }}
        >
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>Akses Penuh Sistem</p>
            <p style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
              Role Owner secara otomatis memiliki semua izin dan tidak dapat dimodifikasi.
            </p>
          </div>
        </div>
      )}

      {/* ── Permissions ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>
            Izin Akses <span style={{ color: '#ef4444' }}>*</span>
          </label>
          {!isOwner && selected.length > 0 && (
            <span
              style={{
                fontSize: 11, fontWeight: 600,
                padding: '3px 9px', borderRadius: 99,
                background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe',
              }}
            >
              {selected.length} dipilih
            </span>
          )}
        </div>
        {errors.permissions && (
          <p style={{ fontSize: 11.5, color: '#ef4444', marginBottom: 8 }}>{errors.permissions.message}</p>
        )}

        {permLoading ? (
          <div
            style={{ border: '1px solid #e9ecef', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 60, background: '#f1f5f9', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : permError ? (
          <div
            className="flex items-start gap-2.5 rounded-xl"
            style={{ padding: '11px 14px', background: '#fff1f2', border: '1px solid #fecdd3' }}
          >
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span style={{ fontSize: 13, color: '#be123c' }}>Gagal memuat daftar izin. Coba refresh halaman.</span>
          </div>
        ) : (
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <div
                style={{
                  maxHeight: 340,
                  border: '1px solid #e9ecef',
                  borderRadius: 10,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  overscrollBehavior: 'contain',
                }}
              >
                {availablePermissions.map((group, gi) => {
                  const entityMap: Record<string, string[]> = {};
                  group.permissions.forEach((p) => {
                    const [, ent] = p.split('.');
                    if (ent) {
                      if (!entityMap[ent]) entityMap[ent] = [];
                      entityMap[ent].push(p);
                    }
                  });

                  const allGroupPerms   = group.permissions;
                  const allGroupChecked = allGroupPerms.every((p) => isOwner ? true : field.value?.includes(p));

                  return (
                    <div
                      key={group.module}
                      style={{ borderBottom: gi < availablePermissions.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    >
                      {/* Module header */}
                      <div
                        className="flex items-center justify-between"
                        style={{ padding: '9px 14px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                          <h4 style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {group.moduleName ?? group.module}
                          </h4>
                        </div>
                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => toggleGroup(allGroupPerms, field.onChange)}
                            style={{
                              fontSize: 11, fontWeight: 600,
                              color: allGroupChecked ? '#7c3aed' : '#64748b',
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            {allGroupChecked ? 'Hapus Semua' : 'Pilih Semua'}
                          </button>
                        )}
                      </div>

                      {/* Entity rows */}
                      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.entries(entityMap).map(([ent, perms]) => (
                          <div key={ent}>
                            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 7 }}>
                              {fmtEntity(ent)}
                            </p>
                            <div className="flex flex-wrap gap-1.5" style={{ marginLeft: 4 }}>
                              {perms.sort().map((perm) => {
                                const action  = perm.split('.')[2];
                                const checked = isOwner ? true : field.value?.includes(perm) ?? false;
                                const s       = ACTION_STYLE[action] ?? ACTION_STYLE.view;
                                return (
                                  <label
                                    key={perm}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 5,
                                      padding: '4px 10px', borderRadius: 7,
                                      border: `1px solid ${checked ? s.border : '#f1f5f9'}`,
                                      background: checked ? s.bg : '#f8fafc',
                                      color: checked ? s.text : '#94a3b8',
                                      fontSize: 12, fontWeight: 600,
                                      cursor: isOwner ? 'not-allowed' : 'pointer',
                                      userSelect: 'none',
                                      transition: 'all 0.12s',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isOwner && !checked) {
                                        (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
                                        (e.currentTarget as HTMLElement).style.color = '#475569';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isOwner && !checked) {
                                        (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
                                        (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                                      }
                                    }}
                                  >
                                    {/*
                                      tabIndex={-1} prevents browser from scrolling to this
                                      hidden element when it receives focus on click.
                                      position:fixed removes it from document flow entirely
                                      so it can never affect scroll position.
                                    */}
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggle(perm, field.onChange)}
                                      disabled={isLoading || isOwner}
                                      tabIndex={-1}
                                      style={{ position: 'fixed', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                    />
                                    {/* Always rendered — visibility toggle keeps chip width stable */}
                                    <svg
                                      width={11} height={11} viewBox="0 0 24 24"
                                      fill="none" stroke="currentColor" strokeWidth={3}
                                      style={{ flexShrink: 0, visibility: checked ? 'visible' : 'hidden' }}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {fmtAction(action)}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          />
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-end gap-2.5"
        style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9' }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '8px 16px', fontSize: 13.5, fontWeight: 500,
            color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 9, cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1, fontFamily: 'inherit', transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading || permLoading || isOwner}
          className="flex items-center gap-1.5 font-semibold text-white"
          style={{
            padding: '8px 18px', fontSize: 13.5, borderRadius: 9, border: 'none',
            background: isLoading || permLoading || isOwner
              ? 'linear-gradient(135deg, #9b7fe8, #6395d8)'
              : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            boxShadow: isLoading || isOwner ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
            cursor: isLoading || permLoading || isOwner ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !permLoading && !isOwner)
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              isLoading || isOwner ? 'none' : '0 4px 14px rgba(124,58,237,0.3)';
          }}
        >
          {isLoading && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Menyimpan...' : role ? 'Simpan Perubahan' : 'Buat Role'}
        </button>
      </div>
    </form>
  );
};