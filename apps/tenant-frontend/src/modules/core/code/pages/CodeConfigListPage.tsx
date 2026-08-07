// FILE: frontend/src/modules/core/code/pages/CodeConfigListPage.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { codeConfigApi, CodeConfig, CODE_ENTITY_LABELS } from '@/shared/api/code-config.api';
import { READ_ONLY } from '@/shared/config/readOnly';

const ENTITY_OPTIONS = Object.entries(CODE_ENTITY_LABELS ?? {}).map(([value, label]) => ({ value, label: label as string }));

const DEFAULT_PREFIX: Record<string, string> = {
  customer: 'CUST', vendor: 'VEND', product: 'PRDCT', employee: 'EMP',
  asset: 'AST', warehouse: 'WH', stock_in: 'STIN', stock_out: 'STOUT',
  stock_adjustment: 'STADJ', production: 'PROD',
  transaction_income: 'INC', transaction_expense: 'EXP',
  purchase: 'PO', lease: 'LSE',
};

type ModalMode = 'create' | 'edit' | null;

// ── Shared input style ────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '9px 13px',
  fontSize: 13.5,
  border: '1px solid #e2e8f0',
  borderRadius: 9,
  outline: 'none',
  background: '#ffffff',
  color: '#1e293b',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, style, onFocus, onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      style={{ ...inputBase, ...(hasError ? { borderColor: '#fca5a5', background: '#fff8f8' } : {}), ...style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#7c3aed';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = hasError ? '#fca5a5' : '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        onBlur?.(e);
      }}
    />
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#7c3aed';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: 'left',
      fontSize: 10.5, fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em',
      color: '#94a3b8', background: '#f8fafc',
      borderBottom: '1px solid #f1f5f9',
      whiteSpace: 'nowrap' as const,
      fontFamily: 'inherit',
    }}>
      {children}
    </th>
  );
}

