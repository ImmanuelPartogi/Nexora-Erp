// ============================================
// FILE: frontend/src/app/Layout.tsx
// Modern Professional ERP Layout — Refined Edition
// ============================================

import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';

const PERMISSIONS = {
  DASHBOARD:    'core.dashboard.view',
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

// Refined multi-color group themes — professional, muted, elegant
const GROUP_THEMES: Record<string, {
  dotColor: string;
  activeBg: string;
  activeText: string;
  hoverBg: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  'Data Master': {
    dotColor: '#8b5cf6',
    activeBg: 'bg-violet-50',
    activeText: 'text-violet-700 font-semibold',
    hoverBg: 'hover:bg-violet-50/60 hover:text-violet-700',
    pillBg: 'rgba(139,92,246,0.12)',
    pillText: '#c4b5fd',
    pillBorder: 'rgba(139,92,246,0.2)',
    iconColor: '#a78bfa',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
  },
  'Operasional': {
    dotColor: '#0ea5e9',
    activeBg: 'bg-sky-50',
    activeText: 'text-sky-700 font-semibold',
    hoverBg: 'hover:bg-sky-50/60 hover:text-sky-700',
    pillBg: 'rgba(14,165,233,0.12)',
    pillText: '#7dd3fc',
    pillBorder: 'rgba(14,165,233,0.2)',
    iconColor: '#38bdf8',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-700',
  },
  'Laporan': {
    dotColor: '#10b981',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700 font-semibold',
    hoverBg: 'hover:bg-emerald-50/60 hover:text-emerald-700',
    pillBg: 'rgba(16,185,129,0.12)',
    pillText: '#6ee7b7',
    pillBorder: 'rgba(16,185,129,0.2)',
    iconColor: '#34d399',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  'Sistem': {
    dotColor: '#f59e0b',
    activeBg: 'bg-amber-50',
    activeText: 'text-amber-700 font-semibold',
    hoverBg: 'hover:bg-amber-50/60 hover:text-amber-700',
    pillBg: 'rgba(245,158,11,0.12)',
    pillText: '#fcd34d',
    pillBorder: 'rgba(245,158,11,0.2)',
    iconColor: '#fbbf24',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
};

// Icons as components for cleaner reuse
const IconDatabase = () => (
  <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
);

const IconCog = () => (
  <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconChart = () => (
  <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IconMonitor = () => (
  <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
  </svg>
);

const MODULE_GROUPS = [
  {
    label: 'Data Master',
    icon: <IconDatabase />,
    items: [
      { label: 'Customer',  path: '/customers',  perm: 'CUSTOMERS'  as keyof typeof PERMISSIONS },
      { label: 'Vendor',    path: '/vendors',    perm: 'VENDORS'    as keyof typeof PERMISSIONS },
      { label: 'Produk',    path: '/products',   perm: 'PRODUCTS'   as keyof typeof PERMISSIONS },
      { label: 'Aset',      path: '/assets',     perm: 'ASSETS'     as keyof typeof PERMISSIONS },
      { label: 'Lokasi',    path: '/locations',  perm: 'LOCATIONS'  as keyof typeof PERMISSIONS },
      { label: 'Karyawan',  path: '/employees',  perm: 'EMPLOYEES'  as keyof typeof PERMISSIONS },
    ],
  },
  {
    label: 'Operasional',
    icon: <IconCog />,
    items: [
      { label: 'Sewa',      path: '/leases',       perm: 'LEASES'       as keyof typeof PERMISSIONS },
      { label: 'Gudang',    path: '/warehouses',   perm: 'WAREHOUSES'   as keyof typeof PERMISSIONS },
      { label: 'Stok',      path: '/stocks',       perm: 'STOCKS'       as keyof typeof PERMISSIONS },
      { label: 'Produksi',  path: '/production',   perm: 'PRODUCTION'   as keyof typeof PERMISSIONS },
      { label: 'Transaksi', path: '/transactions', perm: 'TRANSACTIONS' as keyof typeof PERMISSIONS },
      // { label: 'Pembelian', path: '/purchases',    perm: 'PURCHASES'    as keyof typeof PERMISSIONS },
    ],
  },
  {
    label: 'Laporan',
    icon: <IconChart />,
    items: [
      { label: 'Laporan', path: '/reports', perm: 'REPORTS' as keyof typeof PERMISSIONS },
    ],
  },
  {
    label: 'Sistem',
    icon: <IconMonitor />,
    items: [
      { label: 'Role & Izin',      path: '/roles',       perm: 'ROLES'       as keyof typeof PERMISSIONS },
      { label: 'Konfigurasi Kode', path: '/code-config', perm: 'CODE_CONFIG' as keyof typeof PERMISSIONS },
      { label: 'Audit Log',        path: '/audit-logs',  perm: 'AUDIT_LOGS'  as keyof typeof PERMISSIONS },
    ],
  },
];

const ROUTE_LABELS: Record<string, { label: string; group: string }> = {
  '/customers':    { label: 'Customer',         group: 'Data Master' },
  '/vendors':      { label: 'Vendor',           group: 'Data Master' },
  '/products':     { label: 'Produk',           group: 'Data Master' },
  '/assets':       { label: 'Aset',             group: 'Data Master' },
  '/locations':    { label: 'Lokasi',           group: 'Data Master' },
  '/employees':    { label: 'Karyawan',         group: 'Data Master' },
  '/leases':       { label: 'Sewa',             group: 'Operasional' },
  '/warehouses':   { label: 'Gudang',           group: 'Operasional' },
  '/stocks':       { label: 'Stok',             group: 'Operasional' },
  '/production':   { label: 'Produksi',         group: 'Operasional' },
  '/transactions': { label: 'Transaksi',        group: 'Operasional' },
  '/purchases':    { label: 'Pembelian',        group: 'Operasional' },
  '/reports':      { label: 'Laporan',          group: 'Laporan'     },
  '/roles':        { label: 'Role & Izin',      group: 'Sistem'      },
  '/code-config':  { label: 'Konfigurasi Kode', group: 'Sistem'      },
  '/audit-logs':   { label: 'Audit Log',        group: 'Sistem'      },
};

const hasPerm = (
  permissions: string[] | undefined,
  key: keyof typeof PERMISSIONS,
  isOwner = false
) => isOwner || (Array.isArray(permissions) && permissions.includes(PERMISSIONS[key]));

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
];
const getAvatarGradient = (name: string) =>
  AVATAR_GRADIENTS[(name?.charCodeAt(0) ?? 85) % AVATAR_GRADIENTS.length];

// ── NavDropdown ────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  groupLabel: string;
  icon: ReactNode;
  children: ReactNode;
  isActive?: boolean;
}

function NavDropdown({ label, groupLabel, icon, children, isActive }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const theme = GROUP_THEMES[groupLabel];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isHighlighted = isActive || open;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 select-none whitespace-nowrap"
        style={{
          color: isHighlighted ? theme.pillText : 'rgba(148,163,184,0.9)',
          background: isHighlighted ? theme.pillBg : 'transparent',
          border: `1px solid ${isHighlighted ? theme.pillBorder : 'transparent'}`,
        }}
        onMouseEnter={(e) => {
          if (!isHighlighted) {
            e.currentTarget.style.color = '#e2e8f0';
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isHighlighted) {
            e.currentTarget.style.color = 'rgba(148,163,184,0.9)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <span style={{ color: isHighlighted ? theme.iconColor : 'currentColor', opacity: isHighlighted ? 1 : 0.6 }}>
          {icon}
        </span>
        {label}
        <svg
          className="w-[10px] h-[10px] flex-shrink-0 transition-transform duration-200"
          style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-56 overflow-hidden z-50"
          style={{
            background: '#ffffff',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 12px 40px -4px rgba(0,0,0,0.14)',
            animation: 'dropIn 0.16s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Group header strip */}
          <div
            className="flex items-center gap-2 px-3.5 py-2.5"
            style={{
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(to right, #f8fafc, #f8fafc)',
            }}
          >
            <span style={{ color: theme.dotColor }}>{icon}</span>
            <span
              className="text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{ color: '#94a3b8' }}
            >
              {groupLabel}
            </span>
          </div>

          <div className="p-1.5" onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LAYOUT COMPONENT
// ════════════════════════════════════════════════════════════════
interface LayoutProps { children: ReactNode }

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, companies, permissions } = useAuthStore();
  const { activeCompanyId, setActiveCompany, clearCompany } = useCompanyStore();

  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  // 🛡️ Owner selalu punya akses penuh ke semua modul
  const isOwner = activeCompany?.role === 'Owner';
  const isDashboard = location.pathname === '/dashboard';
  const routeBase = '/' + location.pathname.split('/')[1];
  const routeInfo = ROUTE_LABELS[routeBase];
  const currentGroupTheme = routeInfo ? GROUP_THEMES[routeInfo.group] : null;
  const showNavbar = !isDashboard || location.pathname.includes('/stats');

  const handleLogout = () => {
    useAuthStore.getState().clearAuth();
    clearCompany();
    navigate('/login');
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const avatarGradient = getAvatarGradient(user?.name ?? '');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body, .nexora-layout {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .nexora-nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 400;
          text-decoration: none;
          color: #475569;
          transition: background 0.12s ease, color 0.12s ease;
          position: relative;
          cursor: pointer;
        }
        .nexora-nav-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .nexora-nav-item.active {
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
        }
        .nexora-nav-item .item-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: transform 0.12s ease;
        }
        .nexora-nav-item:hover .item-dot,
        .nexora-nav-item.active .item-dot {
          transform: scale(1.5);
        }
        .nexora-nav-item .check-icon {
          margin-left: auto;
          opacity: 0.4;
        }

        /* Scrollbar refinement */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div
        className="nexora-layout min-h-screen flex flex-col"
        style={{ background: '#f4f6f9' }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        {showNavbar && (
          <header
            className="sticky top-0 z-40"
            style={{
              background: 'linear-gradient(180deg, #0e1420 0%, #111827 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            {/* Top accent line — subtle gradient */}
            <div
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 30%, #0ea5e9 55%, #10b981 75%, #f59e0b 90%, transparent 100%)',
                opacity: 0.7,
              }}
            />

            <div
              className="flex items-center gap-3 px-5"
              style={{ height: '50px' }}
            >
              {/* ── Brand ── */}
              <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 group mr-2">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                    boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 4px 12px rgba(124,58,237,0.3)',
                  }}
                >
                  <svg width={15} height={15} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span
                    className="font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors duration-150"
                    style={{ fontSize: 14, letterSpacing: '-0.01em' }}
                  >
                    NEXORA
                  </span>
                  <span
                    className="text-slate-600 font-semibold tracking-widest uppercase"
                    style={{ fontSize: 8.5, letterSpacing: '0.2em' }}
                  >
                    ERP
                  </span>
                </div>
              </Link>

              {/* ── Divider ── */}
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

              {/* ── Breadcrumb ── */}
              {!isDashboard && routeInfo && (
                <div
                  key={routeBase}
                  className="hidden sm:flex items-center gap-1.5 flex-shrink-0"
                  style={{ animation: 'slideRight 0.2s ease' }}
                >
                  <span style={{ fontSize: 11.5, color: currentGroupTheme?.iconColor ?? '#64748b', fontWeight: 500 }}>
                    {routeInfo.group}
                  </span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#334155' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full flex-shrink-0"
                      style={{ width: 7, height: 7, background: currentGroupTheme?.dotColor ?? '#94a3b8' }}
                    />
                    <span className="text-white font-semibold" style={{ fontSize: 13 }}>
                      {routeInfo.label}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Module Navigation ── */}
              <nav className="hidden md:flex items-center gap-0.5 ml-2">
                {MODULE_GROUPS.map((group) => {
                  const visibleItems = group.items.filter((item) => hasPerm(permissions, item.perm, isOwner));
                  if (visibleItems.length === 0) return null;
                  const isGroupActive = visibleItems.some((item) => location.pathname.startsWith(item.path));
                  const theme = GROUP_THEMES[group.label];

                  return (
                    <NavDropdown
                      key={group.label}
                      label={group.label}
                      groupLabel={group.label}
                      icon={group.icon}
                      isActive={isGroupActive}
                    >
                      {visibleItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`nexora-nav-item ${isActive ? 'active' : ''}`}
                          >
                            <span
                              className="item-dot"
                              style={{ background: theme.dotColor, opacity: isActive ? 1 : 0.35 }}
                            />
                            {item.label}
                            {isActive && (
                              <svg className="check-icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: theme.dotColor }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </Link>
                        );
                      })}
                    </NavDropdown>
                  );
                })}
              </nav>

              {/* ── Right Controls ── */}
              <div className="ml-auto flex items-center gap-2">

                {/* Company Selector */}
                {companies.length > 0 && (
                  <div
                    className="hidden sm:flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 18, height: 18, borderRadius: 5,
                        background: 'linear-gradient(135deg, #10b981, #0d9488)',
                      }}
                    >
                      <svg width={9} height={9} className="text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {companies.length === 1 ? (
                      <span className="text-slate-300 font-medium max-w-[130px] truncate" style={{ fontSize: 12 }}>
                        {activeCompany?.name ?? companies[0].name}
                      </span>
                    ) : (
                      <select
                        aria-label="Perusahaan aktif"
                        value={activeCompanyId || ''}
                        onChange={(e) => setActiveCompany(e.target.value)}
                        className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer max-w-[130px]"
                        style={{ fontSize: 12 }}
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Notification Bell */}
                <button
                  type="button"
                  aria-label="Notifikasi"
                  className="flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    width: 32, height: 32,
                    color: 'rgba(100,116,139,0.9)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(100,116,139,0.9)';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </button>

                {/* Vertical divider */}
                <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-150"
                    style={{
                      background: userMenuOpen ? 'rgba(255,255,255,0.09)' : 'transparent',
                      border: `1px solid ${userMenuOpen ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!userMenuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!userMenuOpen) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{
                        width: 28, height: 28,
                        borderRadius: '50%',
                        background: avatarGradient,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.1)',
                        fontSize: 11,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {initials}
                    </div>
                    <div className="hidden sm:flex flex-col leading-none text-left">
                      <span className="text-slate-200 font-medium max-w-[100px] truncate" style={{ fontSize: 12.5 }}>
                        {user?.name}
                      </span>
                      {activeCompany && (
                        <span className="text-slate-500 max-w-[100px] truncate" style={{ fontSize: 10.5, marginTop: 1.5 }}>
                          {activeCompany.role}
                        </span>
                      )}
                    </div>
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: '#475569', marginLeft: 2 }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 overflow-hidden z-50"
                      style={{
                        width: 230,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 16px 48px -4px rgba(0,0,0,0.16)',
                        animation: 'menuSlide 0.15s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >
                      {/* Dark header section */}
                      <div
                        className="flex items-center gap-3 px-4 py-3.5"
                        style={{
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{
                            width: 36, height: 36,
                            borderRadius: 10,
                            background: avatarGradient,
                            fontSize: 13,
                          }}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate" style={{ fontSize: 13 }}>
                            {user?.name}
                          </p>
                          <p className="text-slate-400 truncate" style={{ fontSize: 11 }}>
                            {user?.email}
                          </p>
                          {activeCompany && (
                            <p className="truncate" style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                              {activeCompany.name} · {activeCompany.role}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors text-slate-700 hover:bg-slate-50"
                          style={{ fontSize: 13.5 }}
                        >
                          <div className="flex items-center justify-center rounded-md bg-slate-100 flex-shrink-0"
                            style={{ width: 26, height: 26 }}>
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                          </div>
                          Dashboard
                        </Link>

                        <div style={{ height: 1, background: '#f1f5f9', margin: '4px 8px' }} />

                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors text-red-500 hover:bg-red-50"
                          style={{ fontSize: 13.5 }}
                        >
                          <div className="flex items-center justify-center rounded-md bg-red-50 flex-shrink-0"
                            style={{ width: 26, height: 26 }}>
                            <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                          </div>
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* ── Page Content ─────────────────────────────────── */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
};