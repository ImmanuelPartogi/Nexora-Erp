// FILE: frontend/src/modules/data/asset/pages/AssetDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetApi } from '@/shared/api/asset.api';
import { useAsset } from '../hooks/useAssets';
import { AssetForm } from '../components/AssetForm';
import { PermissionGate } from '@/app/PermissionGate';
import { AssetFormData } from '../asset.schema';

const CONDITION: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  excellent:   { label: 'Sempurna',  bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe', dot: '#7c3aed' },
  good:        { label: 'Baik',      bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0', dot: '#10b981' },
  fair:        { label: 'Cukup',     bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  poor:        { label: 'Buruk',     bg: '#fff1f2', text: '#991b1b', border: '#fecdd3', dot: '#ef4444' },
  maintenance: { label: 'Perawatan', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
};

const TYPE_LABELS: Record<string, string> = {
  equipment: 'Peralatan', vehicle: 'Kendaraan',
  building: 'Gedung', furniture: 'Furnitur', other: 'Lainnya',
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4" style={{ padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8', width: 128, flexShrink: 0, paddingTop: 2 }}>
      {label}
    </span>
    <span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: 500, flex: 1 }}>
      {value ?? <span style={{ color: '#cbd5e1', fontWeight: 400 }}>—</span>}
    </span>
  </div>
);

function SectionCard({ dotColor, title, children }: { dotColor: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '0 20px 8px' }}>
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ASSET DETAIL PAGE
// ════════════════════════════════════════════════════════════════
export const AssetDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: asset, isLoading } = useAsset(id!);
  const [editOpen,   setEditOpen]   = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdate = async (formData: AssetFormData) => {
    try {
      setIsUpdating(true);
      await assetApi.update(id!, formData);
      setEditOpen(false); showToast('Aset berhasil diperbarui');
      window.location.reload();
    } catch { alert('Gagal memperbarui aset.'); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus aset "${asset?.name}"?`)) return;
    try { await assetApi.delete(id!); navigate('/assets'); }
    catch { alert('Gagal menghapus aset.'); }
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5 flex items-center gap-3 animate-pulse">
            <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 200, height: 16, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 120, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid #e9ecef' }}>
              {[...Array(4)].map((_, j) => (
                <div key={j} style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 14 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!asset) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}
      >
        <div className="text-center">
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <svg className="w-7 h-7" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Aset tidak ditemukan</p>
          <button
            onClick={() => navigate('/assets')}
            style={{
              marginTop: 14, padding: '8px 18px', fontSize: 13.5, fontWeight: 500,
              color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ← Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const cond = CONDITION[asset.condition] ?? { label: asset.condition, bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8' };

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
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          {toast}
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-start justify-between gap-4">

            {/* Left: breadcrumb + title */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Back button */}
              <button
                onClick={() => navigate('/assets')}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Aset
              </button>

              <svg className="w-3 h-3" style={{ color: '#e2e8f0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>

              {/* Asset identity */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(14,165,233,0.28)',
                  }}
                >
                  <svg width={18} height={18} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {asset.name}
                  </h1>
                  {/* Badges row */}
                  <div className="flex items-center flex-wrap gap-2" style={{ marginTop: 5 }}>
                    <span style={{
                      fontFamily: 'ui-monospace, monospace', fontSize: 11.5, fontWeight: 700,
                      padding: '3px 9px', borderRadius: 6, background: '#f5f3ff', color: '#5b21b6',
                    }}>
                      {asset.code}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: cond.bg, color: cond.text, border: `1px solid ${cond.border}` }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cond.dot }} />
                      {cond.label}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                        ...(asset.isActive
                          ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                          : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: asset.isActive ? '#10b981' : '#94a3b8' }} />
                      {asset.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <PermissionGate permission="data.asset.edit">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5"
                  style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: 600,
                    color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
                    borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit
                </button>
              </PermissionGate>
              <PermissionGate permission="data.asset.delete">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5"
                  style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: 600,
                    color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3',
                    borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#ffe4e6'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}
                >
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

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <SectionCard dotColor="#38bdf8" title="Informasi Aset">
          <DetailRow label="Tipe"    value={asset.type ? (TYPE_LABELS[asset.type] ?? asset.type) : null} />
          <DetailRow label="Lokasi"  value={asset.locationName} />
          <DetailRow label="Tgl. Beli" value={
            asset.purchaseDate
              ? new Date(asset.purchaseDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
              : null
          } />
          <DetailRow label="Kondisi" value={
            <span
              className="inline-flex items-center gap-1.5"
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: cond.bg, color: cond.text, border: `1px solid ${cond.border}` }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cond.dot }} />
              {cond.label}
            </span>
          } />
        </SectionCard>

        <SectionCard dotColor="#94a3b8" title="Informasi Tambahan">
          <DetailRow label="Deskripsi"  value={asset.description} />
          <DetailRow label="Dibuat"     value={new Date(asset.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <DetailRow label="Diperbarui" value={new Date(asset.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
        </SectionCard>
      </div>

      {/* ── Edit modal ─────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(15,23,42,0.45)' }}
            onClick={() => setEditOpen(false)}
          />
          <div
            className="relative bg-white w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: 520, maxHeight: '90vh', borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ height: 2, background: 'linear-gradient(90deg, #0ea5e9 0%, #2563eb 50%, #7c3aed 100%)', flexShrink: 0 }} />
            <div
              className="flex items-center justify-between flex-shrink-0"
              style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}
            >
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Edit Aset</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Perbarui informasi aset</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                title="Tutup"
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <AssetForm asset={asset} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} isLoading={isUpdating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};