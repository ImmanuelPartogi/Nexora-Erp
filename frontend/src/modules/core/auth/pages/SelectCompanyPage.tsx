// FILE: frontend/src/modules/core/auth/pages/SelectCompanyPage.tsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';

const GRADS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #0ea5e9, #2563eb)',
  'linear-gradient(135deg, #10b981, #0d9488)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];
const getGrad = (name: string) => GRADS[(name?.charCodeAt(0) ?? 0) % GRADS.length];

// ── Shared components ─────────────────────────────────────────
const NexoraLogo = () => (
  <div className="flex items-center gap-2.5">
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
        boxShadow: '0 0 0 1px rgba(124,58,237,0.35), 0 4px 12px rgba(124,58,237,0.3)',
      }}
    >
      <svg width={15} height={15} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a' }}>NEXORA</span>
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#94a3b8' }}>ERP</span>
    </div>
  </div>
);

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen flex items-center justify-center p-6 relative"
    style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}
  >
    {/* Background grid */}
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.4,
      }}
    />
    <div className="relative w-full max-w-[400px]">
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Top accent */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 28%, #0ea5e9 52%, #10b981 100%)',
        }} />
        <div style={{ padding: '28px 28px 32px' }}>
          {children}
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', marginTop: 16 }}>
        © {new Date().getFullYear()} NEXORA ERP. All rights reserved.
      </p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// SELECT COMPANY PAGE
// ════════════════════════════════════════════════════════════════
export const SelectCompanyPage = () => {
  const navigate               = useNavigate();
  const { companies, clearAuth, user } = useAuthStore();
  const setActiveCompany       = useCompanyStore((s) => s.setActiveCompany);

  const handleSelect = (id: string) => { setActiveCompany(id); navigate('/dashboard'); };
  const handleLogout = () => { clearAuth(); navigate('/login'); };

  // ── No access state ───────────────────────────────────────────
  if (companies.length === 0) {
    return (
      <PageShell>
        <div style={{ marginBottom: 24 }}>
          <NexoraLogo />
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{
              width: 52, height: 52, borderRadius: 14,
              background: '#fff1f2',
              border: '1px solid #fecdd3',
            }}
          >
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Tidak ada akses perusahaan
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
            Hubungi administrator untuk mengatur akses Anda.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: '9px 20px',
              fontSize: 13.5,
              fontWeight: 600,
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
          >
            Kembali ke Login
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Normal company selection ───────────────────────────────────
  return (
    <PageShell>
      {/* Logo */}
      <div style={{ marginBottom: 22 }}>
        <NexoraLogo />
      </div>

      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Pilih Perusahaan
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
          Halo,{' '}
          <strong style={{ color: '#334155', fontWeight: 600 }}>{user?.name}</strong>!
          Pilih perusahaan untuk melanjutkan.
        </p>
      </div>

      {/* Divider with count */}
      <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        <span
          style={{
            fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#94a3b8',
            padding: '0 4px',
          }}
        >
          {companies.length} perusahaan tersedia
        </span>
        <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
      </div>

      {/* Company list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {companies.map((company, i) => (
          <button
            key={company.id}
            onClick={() => handleSelect(company.id)}
            className="group w-full text-left flex items-center gap-3.5 rounded-xl transition-all duration-150"
            style={{
              padding: '12px 14px',
              background: '#ffffff',
              border: '1px solid #e9ecef',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              animationDelay: `${i * 40}ms`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#c4b5fd';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.1)';
              (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e9ecef';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
            }}
          >
            {/* Avatar */}
            <div
              className="flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{
                width: 40, height: 40, borderRadius: 11,
                background: getGrad(company.name ?? ''),
                fontSize: 15,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              {company.name?.[0]?.toUpperCase() ?? '?'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {company.name}
              </p>
              <div className="flex items-center gap-1.5" style={{ marginTop: 2 }}>
                <span
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block' }}
                />
                <p style={{ fontSize: 12, color: '#64748b' }}>{company.role}</p>
              </div>
            </div>

            {/* Arrow */}
            <div
              className="flex items-center justify-center flex-shrink-0 rounded-lg transition-all"
              style={{
                width: 28, height: 28,
                background: '#f8fafc',
                color: '#cbd5e1',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{ fontSize: 13, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Keluar dari akun
        </button>
      </div>
    </PageShell>
  );
};