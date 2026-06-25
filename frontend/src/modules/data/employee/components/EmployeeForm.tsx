// FILE: frontend/src/modules/data/employee/components/EmployeeForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { employeeSchema, EmployeeFormData } from '../employee.schema';
import { Employee, Role } from '@/shared/types';
import { roleApi } from '@/shared/api/role.api';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit:  (data: EmployeeFormData) => Promise<void>;
  onCancel:  () => void;
  isLoading?: boolean;
}

// ── Shared input primitives ───────────────────────────────────
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, onFocus, onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: '100%', padding: '9px 13px', fontSize: 13.5,
        border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
        background: props.disabled ? '#f8fafc' : '#ffffff', color: props.disabled ? '#94a3b8' : '#1e293b',
        transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit', ...style,
      }}
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; } onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
    />
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { style, onFocus, onBlur, children, ...rest } = props;
  return (
    <div className="relative">
      <select
        {...rest}
        style={{
          width: '100%', padding: '9px 32px 9px 13px', fontSize: 13.5,
          border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
          background: props.disabled ? '#f8fafc' : '#ffffff', color: '#1e293b',
          appearance: 'none', cursor: props.disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit', ...style,
        }}
        onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; } onFocus?.(e); }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
    {children}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{msg}</p> : null;

function SectionHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 18px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>{children}</span>
      {right}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export const EmployeeForm = ({ employee, onSubmit, onCancel, isLoading = false }: EmployeeFormProps) => {
  const [roles,        setRoles]        = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { ...employee, createUserAccount: false },
  });

  const createUserAccount = watch('createUserAccount');
  const hasExistingUser   = employee?.user?.id;

  useEffect(() => {
    if (!createUserAccount) return;
    setLoadingRoles(true);
    roleApi.listAll().then(setRoles).catch(() => {}).finally(() => setLoadingRoles(false));
  }, [createUserAccount]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >

      {/* ── Informasi Karyawan ────────────────────────────── */}
      <div style={{ border: '1px solid #e9ecef', borderRadius: 12, overflow: 'hidden' }}>
        <SectionHeader>Informasi Karyawan</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ padding: 16, background: '#fafafa' }}>

          {/* Nama (full width) */}
          <div className="md:col-span-2">
            <FieldLabel>Nama Karyawan <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
            <StyledInput {...register('name')} placeholder="Nama lengkap karyawan" disabled={isLoading} />
            <FieldError msg={errors.name?.message} />
          </div>

          {/* Kode */}
          <div>
            <FieldLabel>Kode Karyawan</FieldLabel>
            <StyledInput {...register('code')} placeholder="Kosongkan untuk auto (EMP-0001)" disabled={isLoading} />
            <FieldError msg={errors.code?.message} />
          </div>

          {/* Email */}
          <div>
            <FieldLabel>Email {createUserAccount && <span style={{ color: '#ef4444' }}>*</span>}</FieldLabel>
            <StyledInput {...register('email')} type="email" placeholder="email@perusahaan.com" disabled={isLoading} />
            <FieldError msg={errors.email?.message} />
          </div>

          {/* Telepon */}
          <div>
            <FieldLabel>Nomor Telepon</FieldLabel>
            <StyledInput {...register('phone')} placeholder="+62 812 3456 7890" disabled={isLoading} />
            <FieldError msg={errors.phone?.message} />
          </div>

          {/* Jabatan */}
          <div>
            <FieldLabel>Jabatan</FieldLabel>
            <StyledInput {...register('position')} placeholder="cth. Manager, Staff" disabled={isLoading} />
            <FieldError msg={errors.position?.message} />
          </div>

          {/* Departemen */}
          <div>
            <FieldLabel>Departemen</FieldLabel>
            <StyledInput {...register('department')} placeholder="cth. Sales, IT, HR" disabled={isLoading} />
            <FieldError msg={errors.department?.message} />
          </div>

          {/* Tgl Bergabung */}
          <div>
            <FieldLabel>Tanggal Bergabung</FieldLabel>
            <StyledInput {...register('joinDate')} type="date" disabled={isLoading} />
            <FieldError msg={errors.joinDate?.message} />
          </div>

          {/* Gaji */}
          <div className="md:col-span-2">
            <FieldLabel>Gaji (Rp)</FieldLabel>
            <StyledInput {...register('salary')} type="number" step="0.01" placeholder="0" disabled={isLoading} />
            <FieldError msg={errors.salary?.message} />
          </div>

        </div>
      </div>

      {/* ── Akun Pengguna — create flow ──────────────────── */}
      {!employee && (
        <div style={{ border: '1px solid #e9ecef', borderRadius: 12, overflow: 'hidden' }}>
          <SectionHeader
            right={
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#475569' }}>Buat Akun</span>
                <div className="relative">
                  <input {...register('createUserAccount')} type="checkbox" className="sr-only peer" disabled={isLoading} />
                  <div style={{ width: 36, height: 20, borderRadius: 99, transition: 'background 0.2s' }} className="bg-slate-200 peer-checked:bg-violet-600" />
                  <div style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.18)', transition: 'transform 0.2s' }} className="peer-checked:translate-x-4" />
                </div>
              </label>
            }
          >
            Akun Pengguna
          </SectionHeader>

          {!createUserAccount && (
            <div style={{ padding: '10px 18px', background: '#fafafa' }}>
              <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Opsional — buat akun login untuk karyawan ini</p>
            </div>
          )}

          {createUserAccount && (
            <div style={{ padding: 16, background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Info note */}
              <div className="flex items-start gap-2.5" style={{ padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 13, color: '#1d4ed8' }}>
                <svg className="w-4 h-4 flex-shrink-0" style={{ marginTop: 1, color: '#60a5fa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Email karyawan akan digunakan sebagai username login. Pastikan email valid dan unik.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Password <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
                  <StyledInput {...register('password')} type="password" placeholder="Minimal 8 karakter" disabled={isLoading} />
                  <FieldError msg={errors.password?.message} />
                </div>
                <div>
                  <FieldLabel>Role <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
                  <StyledSelect {...register('roleId')} disabled={isLoading || loadingRoles}>
                    <option value="">{loadingRoles ? 'Memuat role...' : '— Pilih Role —'}</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </StyledSelect>
                  <FieldError msg={errors.roleId?.message} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Akun Pengguna — edit readonly ────────────────── */}
      {employee && hasExistingUser && (
        <div style={{ border: '1px solid #dbeafe', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 18px', borderBottom: '1px solid #dbeafe', background: '#eff6ff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#3b82f6' }}>Akun Pengguna</span>
          </div>
          <div style={{ padding: 16, background: '#f8fbff' }}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Email',  value: employee.user?.email },
                { label: 'Role',   value: employee.user?.role?.name || '—' },
              ].map((item) => (
                <div key={item.label} style={{ padding: 12, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.value}</p>
                </div>
              ))}
              <div style={{ padding: 12, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>Status</p>
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                    ...(employee.user?.isActive
                      ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                      : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: employee.user?.isActive ? '#10b981' : '#94a3b8' }} />
                  {employee.user?.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
              Untuk mengubah password atau role, gunakan modul Manajemen User.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5" style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{ padding: '8px 16px', fontSize: 13.5, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, fontFamily: 'inherit', transition: 'background 0.12s' }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 font-semibold text-white"
          style={{
            padding: '8px 18px', fontSize: 13.5, borderRadius: 9, border: 'none',
            background: isLoading ? 'linear-gradient(135deg, #9b7fe8, #6395d8)' : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
            cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isLoading ? 'none' : '0 4px 14px rgba(124,58,237,0.3)'; }}
        >
          {isLoading && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Menyimpan...' : employee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
        </button>
      </div>
    </form>
  );
};