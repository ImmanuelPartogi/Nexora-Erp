// FILE: frontend/src/modules/core/audit/pages/AuditLogPage.tsx
import { useState, useEffect } from 'react';
import { auditApi } from '@/shared/api/audit.api';
import { AuditLog, PaginatedResponse } from '@/shared/types';

const ACTION_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  create:  { label: 'Buat',     dot: '#10b981', bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0' },
  update:  { label: 'Ubah',     dot: '#3b82f6', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  delete:  { label: 'Hapus',    dot: '#ef4444', bg: '#fff1f2', text: '#991b1b', border: '#fecdd3' },
  approve: { label: 'Setujui',  dot: '#7c3aed', bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  cancel:  { label: 'Batalkan', dot: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
};

const MODULE_OPTIONS = [
  { value: '', label: 'Semua Modul' },
  { value: 'customer',    label: 'Customer' },
  { value: 'vendor',      label: 'Vendor' },
  { value: 'product',     label: 'Produk' },
  { value: 'lease',       label: 'Sewa' },
  { value: 'transaction', label: 'Transaksi' },
  { value: 'stock',       label: 'Stok' },
  { value: 'user',        label: 'User' },
  { value: 'role',        label: 'Role' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'Semua Aksi' },
  { value: 'create',  label: 'Buat' },
  { value: 'update',  label: 'Ubah' },
  { value: 'delete',  label: 'Hapus' },
  { value: 'approve', label: 'Setujui' },
  { value: 'cancel',  label: 'Batalkan' },
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  'linear-gradient(135deg,#0ea5e9,#2563eb)',
  'linear-gradient(135deg,#10b981,#0d9488)',
  'linear-gradient(135deg,#f59e0b,#ea580c)',
];
const avatarGrad = (name: string) =>
  AVATAR_GRADIENTS[(name?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length];

// ── Shared input style ────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '7px 12px',
  fontSize: 13,
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  outline: 'none',
  background: '#ffffff',
  color: '#1e293b',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
};

function FilterInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder ?? 'Cari...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, paddingLeft: 34 }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#f59e0b';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#f59e0b';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, valueColor, textColor, bg, border }: {
  label: string; value: number;
  valueColor: string; textColor: string; bg: string; border?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: bg,
        border: border ? `1px solid ${border}` : '1px solid #e9ecef',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: textColor, opacity: 0.65 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: valueColor, marginTop: 6 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: textColor, opacity: 0.5, marginTop: 5 }}>halaman ini</p>
    </div>
  );
}

// ── Table header cell ─────────────────────────────────────────
function TH({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: '10px 16px',
        textAlign: 'left',
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#94a3b8',
        background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </th>
  );
}

