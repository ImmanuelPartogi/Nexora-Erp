// FILE: frontend/src/modules/data/location/components/LocationForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormData } from '../location.schema';
import { Location } from '@/shared/types';

interface LocationFormProps {
  location?: Location;
  onSubmit:  (data: LocationFormData) => Promise<void>;
  onCancel:  () => void;
  isLoading?: boolean;
}

const TYPE_OPTIONS = [
  { value: 'warehouse', label: 'Gudang' },
  { value: 'office',    label: 'Kantor' },
  { value: 'store',     label: 'Toko' },
  { value: 'other',     label: 'Lainnya' },
];

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
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; } onFocus?.(e); }}
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
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit', ...style,
        }}
        onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; } onFocus?.(e); }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
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
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; } onFocus?.(e); }}
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

export const LocationForm = ({ location, onSubmit, onCancel, isLoading = false }: LocationFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location ?? { isActive: true },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* Nama */}
      <div>
        <FieldLabel>Nama Lokasi <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
        <StyledInput {...register('name')} placeholder="cth. Gudang Utama, Kantor Jakarta" disabled={isLoading} />
        <FieldError msg={errors.name?.message} />
      </div>

      {/* Tipe */}
      <div>
        <FieldLabel>Tipe Lokasi</FieldLabel>
        <StyledSelect {...register('type')} disabled={isLoading}>
          <option value="">— Pilih tipe —</option>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </StyledSelect>
        <FieldError msg={errors.type?.message} />
      </div>

      {/* Alamat */}
      <div>
        <FieldLabel>Alamat</FieldLabel>
        <StyledTextarea {...register('address')} rows={3} placeholder="Jl. Contoh No. 1, Kota, Provinsi" disabled={isLoading} />
        <FieldError msg={errors.address?.message} />
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
              ? 'linear-gradient(135deg, #fbbf24, #fb923c)'
              : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(245,158,11,0.3)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(245,158,11,0.42)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isLoading ? 'none' : '0 4px 14px rgba(245,158,11,0.3)'; }}
        >
          {isLoading && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Menyimpan...' : location ? 'Simpan Perubahan' : 'Tambah Lokasi'}
        </button>
      </div>
    </form>
  );
};