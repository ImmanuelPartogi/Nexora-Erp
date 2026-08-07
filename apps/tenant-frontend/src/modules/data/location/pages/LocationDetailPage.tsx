// FILE: frontend/src/modules/data/location/pages/LocationDetailPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { locationApi } from '@/shared/api/location.api';
import { useLocation } from '../hooks/useLocations';
import { LocationForm } from '../components/LocationForm';
import { PermissionGate } from '@/app/PermissionGate';
import { LocationFormData } from '../location.schema';

// ── Type config (inline styles) ───────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string; icon: React.ReactNode }> = {
  warehouse: {
    label: 'Gudang', bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b',
    icon: <svg className="w-5 h-5" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>,
  },
  office: {
    label: 'Kantor', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6',
    icon: <svg className="w-5 h-5" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  },
  store: {
    label: 'Toko', bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe', dot: '#7c3aed',
    icon: <svg className="w-5 h-5" style={{ color: '#7c3aed' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>,
  },
  other: {
    label: 'Lainnya', bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8',
    icon: <svg className="w-5 h-5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  },
};

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
export const LocationDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: location, isLoading } = useLocation(id!);
  const [editOpen,   setEditOpen]   = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdate = async (formData: LocationFormData) => {
    try {
      setIsUpdating(true);
      await locationApi.update(id!, formData);
      setEditOpen(false); showToast('Lokasi berhasil diperbarui');
      window.location.reload();
    } catch { alert('Gagal memperbarui lokasi.'); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus lokasi "${location?.name}"?`)) return;
    try { await locationApi.delete(id!); navigate('/locations'); }
    catch { alert('Gagal menghapus lokasi.'); }
  };

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5 flex items-center gap-3 animate-pulse">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 180, height: 16, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 100, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '1px solid #e9ecef' }}>
              {[0, 1, 2].map((j) => <div key={j} style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 14 }} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4"
            style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg className="w-7 h-7" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Lokasi tidak ditemukan</p>
          <button onClick={() => navigate('/locations')}
            style={{ marginTop: 14, padding: '8px 18px', fontSize: 13.5, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const tc = TYPE_CONFIG[location.type ?? ''] ?? TYPE_CONFIG.other;

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
              <button onClick={() => navigate('/locations')}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Lokasi
              </button>

              <svg className="w-3 h-3" style={{ color: '#e2e8f0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>

              <div className="flex items-center gap-3">
                {/* Location icon badge */}
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 44, borderRadius: 12, background: tc.bg, border: `1px solid ${tc.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {tc.icon}
                </div>

                <div>
                  <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {location.name}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2" style={{ marginTop: 5 }}>
                    <span className="inline-flex items-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
                      {tc.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5"
                      style={{
                        fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                        ...(location.isActive
                          ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                          : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                      }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: location.isActive ? '#10b981' : '#94a3b8' }} />
                      {location.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <PermissionGate permission="data.location.edit">
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
              <PermissionGate permission="data.location.delete">
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

        <SectionCard dotColor={tc.dot} title="Informasi Lokasi">
          <DetailRow label="Nama" value={location.name} />
          <DetailRow label="Tipe" value={
            <span className="inline-flex items-center gap-1.5"
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc.dot }} />
              {tc.label}
            </span>
          } />
          <DetailRow label="Alamat" value={location.address} />
        </SectionCard>

        <SectionCard dotColor="#94a3b8" title="Informasi Record">
          <DetailRow label="Dibuat"     value={new Date(location.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <DetailRow label="Diperbarui" value={new Date(location.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} />
        </SectionCard>
      </div>

      {/* ── Edit modal ────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={() => setEditOpen(false)} />
          <div className="relative bg-white w-full flex flex-col overflow-hidden"
            style={{ maxWidth: 480, maxHeight: '90vh', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 60%, #ef4444 100%)', flexShrink: 0 }} />
            <div className="flex items-center justify-between flex-shrink-0" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Edit Lokasi</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Perbarui informasi lokasi</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <LocationForm location={location} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} isLoading={isUpdating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};