function StatCard({ label, value, bg, valueColor, textColor, border }: {
  label: string; value: number;
  bg: string; valueColor: string; textColor: string; border?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: bg,
        border: border ? `1px solid ${border}` : '1px solid transparent',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        minHeight: 88,
      }}
    >
      <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: textColor, opacity: 0.65 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: valueColor, marginTop: 6 }}>{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function CodeConfigListPage() {
  const [configs,       setConfigs]       = useState<CodeConfig[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [modalMode,     setModalMode]     = useState<ModalMode>(null);
  const [editingConfig, setEditingConfig] = useState<CodeConfig | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [busyId,        setBusyId]        = useState<string | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [toast,         setToast]         = useState<string | null>(null);
  const [hoveredId,     setHoveredId]     = useState<string | null>(null);
  const [formData,      setFormData]      = useState({ entity: '', prefix: '', digitCount: 4 });

  useEffect(() => { loadConfigs(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadConfigs = async () => {
    try {
      setLoading(true); setError(null);
      const data = await codeConfigApi.list();
      setConfigs(Array.isArray(data) ? data : []);
    } catch { setError('Gagal memuat data. Coba refresh halaman.'); }
    finally { setLoading(false); }
  };

  const existingEntities  = new Set(configs.map((c) => c.entity));
  const availableEntities = ENTITY_OPTIONS.filter((o) => !existingEntities.has(o.value));

  const openCreate = () => {
    const first = availableEntities[0]?.value ?? '';
    setEditingConfig(null);
    setFormData({ entity: first, prefix: DEFAULT_PREFIX[first] ?? '', digitCount: 4 });
    setModalMode('create');
  };

  const openEdit = (config: CodeConfig) => {
    setEditingConfig(config);
    setFormData({ entity: config.entity, prefix: config.prefix, digitCount: config.digitCount });
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditingConfig(null); };

  const handleCreate = async () => {
    if (!formData.entity || !formData.prefix) return;
    try {
      setSaving(true);
      await codeConfigApi.create({ entity: formData.entity, prefix: formData.prefix, digitCount: formData.digitCount });
      await loadConfigs(); closeModal(); showToast('Konfigurasi berhasil dibuat');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal membuat konfigurasi.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editingConfig) return;
    try {
      setSaving(true);
      await codeConfigApi.update(editingConfig.id, { prefix: formData.prefix, digitCount: formData.digitCount });
      await loadConfigs(); closeModal(); showToast('Konfigurasi berhasil diperbarui');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal update konfigurasi.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (config: CodeConfig) => {
    const label = CODE_ENTITY_LABELS[config.entity] ?? config.entity;
    if (!confirm(`Hapus konfigurasi "${label}"?`)) return;
    try {
      setBusyId(config.id);
      await codeConfigApi.delete(config.id);
      await loadConfigs(); showToast('Konfigurasi dihapus');
    } catch (err) { const axiosError = err as { response?: { data?: { message?: string } } }; alert(axiosError?.response?.data?.message ?? 'Gagal menghapus.'); }
    finally { setBusyId(null); }
  };

  const handleReset = async (config: CodeConfig) => {
    const label = CODE_ENTITY_LABELS[config.entity] ?? config.entity;
    if (!confirm(`Reset counter "${label}" ke 0?`)) return;
    try {
      setBusyId(config.id);
      await codeConfigApi.resetCounter(config.id);
      await loadConfigs(); showToast('Counter berhasil direset');
    } catch { alert('Gagal mereset counter.'); }
    finally { setBusyId(null); }
  };

  const getNextCode = (c: CodeConfig) =>
    `${c.prefix}-${String(c.lastNumber + 1).padStart(c.digitCount, '0')}`;

  const handleEntityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const entity = e.target.value;
    setFormData({ entity, prefix: DEFAULT_PREFIX[entity] ?? '', digitCount: formData.digitCount });
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5">
            <div style={{ width: 280, height: 20, background: '#f1f5f9', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 animate-pulse" style={{ border: '1px solid #e9ecef' }}>
              <div style={{ width: 140, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 72, height: 22, background: '#f1f5f9', borderRadius: 8 }} />
              <div style={{ width: 32, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ flex: 1, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 80, height: 22, background: '#f1f5f9', borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.28)',
                }}
              >
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Konfigurasi Kode Otomatis</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Format penomoran dokumen per entitas</p>
              </div>
            </div>

            {!READ_ONLY && (
              <button
                onClick={openCreate}
                disabled={availableEntities.length === 0}
                className="flex items-center gap-1.5 font-semibold text-white rounded-xl"
                style={{
                  padding: '8px 16px', fontSize: 13.5, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                  cursor: availableEntities.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: availableEntities.length === 0 ? 0.5 : 1,
                  fontFamily: 'inherit', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { if (availableEntities.length > 0) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)'; }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Konfigurasi
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl"
            style={{ padding: '11px 14px', background: '#fff1f2', border: '1px solid #fecdd3' }}>
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span style={{ fontSize: 13.5, color: '#be123c' }}>{error}</span>
          </div>
        )}

        {/* ── Stat cards ─────────────────────────────────── */}
        {configs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl p-4 flex flex-col justify-between"
              style={{ background: 'linear-gradient(135deg, #0e1420 0%, #1e1b4b 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minHeight: 88 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>Total Konfigurasi</p>
              <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#ffffff', marginTop: 6 }}>{configs.length}</p>
            </div>
            <StatCard label="Aktif"              value={configs.filter(c => c.isActive).length}  bg="#f0fdf4" valueColor="#065f46" textColor="#065f46" border="#bbf7d0" />
            <StatCard label="Nonaktif"            value={configs.filter(c => !c.isActive).length} bg="#f8fafc" valueColor="#475569" textColor="#475569" border="#e2e8f0" />
            <StatCard label="Belum Dikonfigurasi" value={availableEntities.length}                bg="#fffbeb" valueColor="#92400e" textColor="#92400e" border="#fde68a" />
          </div>
        )}

        {/* ── Table card ─────────────────────────────────── */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {configs.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="flex items-center justify-center mx-auto mb-4"
                style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <svg className="w-6 h-6" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <p className="font-semibold text-slate-600" style={{ fontSize: 14 }}>Belum ada konfigurasi kode</p>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 5, maxWidth: 280, margin: '6px auto 0' }}>
                Klik "Tambah Konfigurasi" untuk membuat format penomoran baru.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  <strong style={{ color: '#475569' }}>{configs.length}</strong> konfigurasi terdaftar ·{' '}
                  <strong style={{ color: '#475569' }}>{availableEntities.length}</strong> entity belum dikonfigurasi
                </span>
              </div>

              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <TH>Entity</TH>
                      <TH>Prefix</TH>
                      <TH>Digit</TH>
                      <TH>No. Terakhir</TH>
                      <TH>Kode Berikutnya</TH>
                      <TH>Status</TH>
                      <TH>Aksi</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {configs.map((config) => {
                      const busy    = busyId === config.id;
                      const hovered = hoveredId === config.id;
                      return (
                        <tr
                          key={config.id}
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; setHoveredId(config.id); }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; setHoveredId(null); }}
                        >
                          {/* Entity */}
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                              {CODE_ENTITY_LABELS[config.entity] ?? config.entity}
                            </span>
                          </td>

                          {/* Prefix badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block', fontFamily: 'ui-monospace, monospace',
                              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 7,
                              background: '#f5f3ff', color: '#5b21b6', letterSpacing: '0.03em',
                            }}>
                              {config.prefix}
                            </span>
                          </td>

                          {/* Digit count */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                              {config.digitCount}
                            </span>
                          </td>

                          {/* Last number */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                              {config.lastNumber}
                            </span>
                          </td>

                          {/* Next code */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block', fontFamily: 'ui-monospace, monospace',
                              fontSize: 12.5, fontWeight: 700, padding: '4px 10px', borderRadius: 7,
                              background: '#eff6ff', color: '#1d4ed8', letterSpacing: '0.03em',
                            }}>
                              {getNextCode(config)}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <span className="inline-flex items-center gap-1.5"
                              style={{
                                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                                ...(config.isActive
                                  ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }
                                  : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                              }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: config.isActive ? '#10b981' : '#94a3b8' }} />
                              {config.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          {/* Actions — hover reveal */}
                          <td style={{ padding: '12px 16px' }}>
                            {!READ_ONLY && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: hovered || busy ? 1 : 0, transition: 'opacity 0.15s' }}>
                                <button
                                  onClick={() => openEdit(config)}
                                  disabled={busy}
                                  style={{
                                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                    color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
                                    borderRadius: 7, cursor: busy ? 'not-allowed' : 'pointer',
                                    opacity: busy ? 0.4 : 1, fontFamily: 'inherit', transition: 'background 0.12s',
                                  }}
                                  onMouseEnter={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleReset(config)}
                                  disabled={busy}
                                  style={{
                                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                    color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a',
                                    borderRadius: 7, cursor: busy ? 'not-allowed' : 'pointer',
                                    opacity: busy ? 0.4 : 1, fontFamily: 'inherit', transition: 'background 0.12s',
                                  }}
                                  onMouseEnter={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.background = '#fef3c7'; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fffbeb'; }}
                                >
                                  Reset
                                </button>
                                <button
                                  onClick={() => handleDelete(config)}
                                  disabled={busy}
                                  className="flex items-center gap-1"
                                  style={{
                                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                                    color: '#991b1b', background: '#fff1f2', border: '1px solid #fecdd3',
                                    borderRadius: 7, cursor: busy ? 'not-allowed' : 'pointer',
                                    opacity: busy ? 0.6 : 1, fontFamily: 'inherit', transition: 'background 0.12s',
                                  }}
                                  onMouseEnter={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.background = '#ffe4e6'; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff1f2'; }}
                                >
                                  {busy && (
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  )}
                                  Hapus
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────── */}
      {modalMode && !READ_ONLY && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md overflow-hidden"
            style={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 32px 80px -8px rgba(0,0,0,0.2)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, #7c3aed 0%, #4f46e5 55%, #2563eb 100%)' }} />
            <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {modalMode === 'create' ? 'Tambah Konfigurasi Kode' : 'Edit Konfigurasi Kode'}
                </h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {modalMode === 'create' ? 'Buat format penomoran baru' : 'Ubah prefix atau jumlah digit'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Entity */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                  Entity <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {modalMode === 'create' ? (
                  availableEntities.length === 0 ? (
                    <p style={{ fontSize: 13.5, color: '#64748b' }}>Semua entity sudah dikonfigurasi.</p>
                  ) : (
                    <StyledSelect value={formData.entity} onChange={handleEntityChange}>
                      {availableEntities.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </StyledSelect>
                  )
                ) : (
                  <StyledInput
                    value={CODE_ENTITY_LABELS[editingConfig?.entity ?? ''] ?? editingConfig?.entity ?? ''}
                    disabled
                    style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
                  />
                )}
              </div>

              {/* Prefix */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                  Prefix <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <StyledInput
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: (e.target.value).toUpperCase() })}
                  placeholder="cth. CUST, VEND, PO"
                  maxLength={10}
                />
                <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 5 }}>Huruf kapital (A–Z), maksimal 10 karakter</p>
              </div>

              {/* Digit count */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                  Jumlah Digit <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <StyledInput
                  type="number" min={1} max={10}
                  value={formData.digitCount}
                  onChange={(e) => setFormData({ ...formData, digitCount: parseInt(e.target.value) || 4 })}
                />
                <div className="flex items-center gap-2 mt-2.5">
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Preview:</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700, padding: '3px 10px', borderRadius: 7, background: '#eff6ff', color: '#1d4ed8' }}>
                    {formData.prefix || 'CUST'}-{String(1).padStart(formData.digitCount, '0')}
                  </span>
                </div>
              </div>

              {/* Edit warning */}
              {modalMode === 'edit' && editingConfig && editingConfig.lastNumber > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl"
                  style={{ padding: '10px 13px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p style={{ fontSize: 12.5, color: '#92400e' }}>
                    Counter saat ini <strong>{editingConfig.lastNumber}</strong>. Mengubah prefix tidak mereset counter.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2.5"
              style={{ padding: '16px 20px', marginTop: 20, borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <button
                onClick={closeModal} disabled={saving}
                style={{
                  padding: '8px 16px', fontSize: 13.5, fontWeight: 500,
                  color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: 9, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1, fontFamily: 'inherit', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
              >
                Batal
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                disabled={saving || !formData.prefix || (modalMode === 'create' && !formData.entity)}
                className="flex items-center gap-1.5 font-semibold text-white"
                style={{
                  padding: '8px 18px', fontSize: 13.5, borderRadius: 9, border: 'none',
                  background: saving || !formData.prefix
                    ? 'linear-gradient(135deg, #9b7fe8, #6395d8)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
                  cursor: saving || !formData.prefix ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { if (!saving && formData.prefix) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(124,58,237,0.42)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = saving ? 'none' : '0 4px 14px rgba(124,58,237,0.3)'; }}
              >
                {saving && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {saving ? 'Menyimpan...' : modalMode === 'create' ? 'Simpan Konfigurasi' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}