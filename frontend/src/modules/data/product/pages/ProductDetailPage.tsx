// FILE: frontend/src/modules/data/product/pages/ProductDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '@/shared/api/product.api';
import { useProduct } from '../hooks/useProducts';
import { ProductForm } from '../components/ProductForm';
import { PermissionGate } from '@/app/PermissionGate';
import { ProductFormData } from '../product.schema';

// ── Type config ────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  goods:          { label: 'Barang',      bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  service:        { label: 'Jasa',        bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe', dot: '#7c3aed' },
  raw_material:   { label: 'Bahan Baku',  bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  finished_goods: { label: 'Barang Jadi', bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
};

const fmtIDR = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4" style={{ padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', width: 120, flexShrink: 0, paddingTop: 2 }}>
      {label}
    </span>
    <span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: 500, flex: 1 }}>
      {value || <span style={{ color: '#cbd5e1', fontWeight: 400 }}>—</span>}
    </span>
  </div>
);

function SectionCard({ dotColor, title, children }: { dotColor: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>{title}</span>
      </div>
      <div style={{ padding: '0 20px 8px' }}>{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export const ProductDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const [editOpen,   setEditOpen]   = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdate = async (formData: ProductFormData) => {
    try {
      setIsUpdating(true);
      await productApi.update(id!, formData);
      setEditOpen(false); showToast('Produk berhasil diperbarui');
      window.location.reload();
    } catch { alert('Gagal memperbarui produk.'); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${product?.name}"?`)) return;
    try { await productApi.delete(id!); navigate('/products'); }
    catch { alert('Gagal menghapus produk.'); }
  };

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5 flex items-center gap-3 animate-pulse">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 200, height: 16, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 100, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid #e9ecef' }}>
              {[0, 1, 2, 3].map((j) => <div key={j} style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 14 }} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4"
            style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg className="w-7 h-7" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Produk tidak ditemukan</p>
          <button onClick={() => navigate('/products')}
            style={{ marginTop: 14, padding: '8px 18px', fontSize: 13.5, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const tc = TYPE_CONFIG[product.type ?? ''] ?? { label: product.type ?? '—', bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
  const margin = product.price && product.cost ? Number(product.price) - Number(product.cost) : null;

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
              <button onClick={() => navigate('/products')}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Produk
              </button>

              <svg className="w-3 h-3" style={{ color: '#e2e8f0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>

              <div className="flex items-center gap-3">
                {/* Icon badge */}
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfeff', border: '1px solid #a5f3fc', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <svg width={20} height={20} style={{ color: '#0891b2' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>

                <div>
                  <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {product.name}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2" style={{ marginTop: 5 }}>
                    {product.code && (
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'ui-monospace, monospace', padding: '2px 8px', borderRadius: 6, background: '#ecfeff', color: '#155e75', border: '1px solid #a5f3fc' }}>
                        {product.code}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
                      {tc.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5"
                      style={{
                        fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                        ...(product.isActive
                          ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                          : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                      }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: product.isActive ? '#10b981' : '#94a3b8' }} />
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <PermissionGate permission="data.product.edit">
                <button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5"
                  style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit
                </button>
              </PermissionGate>
              <PermissionGate permission="data.product.delete">
                <button onClick={handleDelete} className="flex items-center gap-1.5"
                  style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ffe4e6'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}>
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

        <SectionCard dotColor="#0891b2" title="Informasi Produk">
          <DetailRow label="Nama"    value={product.name} />
          <DetailRow label="Tipe"    value={
            <span className="inline-flex items-center gap-1.5"
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
              {tc.label}
            </span>
          } />
          <DetailRow label="Satuan"  value={product.unit} />
          <DetailRow label="Deskripsi" value={product.description} />
        </SectionCard>

        {/* Pricing card with margin callout */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>Harga</span>
          </div>
          <div style={{ padding: '0 20px 8px' }}>
            <DetailRow label="Harga Jual" value={
              product.price
                ? <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{fmtIDR(Number(product.price))}</span>
                : undefined
            } />
            <DetailRow label="Harga Modal" value={product.cost ? fmtIDR(Number(product.cost)) : undefined} />
            <DetailRow label="Margin" value={
              margin !== null ? (
                <span className="inline-flex items-center gap-1.5"
                  style={{
                    fontSize: 13, fontWeight: 700,
                    ...(margin >= 0 ? { color: '#065f46' } : { color: '#991b1b' }),
                  }}>
                  {margin >= 0 ? '↑' : '↓'} {fmtIDR(Math.abs(margin))}
                  {product.cost && Number(product.cost) > 0 && (
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: '#94a3b8' }}>
                      ({((margin / Number(product.cost)) * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              ) : undefined
            } />
          </div>
        </div>

        <SectionCard dotColor="#94a3b8" title="Informasi Record">
          <DetailRow label="Dibuat"     value={new Date(product.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <DetailRow label="Diperbarui" value={new Date(product.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
        </SectionCard>
      </div>

      {/* ── Edit modal ────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={() => setEditOpen(false)} />
          <div className="relative bg-white w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 560, maxHeight: '92vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, #0891b2 0%, #0ea5e9 55%, #38bdf8 100%)', flexShrink: 0 }} />
            <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Edit Produk</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Perbarui informasi produk</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <ProductForm product={product} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} isLoading={isUpdating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};