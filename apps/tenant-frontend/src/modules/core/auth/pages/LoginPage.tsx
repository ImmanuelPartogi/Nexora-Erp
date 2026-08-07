// FILE: frontend/src/modules/core/auth/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/shared/api/auth.api';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';
import { loginSchema, LoginFormData } from '../auth.schema';

const FEATURES = [
  {
    color: '#7c3aed',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    text: 'Manajemen data pelanggan & vendor terpusat',
  },
  {
    color: '#0ea5e9',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    text: 'Kontrol stok & produksi secara real-time',
  },
  {
    color: '#10b981',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    text: 'Laporan kustom & analitik bisnis mendalam',
  },
  {
    color: '#f59e0b',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    text: 'Kontrol akses berbasis peran & audit log',
  },
];

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const NexoraLogo = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex items-center gap-2.5 flex-shrink-0">
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
      <span
        style={{
          fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
          color: dark ? '#ffffff' : '#0f172a',
        }}
      >NEXORA</span>
      <span
        style={{
          fontSize: 8.5, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.3)' : '#94a3b8',
        }}
      >ERP</span>
    </div>
  </div>
);

export const LoginPage = () => {
  const navigate         = useNavigate();
  const setAuth          = useAuthStore((s) => s.setAuth);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true); setError('');
      const response    = await authApi.login(data);
      const permissions = (response as { permissions?: string[] }).permissions || [];
      setAuth(response.token, response.user, response.companies, permissions);
      if (response.companies.length > 0) {
        setActiveCompany(response.companies[0].id);
        navigate('/dashboard');
      } else {
        setError('Tidak ada akses perusahaan.');
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field: string, hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 14px',
    fontSize: 13.5,
    border: `1px solid ${hasError ? '#fca5a5' : focusedField === field ? '#7c3aed' : '#e2e8f0'}`,
    borderRadius: 10,
    outline: 'none',
    background: hasError ? '#fff8f8' : '#ffffff',
    color: '#1e293b',
    boxShadow: focusedField === field && !hasError ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  });

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}
    >
      {/* ── Left dark panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0c1228 0%, #111827 50%, #1a1040 100%)' }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 28%, #0ea5e9 52%, #10b981 73%, #f59e0b 90%, transparent 100%)',
          opacity: 0.7,
        }} />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute top-1/4 -left-20 rounded-full"
          style={{ width: 320, height: 320, background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', pointerEvents: 'none' }}
        />
        <div
          className="absolute bottom-1/3 right-0 rounded-full"
          style={{ width: 240, height: 240, background: 'radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)', pointerEvents: 'none' }}
        />

        {/* Brand */}
        <div className="relative">
          <NexoraLogo dark />
        </div>

        {/* Hero copy */}
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 500 }}>Sistem ERP Terintegrasi</span>
          </div>

          <h2
            className="text-white font-bold leading-tight"
            style={{ fontSize: 36, letterSpacing: '-0.02em' }}
          >
            Kelola bisnis Anda<br />
            <span style={{
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              lebih efisien.
            </span>
          </h2>

          <p style={{ fontSize: 14, color: '#64748b', marginTop: 14, lineHeight: 1.65, maxWidth: 340 }}>
            Satu platform untuk manajemen pelanggan, operasional, keuangan, dan laporan bisnis perusahaan Anda.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}28`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <span style={{ fontSize: 13.5, color: '#94a3b8' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: '#334155', position: 'relative' }}>
          © {new Date().getFullYear()} NEXORA ERP. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6"
        style={{ background: '#f4f6f9' }}
      >
        {/* Subtle grid */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.4,
          }}
        />

        <div className="relative w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <NexoraLogo />
          </div>

          {/* Form card */}
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
              background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 50%, #0ea5e9 100%)',
            }} />

            <div style={{ padding: '32px 32px 28px' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Masuk ke akun Anda
                </h1>
                <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 5 }}>
                  Masukkan kredensial untuk melanjutkan
                </p>
              </div>

              {/* Error alert */}
              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-xl mb-5"
                  style={{ padding: '11px 14px', background: '#fff1f2', border: '1px solid #fecdd3' }}
                >
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#be123c' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="nama@perusahaan.com"
                    disabled={isLoading}
                    style={inputStyle('email', !!errors.email)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.email && (
                    <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isLoading}
                      style={{ ...inputStyle('password', !!errors.password), paddingRight: 42 }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: showPw ? '#7c3aed' : '#94a3b8' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#7c3aed')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = showPw ? '#7c3aed' : '#94a3b8')}
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full font-semibold text-white rounded-xl transition-all"
                  style={{
                    padding: '11px 20px',
                    fontSize: 14,
                    background: isLoading
                      ? 'linear-gradient(135deg, #9b7fe8, #6395d8)'
                      : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(124,58,237,0.45)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)';
                  }}
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  )}
                  {isLoading ? 'Memverifikasi...' : 'Masuk'}
                </button>
              </form>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#94a3b8' }}>
                  Belum punya akun?{' '}
                  <Link
                    to="/register"
                    style={{ fontWeight: 600, color: '#7c3aed', textDecoration: 'none' }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#6d28d9')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#7c3aed')}
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};