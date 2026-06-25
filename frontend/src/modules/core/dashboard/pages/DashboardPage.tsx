// ============================================
// FILE: frontend/src/modules/core/dashboard/pages/DashboardPage.tsx
// Dashboard: Apps grid (flat) + Stats view with charts
// 🔐 Permission-scoped: cards/widgets render only what the user is authorized to see.
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';
import { reportApi } from '@/shared/api/report.api';
import { DashboardStats } from '@/shared/types';
import { OwnerDashboard } from '../components/OwnerDashboard';

// ── Permission constants ──────────────────────────────────────
const PERMISSIONS = {
  CUSTOMERS:    'data.customer.view',
  VENDORS:      'data.vendor.view',
  PRODUCTS:     'data.product.view',
  ASSETS:       'data.asset.view',
  LOCATIONS:    'data.location.view',
  EMPLOYEES:    'data.employee.view',
  LEASES:       'operations.lease.view',
  WAREHOUSES:   'operations.warehouse.view',
  STOCKS:       'operations.stock.view',
  PRODUCTION:   'operations.production.view',
  TRANSACTIONS: 'operations.transaction.view',
  PURCHASES:    'operations.purchase.view',
  REPORTS:      'reporting.report.view',
  ROLES:        'core.role.view',
  CODE_CONFIG:  'core.code.view',
  AUDIT_LOGS:   'core.audit.view',
} as const;

const hasPerm = (
  perms: string[] | undefined,
  key: keyof typeof PERMISSIONS,
  isOwner = false
) => isOwner || (Array.isArray(perms) && perms.includes(PERMISSIONS[key]));

