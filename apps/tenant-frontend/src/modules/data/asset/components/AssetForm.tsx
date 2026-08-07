// FILE: frontend/src/modules/data/asset/components/AssetForm.tsx
import { forwardRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationApi } from '@/shared/api/location.api';
import { assetSchema, AssetFormData } from '../asset.schema';
import { Asset, Location } from '@/shared/types';

interface AssetFormProps {
  asset?: Asset;
  onSubmit: (data: AssetFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TYPE_OPTIONS = [
  { value: 'equipment', label: 'Peralatan' },
  { value: 'vehicle',   label: 'Kendaraan' },
  { value: 'building',  label: 'Gedung' },
  { value: 'furniture', label: 'Furnitur' },
  { value: 'other',     label: 'Lainnya' },
];

const CONDITION_OPTIONS = [
  { value: 'excellent',   label: 'Sempurna' },
  { value: 'good',        label: 'Baik' },
  { value: 'fair',        label: 'Cukup' },
  { value: 'poor',        label: 'Buruk' },
  { value: 'maintenance', label: 'Perawatan' },
];

const StyledInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const { style, onFocus, onBlur, ...rest } = props;
    return (
      <input
        ref={ref}
        {...rest}
        style={{
          width: '100%', padding: '9px 13px', fontSize: 13.5,
          border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
          background: '#ffffff', color: '#1e293b',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit', ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0ea5e9';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
          onBlur?.(e);
        }}
      />
    );
  },
);
StyledInput.displayName = 'StyledInput';

const StyledSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  (props, ref) => {
    const { style, onFocus, onBlur, ...rest } = props;
    return (
      <div className="relative">
        <select
          ref={ref}
          {...rest}
          style={{
            width: '100%', padding: '9px 32px 9px 13px', fontSize: 13.5,
            border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
            background: '#ffffff', color: '#1e293b', appearance: 'none', cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            fontFamily: 'inherit', ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0ea5e9';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
            onBlur?.(e);
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  },
);
StyledSelect.displayName = 'StyledSelect';

const StyledTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => {
    const { style, onFocus, onBlur, ...rest } = props;
    return (
      <textarea
        ref={ref}
        {...rest}
        style={{
          width: '100%', padding: '9px 13px', fontSize: 13.5,
          border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none',
          background: '#ffffff', color: '#1e293b', resize: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit', ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0ea5e9';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
          onBlur?.(e);
        }}
      />
    );
  },
);
StyledTextarea.displayName = 'StyledTextarea';

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
    {children}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{msg}</p> : null;

export const AssetForm = ({ asset, onSubmit, onCancel, isLoading = false }: AssetFormProps) => {
  const [locations,  setLocations]  = useState<Location[]>([]);
  const [locLoading, setLocLoading] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: asset ?? { condition: 'good', isActive: true },
  });

  useEffect(() => {
    locationApi.list({ limit: 100 })
      .then((res) => setLocations(res.data ?? []))
      .catch(() => {})
      .finally(() => setLocLoading(false));
  }, []);

  const { ref: nameRef, ...nameRest }         = register('name');
  const { ref: codeRef, ...codeRest }         = register('code');
  const { ref: descRef, ...descRest }         = register('description');
  const { ref: dateRef, ...dateRest }         = register('purchaseDate');
  const { ref: typeRef, ...typeRest }         = register('type');
  const { ref: locRef,  ...locRest }          = register('locationId');
  const { ref: condRef, ...condRest }         = register('condition');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* Row 1: Nama (full width) */}
      <div>
        <FieldLabel>Nama Aset <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
        <StyledInput ref={nameRef} {...nameRest} placeholder="cth. Laptop Dell XPS 15" disabled={isLoading} />
        <FieldError msg={errors.name?.message} />
      </div>

      {/* Row 2: Kode + Tipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Kode Aset</FieldLabel>
          <StyledInput ref={codeRef} {...codeRest} placeholder="Kosongkan → auto (AST-0001)" disabled={isLoading} />
          <FieldError msg={errors.code?.message} />
        </div>
        <div>
          <FieldLabel>Tipe Aset <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledSelect ref={typeRef} {...typeRest} disabled={isLoading}>
            <option value="">— Pilih tipe —</option>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </StyledSelect>
          <FieldError msg={errors.type?.message} />
        </div>
      </div>

      {/* Row 3: Lokasi + Tanggal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Lokasi</FieldLabel>
          <StyledSelect ref={locRef} {...locRest} disabled={isLoading || locLoading}>
            <option value="">{locLoading ? 'Memuat lokasi...' : '— Tidak ada lokasi —'}</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </StyledSelect>
          <FieldError msg={errors.locationId?.message} />
        </div>
        <div>
          <FieldLabel>Tanggal Pembelian</FieldLabel>
          <StyledInput ref={dateRef} {...dateRest} type="date" disabled={isLoading} />
          <FieldError msg={errors.purchaseDate?.message} />
        </div>
      </div>

      {/* Row 4: Kondisi (full width) */}
      <div>
        <FieldLabel>Kondisi <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
        <StyledSelect ref={condRef} {...condRest} disabled={isLoading}>
          {CONDITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </StyledSelect>
        <FieldError msg={errors.condition?.message} />
      </div>

      {/* Row 5: Deskripsi */}
      <div>
        <FieldLabel>Deskripsi</FieldLabel>
        <StyledTextarea ref={descRef} {...descRest} rows={3} placeholder="Keterangan tambahan tentang aset ini..." disabled={isLoading} />
        <FieldError msg={errors.description?.message} />
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
              ? 'linear-gradient(135deg, #7dd3f0, #6395d8)'
              : 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(14,165,233,0.3)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(14,165,233,0.42)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isLoading ? 'none' : '0 4px 14px rgba(14,165,233,0.3)'; }}
        >
          {isLoading && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Menyimpan...' : asset ? 'Simpan Perubahan' : 'Tambah Aset'}
        </button>
      </div>
    </form>
  );
};