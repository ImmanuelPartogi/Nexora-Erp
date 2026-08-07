// FILE: src/modules/operations/production/components/ProductionForm.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productApi } from '@/shared/api/product.api';
import { productionSchema, ProductionFormData } from '../production.schema';
import { Product } from '@/shared/types';

interface ProductionFormProps {
  onSubmit: (data: ProductionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ── Shared styled primitives (brand: rose #e11d48) ────────────
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { onFocus, onBlur, ...rest } = props;
  return (
    <input {...rest}
      style={{ width: '100%', padding: '9px 13px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none', background: props.disabled ? '#f8fafc' : '#ffffff', color: props.disabled ? '#94a3b8' : '#1e293b', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.1)'; } onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
    />
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { onFocus, onBlur, children, ...rest } = props;
  return (
    <div className="relative">
      <select {...rest}
        style={{ width: '100%', padding: '9px 32px 9px 13px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none', background: props.disabled ? '#f8fafc' : '#ffffff', color: '#1e293b', appearance: 'none', cursor: props.disabled ? 'not-allowed' : 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
        onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.1)'; } onFocus?.(e); }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}>
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { onFocus, onBlur, ...rest } = props;
  return (
    <textarea {...rest}
      style={{ width: '100%', padding: '9px 13px', fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 9, outline: 'none', background: props.disabled ? '#f8fafc' : '#ffffff', color: props.disabled ? '#94a3b8' : '#1e293b', resize: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
      onFocus={(e) => { if (!props.disabled) { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.1)'; } onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
    />
  );
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>{children}</label>
);
const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{msg}</p> : null;

export const ProductionForm = ({ onSubmit, onCancel, isLoading = false }: ProductionFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductionFormData>({
    resolver: zodResolver(productionSchema),
  });

  useEffect(() => {
    productApi.list({ limit: 100, type: 'finished_goods' })
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Nomor Batch</FieldLabel>
          <StyledInput {...register('batchNo')} placeholder="BATCH001" disabled={isLoading} />
          <FieldError msg={errors.batchNo?.message} />
        </div>
        <div>
          <FieldLabel>Produk <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledSelect {...register('productId')} disabled={isLoading}>
            <option value="">— Pilih produk —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </StyledSelect>
          <FieldError msg={errors.productId?.message} />
        </div>
        <div>
          <FieldLabel>Kuantitas <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledInput {...register('quantity')} type="number" placeholder="0" disabled={isLoading} />
          <FieldError msg={errors.quantity?.message} />
        </div>
        <div>
          <FieldLabel>Tanggal Produksi <span style={{ color: '#ef4444' }}>*</span></FieldLabel>
          <StyledInput {...register('date')} type="date" disabled={isLoading} />
          <FieldError msg={errors.date?.message} />
        </div>
      </div>

      <div>
        <FieldLabel>Catatan</FieldLabel>
        <StyledTextarea {...register('notes')} rows={3} placeholder="Catatan produksi..." disabled={isLoading} />
        <FieldError msg={errors.notes?.message} />
      </div>

      <div className="flex items-center justify-end gap-2.5"
        style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
        <button type="button" onClick={onCancel} disabled={isLoading}
          style={{ padding: '8px 16px', fontSize: 13.5, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, fontFamily: 'inherit' }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}>
          Batal
        </button>
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-1.5 font-semibold text-white"
          style={{ padding: '8px 18px', fontSize: 13.5, borderRadius: 9, border: 'none', background: isLoading ? '#fda4af' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', boxShadow: isLoading ? 'none' : '0 4px 14px rgba(225,29,72,0.3)', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'box-shadow 0.15s' }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(225,29,72,0.42)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isLoading ? 'none' : '0 4px 14px rgba(225,29,72,0.3)'; }}>
          {isLoading && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
          {isLoading ? 'Menyimpan...' : 'Buat Produksi'}
        </button>
      </div>
    </form>
  );
};