// ── Module card definitions — flat, no group ─────────────────
const MODULE_CARDS = [
  {
    key: 'customers', label: 'Customer', perm: 'CUSTOMERS' as const,
    path: '/customers',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    light: '#eff6ff', accent: '#2563eb',
    desc: 'Kelola data pelanggan',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: 'vendors', label: 'Vendor', perm: 'VENDORS' as const,
    path: '/vendors',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    light: '#fff7ed', accent: '#ea580c',
    desc: 'Data pemasok & mitra',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    key: 'products', label: 'Produk', perm: 'PRODUCTS' as const,
    path: '/products',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    light: '#f0fdf4', accent: '#16a34a',
    desc: 'Produk, material & jasa',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    key: 'employees', label: 'Karyawan', perm: 'EMPLOYEES' as const,
    path: '/employees',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    light: '#faf5ff', accent: '#9333ea',
    desc: 'SDM & penggajian',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    key: 'assets', label: 'Aset', perm: 'ASSETS' as const,
    path: '/assets',
    gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    light: '#f8fafc', accent: '#475569',
    desc: 'Inventaris aset perusahaan',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    key: 'locations', label: 'Lokasi', perm: 'LOCATIONS' as const,
    path: '/locations',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    light: '#f0fdfa', accent: '#0d9488',
    desc: 'Lokasi & cabang',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    key: 'leases', label: 'Sewa', perm: 'LEASES' as const,
    path: '/leases',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    light: '#eef2ff', accent: '#4f46e5',
    desc: 'Kontrak & sewa unit',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    key: 'warehouses', label: 'Gudang', perm: 'WAREHOUSES' as const,
    path: '/warehouses',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    light: '#fffbeb', accent: '#d97706',
    desc: 'Manajemen gudang',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    key: 'stocks', label: 'Stok', perm: 'STOCKS' as const,
    path: '/stocks',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    light: '#ecfeff', accent: '#0891b2',
    desc: 'Stok masuk & keluar',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
  {
    key: 'production', label: 'Produksi', perm: 'PRODUCTION' as const,
    path: '/production',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    light: '#fef2f2', accent: '#dc2626',
    desc: 'Batch & proses produksi',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'transactions', label: 'Transaksi', perm: 'TRANSACTIONS' as const,
    path: '/transactions',
    gradient: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    light: '#ecfdf5', accent: '#059669',
    desc: 'Pemasukan & pengeluaran',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    key: 'purchases', label: 'Pembelian', perm: 'PURCHASES' as const,
    path: '/purchases',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    light: '#fdf2f8', accent: '#db2777',
    desc: 'Purchase order & PO',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    key: 'reports', label: 'Laporan', perm: 'REPORTS' as const,
    path: '/reports',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    light: '#f5f3ff', accent: '#7c3aed',
    desc: 'Laporan & analitik bisnis',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    key: 'roles', label: 'Role & Izin', perm: 'ROLES' as const,
    path: '/roles',
    gradient: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    light: '#f8fafc', accent: '#334155',
    desc: 'Hak akses pengguna',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    key: 'code-config', label: 'Kode Otomatis', perm: 'CODE_CONFIG' as const,
    path: '/code-config',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    light: '#f9fafb', accent: '#4b5563',
    desc: 'Konfigurasi nomor dokumen',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
];

// ── Helpers ───────────────────────────────────────────────────
function fmtIDR(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

// ── SVG Sparkline ─────────────────────────────────────────────
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  if (!data.length) return null;
  const w = 80;
  const h = height;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h * 0.9;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${h} L${pts.split(' ').map(p => p).join(' L')} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── SVG Donut Chart ───────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = 42, cx = 56, cy = 56, sw = 14;
  let angle = -Math.PI / 2;

  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const startAngle = angle;
    angle += pct * 2 * Math.PI;
    const endAngle = angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { ...seg, pct, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}` };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={112} height={112} viewBox="0 0 112 112">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={sw} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e293b">
          {total.toLocaleString()}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block rounded-sm flex-shrink-0" style={{ width: 8, height: 8, background: s.color }} />
            <span style={{ fontSize: 12, color: '#475569' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginLeft: 'auto', paddingLeft: 12 }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent: string;
  sparkData?: number[];
  icon?: React.ReactNode;
}
function StatCard({ label, value, sub, accent, sparkData, icon }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-3"
      style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</p>
          <p className="font-bold leading-none mt-1.5" style={{ fontSize: 26, color: '#0f172a' }}>{value ?? 0}</p>
          {sub && <p className="text-[11.5px] mt-1" style={{ color: '#94a3b8' }}>{sub}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 flex items-center justify-center rounded-xl w-10 h-10"
            style={{ background: accent + '18', color: accent }}>
            {icon}
          </div>
        )}
      </div>
      {sparkData && sparkData.length > 1 && (
        <Sparkline data={sparkData} color={accent} />
      )}
    </div>
  );
}

// ── Metric Row ────────────────────────────────────────────────
function MetricRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 13, color: '#475569', minWidth: 90 }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', minWidth: 32, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ════════════════════════════════════════════════════════════════
type ViewMode = 'apps' | 'stats';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, companies, permissions } = useAuthStore();
  const { activeCompanyId, clearCompany } = useCompanyStore();

  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  // 🛡️ Owner selalu punya akses penuh ke semua modul
  const isOwner = activeCompany?.role === 'Owner';

  const handleLogout = () => {
    useAuthStore.getState().clearAuth();
    clearCompany();
    navigate('/login');
  };

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try { return (localStorage.getItem('nx_dash_mode') as ViewMode) ?? 'apps'; }
    catch { return 'apps'; }
  });

  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError]   = useState(false);

  useEffect(() => {
    if (viewMode !== 'stats') return;
    setStatsLoading(true);
    setStatsError(false);
    reportApi.dashboard()
      .then(setStats)
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false));
  }, [viewMode, activeCompanyId]);

  const switchMode = (mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem('nx_dash_mode', mode); } catch { /* localStorage may be unavailable in private browsing */ }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat siang' : 'Selamat malam';
  const visibleCards = MODULE_CARDS.filter((card) => hasPerm(permissions, card.perm, isOwner));

  // Mock sparkline data (used only for visual trend hints — values come from real scope)
  const mockStock = [200, 215, 198, 232, 220, stats?.operations?.stockItems ?? 244];

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Dashboard header ─────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-10 py-5">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1 className="font-bold text-slate-900" style={{ fontSize: 18 }}>
                {greeting}, {user?.name?.split(' ')[0] ?? 'Pengguna'} 👋
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {activeCompany
                  ? `${activeCompany.name} · ${activeCompany.role}`
                  : 'NEXORA ERP'}
              </p>
            </div>

            {/* User actions (avatar + logout) */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mode toggle */}
              <div
                className="flex items-center flex-shrink-0 p-1 rounded-lg"
                style={{ background: '#f1f5f9' }}
              >
              {(['apps', 'stats'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all"
                  style={{
                    fontSize: 12,
                    color: viewMode === mode ? '#1e293b' : '#64748b',
                    background: viewMode === mode ? '#ffffff' : 'transparent',
                    boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {mode === 'apps' ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                      Aplikasi
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      </svg>
                      Statistik
                    </>
                  )}
                </button>
              ))}
              </div>

              {/* Logout button — always reachable */}
              <button
                onClick={handleLogout}
                title="Keluar"
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: 36, height: 36,
                  background: '#f1f5f9',
                  color: '#ef4444',
                  border: '1px solid #e2e8f0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-7">

        {/* ══ MODE: APPS — flat grid, no group labels ═══════ */}
        {viewMode === 'apps' && (
          <div>
            {visibleCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {visibleCards.map((card, i) => (
                  <button
                    key={card.key}
                    onClick={() => navigate(card.path)}
                    className="group relative flex flex-col p-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      animationDelay: `${i * 25}ms`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)';
                      (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLElement).style.borderColor = '#e9ecef';
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-3 flex-shrink-0"
                      style={{ background: card.gradient, boxShadow: `0 4px 12px ${card.accent}30` }}
                    >
                      <span style={{ width: 22, height: 22, display: 'block' }}>{card.icon}</span>
                    </div>

                    <p className="font-semibold text-slate-800 leading-tight" style={{ fontSize: 13.5 }}>
                      {card.label}
                    </p>
                    <p className="leading-tight mt-0.5" style={{ fontSize: 11, color: '#94a3b8' }}>
                      {card.desc}
                    </p>

                    {/* Arrow badge on hover */}
                    <div
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#cbd5e1' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div style={{ fontSize: 48 }} className="mb-4">🔒</div>
                <p className="font-semibold text-slate-600">Tidak ada modul yang dapat diakses</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
                  Hubungi administrator untuk mengatur izin akses Anda
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ background: '#ef4444', color: '#ffffff', fontSize: 13 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Keluar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ MODE: STATS — charts + kpis, no quick access ═ */}
        {viewMode === 'stats' && (
          isOwner ? (
            <OwnerDashboard />
          ) : (
          <div className="space-y-5">

            {/* Loading skeletons */}
            {statsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#e9ecef' }} />
                ))}
              </div>
            )}

            {/* Error state */}
            {statsError && !statsLoading && (
              <div className="text-center py-16 bg-white rounded-xl" style={{ border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: 40 }} className="mb-3">⚠️</div>
                <p className="font-semibold text-slate-700">Gagal memuat statistik</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                  Kamu mungkin tidak memiliki izin melihat data ini
                </p>
              </div>
            )}

            {!statsLoading && !statsError && stats && (
              <>
                {/* ── Row 1: Scope-driven KPI Cards ── */}
                {/* 🔐 Only render cards the user is authorized to see */}
                {(() => {
                  const sc = stats.scope;
                  const cards: React.ReactNode[] = [];

                  if (sc.customers) cards.push(
                    <StatCard key="customers" label="Customer" value={stats.summary?.customers ?? 0}
                      sub="Pelanggan aktif" accent="#2563eb"
                      sparkData={[18, 22, 19, 25, 23, stats.summary?.customers ?? 28]}
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} />
                  );
                  if (sc.vendors) cards.push(
                    <StatCard key="vendors" label="Vendor" value={stats.summary?.vendors ?? 0}
                      sub="Pemasok aktif" accent="#ea580c"
                      sparkData={[8, 10, 9, 12, 11, stats.summary?.vendors ?? 14]}
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg>} />
                  );
                  if (sc.products) cards.push(
                    <StatCard key="products" label="Produk" value={stats.summary?.products ?? 0}
                      sub="Produk aktif" accent="#16a34a"
                      sparkData={[55, 60, 58, 65, 63, stats.summary?.products ?? 70]}
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>} />
                  );
                  if (sc.employees) cards.push(
                    <StatCard key="employees" label="Karyawan" value={stats.summary?.employees ?? 0}
                      sub="Karyawan aktif" accent="#9333ea"
                      sparkData={[30, 32, 31, 34, 33, stats.summary?.employees ?? 36]}
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} />
                  );
                  if (sc.assets) cards.push(
                    <StatCard key="assets" label="Aset" value={stats.summary?.assets ?? 0}
                      sub="Inventaris aktif" accent="#475569"
                      sparkData={[10, 12, 11, 14, 13, stats.summary?.assets ?? 15]}
                      icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>} />
                  );

                  {/* 🔒 Financial KPI — only rendered if transactions in scope */}
                  {(() => {
                    if (!stats.financial) return null;
                    cards.push(
                      <StatCard key="revenue" label="Pendapatan Bulan Ini" value={fmtIDR(stats.financial.monthlyRevenue)}
                        sub={`Cashflow: ${fmtIDR(stats.financial.netCashflow)}`} accent="#059669"
                        sparkData={[120, 175, 148, 210, 192, Math.max(1, Math.round((stats.financial.monthlyRevenue || 0) / 1_000_000))]}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                    );
                    return null;
                  })()}

                  return cards.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{cards}</div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-xl" style={{ border: '1px solid #e9ecef' }}>
                      <div style={{ fontSize: 36 }} className="mb-3">📭</div>
                      <p className="font-semibold text-slate-600">Tidak ada statistik tersedia</p>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Modul data belum diaktifkan untuk peran Anda</p>
                    </div>
                  );
                })()}

                {/* ── Row 2: Financial summary (only if authorized) + Donut ── */}
                {stats.financial && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Transaction summary */}
                  <div className="md:col-span-2 bg-white rounded-xl p-5"
                    style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-slate-800" style={{ fontSize: 14 }}>Ringkasan Keuangan</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Aktivitas bulan berjalan</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: '#ecfdf5', color: '#059669' }}>
                        Hari ini: {stats.financial.todayTransactions} trx
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg" style={{ background: '#f0fdf4' }}>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>PENDAPATAN</p>
                        <p className="font-bold mt-1" style={{ fontSize: 16, color: '#059669' }}>{fmtIDR(stats.financial.monthlyRevenue)}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: '#fef2f2' }}>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>PENGELUARAN</p>
                        <p className="font-bold mt-1" style={{ fontSize: 16, color: '#dc2626' }}>{fmtIDR(stats.financial.monthlyExpense)}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: stats.financial.netCashflow >= 0 ? '#eff6ff' : '#fef2f2' }}>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>CASHFLOW</p>
                        <p className="font-bold mt-1" style={{ fontSize: 16, color: stats.financial.netCashflow >= 0 ? '#2563eb' : '#dc2626' }}>{fmtIDR(stats.financial.netCashflow)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Donut chart — data master composition */}
                  <div className="bg-white rounded-xl p-5"
                    style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p className="font-semibold text-slate-800 mb-1" style={{ fontSize: 14 }}>Komposisi Data</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Ringkasan entri master</p>
                    <DonutChart
                      segments={[
                        ...(stats.scope.customers ? [{ label: 'Customer', value: stats.summary?.customers ?? 0, color: '#3b82f6' }] : []),
                        ...(stats.scope.vendors   ? [{ label: 'Vendor',   value: stats.summary?.vendors   ?? 0, color: '#f97316' }] : []),
                        ...(stats.scope.products  ? [{ label: 'Produk',   value: stats.summary?.products  ?? 0, color: '#22c55e' }] : []),
                        ...(stats.scope.employees ? [{ label: 'Karyawan', value: stats.summary?.employees ?? 0, color: '#a855f7' }] : []),
                        ...(stats.scope.assets    ? [{ label: 'Aset',     value: stats.summary?.assets    ?? 0, color: '#64748b' }] : []),
                      ]}
                    />
                  </div>
                </div>
                )}

                {/* ── Row 3: Operations panel (scope-driven) ── */}
                {(() => {
                  const sc = stats.scope;
                  const ops: { label: string; value: number; max: number; color: string }[] = [];
                  if (sc.leases)     ops.push({ label: 'Sewa Aktif',          value: stats.operations?.activeLeases       ?? 0, max: 50,  color: '#6366f1' });
                  if (sc.stock)      ops.push({ label: 'Item Stok',           value: stats.operations?.stockItems         ?? 0, max: 500, color: '#06b6d4' });
                  if (sc.production) ops.push({ label: 'Produksi Bulan Ini',  value: stats.operations?.monthlyProductions ?? 0, max: 100, color: '#ef4444' });
                  if (sc.warehouses) ops.push({ label: 'Gudang',              value: stats.operations?.warehouses         ?? 0, max: 20,  color: '#f59e0b' });
                  if (sc.purchases)  ops.push({ label: 'Pembelian Bulan Ini', value: stats.operations?.monthlyPurchases   ?? 0, max: 80,  color: '#ec4899' });

                  if (ops.length === 0) return null;

                  return (
                    <div className="bg-white rounded-xl p-5"
                      style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <p className="font-semibold text-slate-800 mb-4" style={{ fontSize: 14 }}>Operasional Aktif</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-3">
                        {ops.map((o, i) => (
                          <MetricRow key={i} label={o.label} value={o.value} max={o.max} color={o.color} />
                        ))}
                      </div>
                      {sc.stock && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tren Stok</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>6 bulan</span>
                          </div>
                          <Sparkline data={mockStock} color="#06b6d4" height={36} />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Row 4: Company context card ── */}
                <div
                  className="rounded-xl px-6 py-5 flex items-center justify-between gap-4"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>
                      Perusahaan Aktif
                    </p>
                    <p className="text-white font-bold mt-1" style={{ fontSize: 18 }}>
                      {activeCompany?.name ?? '—'}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {activeCompany?.role ?? ''}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.07)' }}
                  >
                    <svg className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
          )
        )}
      </div>
    </div>
  );
};