// FILE: src/modules/data/vendor/components/VendorForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, VendorFormData } from '../vendor.schema';
import { Vendor } from '@/shared/types';

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (data: VendorFormData) => Promise<void>;
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
        background: props.disabled ? '#f8fafc' : '#ffffff',
        color: props.disabled ? '#94a3b8' : '#1e293b',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit', ...style,
      }}
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; } onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
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
        background: props.disabled ? '#f8fafc' : '#ffffff',
        color: props.disabled ? '#94a3b8' : '#1e293b',
        resize: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit', ...style,
      }}
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; } onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
    />
  );
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
    {children}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{msg}</p> : null;

export const VendorForm = ({ vendor, onSubmit, onCancel, isLoading = false }: VendorFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor ?? {},
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* Row 1: Nama + Kode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Nama Vendor <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledInput {...register('name')} placeholder="cth. PT Maju Jaya" disabled={isLoading} />
          <FieldError msg={errors.name?.message} />
        </div>
        <div>
          <FieldLabel>Kode Vendor</FieldLabel>
          <StyledInput {...register('code')} placeholder="cth. VEND-001" disabled={isLoading} />
          <FieldError msg={errors.code?.message} />
        </div>
      </div>

      {/* Row 2: Email + Telepon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <StyledInput {...register('email')} type="email" placeholder="vendor@example.com" disabled={isLoading} />
          <FieldError msg={errors.email?.message} />
        </div>
        <div>
          <FieldLabel>Telepon</FieldLabel>
          <StyledInput {...register('phone')} placeholder="+62 812 3456 7890" disabled={isLoading} />
          <FieldError msg={errors.phone?.message} />
        </div>
      </div>

      {/* Alamat */}
      <div>
        <FieldLabel>Alamat</FieldLabel>
        <StyledInput {...register('address')} placeholder="Jl. Contoh No. 1, Kota, Provinsi" disabled={isLoading} />
        <FieldError msg={errors.address?.message} />
      </div>

      {/* Catatan */}
      <div>
        <FieldLabel>Catatan</FieldLabel>
        <StyledTextarea {...register('notes')} rows={3} placeholder="Keterangan tambahan tentang vendor ini..." disabled={isLoading} />
        <FieldError msg={errors.notes?.message} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2.5" style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
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
          disabled={isLoading}
          className="flex items-center gap-1.5 font-semibold text-white"
          style={{
            padding: '8px 18px', fontSize: 13.5, borderRadius: 9, border: 'none',
            background: isLoading
              ? 'linear-gradient(135deg, #c4b5fd, #a78bfa)'
              : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'box-shadow 0.15s',
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
          {isLoading ? 'Menyimpan...' : vendor ? 'Simpan Perubahan' : 'Tambah Vendor'}
        </button>
      </div>
    </form>
  );
};