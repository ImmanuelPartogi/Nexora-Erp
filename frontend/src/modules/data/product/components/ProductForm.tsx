// FILE: frontend/src/modules/data/product/components/ProductForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData } from '../product.schema';
import { Product } from '@/shared/types';

interface ProductFormProps {
  product?: Product;
  onSubmit:  (data: ProductFormData) => Promise<void>;
  onCancel:  () => void;
  isLoading?: boolean;
}

const TYPE_OPTIONS = [
  { value: 'goods',          label: 'Barang' },
  { value: 'service',        label: 'Jasa' },
  { value: 'raw_material',   label: 'Bahan Baku' },
  { value: 'finished_goods', label: 'Barang Jadi' },
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
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; } onFocus?.(e); }}
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
        onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; } onFocus?.(e); }}
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
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; } onFocus?.(e); }}
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

export const ProductForm = ({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? { type: 'goods' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* Row 1: Nama + Kode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Nama Produk <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledInput {...register('name')} placeholder="cth. Laptop Dell XPS, Jasa Konsultasi" disabled={isLoading} />
          <FieldError msg={errors.name?.message} />
        </div>
        <div>
          <FieldLabel>Kode Produk</FieldLabel>
          <StyledInput {...register('code')} placeholder="Kosongkan untuk auto (PRD-0001)" disabled={isLoading} />
          <FieldError msg={errors.code?.message} />
        </div>
      </div>

      {/* Row 2: Tipe + Satuan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Tipe Produk <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledSelect {...register('type')} disabled={isLoading}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </StyledSelect>
          <FieldError msg={errors.type?.message} />
        </div>
        <div>
          <FieldLabel>Satuan <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledInput {...register('unit')} placeholder="cth. pcs, kg, liter, jam" disabled={isLoading} />
          <FieldError msg={errors.unit?.message} />
        </div>
      </div>

      {/* Row 3: Harga Jual + Harga Modal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Harga Jual (Rp)</FieldLabel>
          <StyledInput {...register('price')} type="number" step="0.01" placeholder="0" disabled={isLoading} />
          <FieldError msg={errors.price?.message} />
        </div>
        <div>
          <FieldLabel>Harga Modal (Rp)</FieldLabel>
          <StyledInput {...register('cost')} type="number" step="0.01" placeholder="0" disabled={isLoading} />
          <FieldError msg={errors.cost?.message} />
        </div>
      </div>

      {/* Deskripsi */}
      <div>
        <FieldLabel>Deskripsi</FieldLabel>
        <StyledTextarea {...register('description')} rows={3} placeholder="Keterangan tambahan tentang produk ini..." disabled={isLoading} />
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
              ? 'linear-gradient(135deg, #67e8f9, #38bdf8)'
              : 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(8,145,178,0.3)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(8,145,178,0.42)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isLoading ? 'none' : '0 4px 14px rgba(8,145,178,0.3)'; }}
        >
          {isLoading && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Menyimpan...' : product ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  );
};