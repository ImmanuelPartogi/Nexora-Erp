// FILE: frontend/src/modules/data/customer/components/CustomerForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormData } from '../customer.schema';
import { Customer } from '@/shared/types';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit:  (data: CustomerFormData) => Promise<void>;
  onCancel:  () => void;
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

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
    {children}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{msg}</p> : null;

export const CustomerForm = ({ customer, onSubmit, onCancel, isLoading = false }: CustomerFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ?? {},
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* Nama (full width) */}
      <div>
        <FieldLabel>Nama Customer <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
        <StyledInput {...register('name')} placeholder="Nama lengkap pelanggan" disabled={isLoading} />
        <FieldError msg={errors.name?.message} />
      </div>

      {/* Kode + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Kode Customer</FieldLabel>
          <StyledInput {...register('code')} placeholder="Kosongkan untuk auto (CUST-0001)" disabled={isLoading} />
          <FieldError msg={errors.code?.message} />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <StyledInput {...register('email')} type="email" placeholder="email@perusahaan.com" disabled={isLoading} />
          <FieldError msg={errors.email?.message} />
        </div>
      </div>

      {/* Telepon + Alamat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Nomor Telepon</FieldLabel>
          <StyledInput {...register('phone')} placeholder="+62 812 3456 7890" disabled={isLoading} />
          <FieldError msg={errors.phone?.message} />
        </div>
        <div>
          <FieldLabel>Alamat</FieldLabel>
          <StyledInput {...register('address')} placeholder="Jl. Contoh No. 1, Kota" disabled={isLoading} />
          <FieldError msg={errors.address?.message} />
        </div>
      </div>

      {/* Catatan */}
      <div>
        <FieldLabel>Catatan</FieldLabel>
        <StyledTextarea {...register('notes')} rows={3} placeholder="Catatan tambahan tentang pelanggan ini..." disabled={isLoading} />
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
              ? 'linear-gradient(135deg, #9b7fe8, #6395d8)'
              : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
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
          {isLoading ? 'Menyimpan...' : customer ? 'Simpan Perubahan' : 'Tambah Customer'}
        </button>
      </div>
    </form>
  );
};