// ════════════════════════════════════════════════════════════════
// AUDIT LOG PAGE
// ════════════════════════════════════════════════════════════════
export const AuditLogPage = () => {
  const [search,      setSearch]      = useState('');
  const [module,      setModule]      = useState('');
  const [action,      setAction]      = useState('');
  const [page,        setPage]        = useState(1);
  const [data,        setData]        = useState<PaginatedResponse<AuditLog> | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    auditApi
      .list({ page, limit: 20, search, module: module || undefined, action: action || undefined })
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [page, search, module, action]);

  const total   = data?.pagination.total ?? 0;
  const creates = data?.data.filter((l) => l.action === 'create').length ?? 0;
  const updates = data?.data.filter((l) => l.action === 'update').length ?? 0;
  const deletes = data?.data.filter((l) => l.action === 'delete').length ?? 0;

  const hasActiveFilter = search || module || action;

  const clearFilters = () => {
    setSearch('');
    setModule('');
    setAction('');
    setPage(1);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>
                Audit Log
              </h1>
              <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                Riwayat seluruh aktivitas sistem
              </p>
            </div>

            {/* Live indicator */}
            <div
              className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 0 3px rgba(16,185,129,0.18)' }} />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                {total.toLocaleString('id-ID')} entri
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-4">

        {/* ── Stat cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total — dark card */}
          <div
            className="rounded-xl p-4 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #0e1420 0%, #1e1b4b 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              minHeight: 88,
            }}
          >
            <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
              Total Aktivitas
            </p>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#ffffff' }}>{total}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>halaman ini</p>
            </div>
          </div>

          <StatCard label="Buat Data"  value={creates} valueColor="#065f46" textColor="#065f46" bg="#f0fdf4" border="#bbf7d0" />
          <StatCard label="Ubah Data"  value={updates} valueColor="#1e40af" textColor="#1e40af" bg="#eff6ff" border="#bfdbfe" />
          <StatCard label="Hapus Data" value={deletes} valueColor="#991b1b" textColor="#991b1b" bg="#fff1f2" border="#fecdd3" />
        </div>

        {/* ── Filter bar ─────────────────────────────────── */}
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                Filter & Pencarian
              </span>
              {hasActiveFilter && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: '#fef3c7', color: '#92400e' }}
                >
                  Aktif
                </span>
              )}
            </div>
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 transition-colors"
                style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <FilterInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Cari log, pengguna, modul..."
            />
            <FilterSelect
              value={module}
              onChange={(v) => { setModule(v); setPage(1); }}
              options={MODULE_OPTIONS}
            />
            <FilterSelect
              value={action}
              onChange={(v) => { setAction(v); setPage(1); }}
              options={ACTION_OPTIONS}
            />
          </div>
        </div>

        {/* ── Log table ──────────────────────────────────── */}
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {/* Table header row with count */}
          {!isLoading && data?.data?.length !== undefined && (
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}
            >
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                Menampilkan <strong style={{ color: '#475569' }}>{data.data.length}</strong> dari{' '}
                <strong style={{ color: '#475569' }}>{data.pagination.total}</strong> entri
              </span>
              {isLoading && (
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Memuat...</span>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3.5 animate-pulse"
                    style={{ borderBottom: '1px solid #f8fafc' }}
                  >
                    <div style={{ width: 120, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 100, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 64, height: 20, background: '#f1f5f9', borderRadius: 99 }} />
                    <div style={{ width: 64, height: 20, background: '#f1f5f9', borderRadius: 99 }} />
                    <div style={{ flex: 1, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ width: 80, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-16">
                <div
                  className="flex items-center justify-center mx-auto mb-3"
                  style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <svg className="w-6 h-6" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-600" style={{ fontSize: 14 }}>Tidak ada log ditemukan</p>
                <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>Coba ubah filter pencarian</p>
                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 px-4 py-1.5 rounded-lg font-medium transition-colors"
                    style={{ fontSize: 12.5, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a' }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <TH>Waktu</TH>
                    <TH>Pengguna</TH>
                    <TH>Modul</TH>
                    <TH>Aksi</TH>
                    <TH>Record ID</TH>
                    <TH>Perubahan</TH>
                    <TH>IP Address</TH>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((log) => {
                    const cfg        = ACTION_CONFIG[log.action] ?? { label: log.action, dot: '#94a3b8', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
                    const changeKeys = log.changes ? Object.keys(log.changes) : [];
                    const isExpanded = expandedRow === log.id;

                    return (
                      <>
                        <tr
                          key={log.id}
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          style={{
                            borderBottom: '1px solid #f8fafc',
                            cursor: 'pointer',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isExpanded ? '#fafafa' : 'transparent')}
                        >
                          {/* Timestamp */}
                          <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                            <p style={{ fontSize: 13, color: '#334155', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                              {new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1.5, fontVariantNumeric: 'tabular-nums' }}>
                              {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </td>

                          {/* User */}
                          <td style={{ padding: '11px 16px' }}>
                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center justify-center text-white font-bold flex-shrink-0"
                                style={{
                                  width: 26, height: 26, borderRadius: '50%',
                                  background: avatarGrad(log.userName ?? ''),
                                  fontSize: 10,
                                }}
                              >
                                {(log.userName ?? '?')[0].toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>
                                {log.userName ?? '—'}
                              </span>
                            </div>
                          </td>

                          {/* Module */}
                          <td style={{ padding: '11px 16px' }}>
                            <span
                              className="capitalize"
                              style={{
                                display: 'inline-block',
                                fontSize: 12,
                                fontWeight: 600,
                                padding: '3px 9px',
                                borderRadius: 6,
                                background: '#f1f5f9',
                                color: '#475569',
                                letterSpacing: '0.01em',
                              }}
                            >
                              {log.module}
                            </span>
                          </td>

                          {/* Action badge */}
                          <td style={{ padding: '11px 16px' }}>
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: 99,
                                background: cfg.bg,
                                color: cfg.text,
                                border: `1px solid ${cfg.border}`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span
                                style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}
                              />
                              {cfg.label}
                            </span>
                          </td>

                          {/* Record ID */}
                          <td style={{ padding: '11px 16px' }}>
                            {log.recordId ? (
                              <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#94a3b8', letterSpacing: '0.02em' }}>
                                {log.recordId.substring(0, 8)}…
                              </span>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                            )}
                          </td>

                          {/* Changes summary */}
                          <td style={{ padding: '11px 16px', maxWidth: 180 }}>
                            {changeKeys.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span style={{ fontSize: 12.5, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                                  {changeKeys.slice(0, 2).join(', ')}
                                </span>
                                {changeKeys.length > 2 && (
                                  <span
                                    style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: '#f1f5f9', color: '#64748b', flexShrink: 0 }}
                                  >
                                    +{changeKeys.length - 2}
                                  </span>
                                )}
                                <svg
                                  className="ml-auto flex-shrink-0"
                                  width="12" height="12" fill="none"
                                  viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={2}
                                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                            )}
                          </td>

                          {/* IP */}
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#94a3b8' }}>
                              {log.ipAddress || '—'}
                            </span>
                          </td>
                        </tr>

                        {/* ── Expanded change detail ── */}
                        {isExpanded && changeKeys.length > 0 && (
                          <tr key={`${log.id}-detail`}>
                            <td
                              colSpan={7}
                              style={{ padding: '12px 16px 14px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
                            >
                              <div className="flex items-center gap-2 mb-2.5">
                                <span
                                  style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0, display: 'inline-block' }}
                                />
                                <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                                  Detail Perubahan
                                </p>
                                <span style={{ fontSize: 10.5, color: '#94a3b8' }}>·</span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>{changeKeys.length} field berubah</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {changeKeys.map((k) => (
                                  <div
                                    key={k}
                                    style={{
                                      fontSize: 12.5,
                                      background: '#ffffff',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: 8,
                                      padding: '6px 12px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    }}
                                  >
                                    <span style={{ fontWeight: 600, color: '#475569' }}>{k}:</span>{' '}
                                    <span style={{ color: '#94a3b8', fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
                                      {JSON.stringify((log.changes as Record<string, unknown>)[k]).substring(0, 60)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination ─────────────────────────────────── */}
          {data && data.pagination.totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}
            >
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Halaman{' '}
                <strong style={{ color: '#475569' }}>{data.pagination.page}</strong> dari{' '}
                <strong style={{ color: '#475569' }}>{data.pagination.totalPages}</strong>
                {' '}·{' '}
                <strong style={{ color: '#475569' }}>{data.pagination.total.toLocaleString('id-ID')}</strong> total
              </p>

              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-lg transition-colors"
                  style={{
                    padding: '5px 12px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: page === 1 ? '#cbd5e1' : '#475569',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { if (page !== 1) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Sebelumnya
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(data.pagination.totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  const isCurrent = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 30, height: 30,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 7,
                        fontSize: 12.5, fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? '#ffffff' : '#64748b',
                        background: isCurrent ? '#1e293b' : 'transparent',
                        border: isCurrent ? 'none' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                      onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg transition-colors"
                  style={{
                    padding: '5px 12px',
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: page === data.pagination.totalPages ? '#cbd5e1' : '#475569',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    cursor: page === data.pagination.totalPages ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { if (page !== data.pagination.totalPages) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
                >
                  Selanjutnya
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};