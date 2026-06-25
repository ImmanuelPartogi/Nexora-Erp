// FILE: frontend/src/modules/core/auth/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/shared/api/auth.api';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';
import { registerSchema, RegisterFormData } from '../auth.schema';

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

const SectionDivider = ({ number, label, color }: { number: number; label: string; color: string }) => (
  <div className="flex items-center gap-2.5">
    <div
      className="flex items-center justify-center flex-shrink-0 text-white font-bold"
      style={{ width: 20, height: 20, borderRadius: '50%', background: color, fontSize: 10 }}
    >
      {number}
    </div>
    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>
      {label}
    </span>
    <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
  </div>
);

export const RegisterPage = () => {
  const navigate         = useNavigate();
  const setAuth          = useAuthStore((s) => s.setAuth);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true); setError('');
      const response    = await authApi.register(data);
      const permissions = (response as { permissions?: string[] }).permissions || [];
      setAuth(response.token, response.user, response.companies, permissions);
      if (response.companies.length > 0) {
        setActiveCompany(response.companies[0].id);
        navigate('/dashboard');
      }
    } catch {
      setError('Pendaftaran gagal. Email mungkin sudah digunakan.');
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

      <div className="relative w-full max-w-[420px]">

        {/* Form card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -4px rgba(0,0,0,0.1)',
          }}
        >
          {/* Top accent stripe */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 30%, #0ea5e9 55%, #10b981 100%)',
          }} />

          <div style={{ padding: '28px 32px 32px' }}>
            {/* Logo */}
            <div style={{ marginBottom: 24 }}>
              <NexoraLogo />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Buat akun baru
              </h1>
              <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
                Daftarkan perusahaan Anda ke NEXORA ERP
              </p>
            </div>

            {/* Error */}
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

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Section 1: Akun */}
              <SectionDivider number={1} label="Informasi Akun" color="linear-gradient(135deg, #7c3aed, #2563eb)" />

              {/* Nama */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                  Nama Lengkap
                </label>
                <input
                  {...register('name')}
                  placeholder="Ahmad Dian"
                  disabled={isLoading}
                  style={inputStyle('name', !!errors.name)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.name && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.name.message}</p>}
              </div>

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
                {errors.email && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.email.message}</p>}
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
                    placeholder="Min. 8 karakter"
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {showPw ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.password.message}</p>}
              </div>

              {/* Section 2: Perusahaan */}
              <div style={{ marginTop: 4 }}>
                <SectionDivider number={2} label="Perusahaan" color="linear-gradient(135deg, #10b981, #0d9488)" />
              </div>

              {/* Company name */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>
                  Nama Perusahaan
                </label>
                <input
                  {...register('companyName')}
                  placeholder="PT. Nama Perusahaan"
                  disabled={isLoading}
                  style={inputStyle('companyName', !!errors.companyName)}
                  onFocus={() => setFocusedField('companyName')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.companyName && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 5 }}>{errors.companyName.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full font-semibold text-white rounded-xl transition-all"
                style={{
                  padding: '11px 20px',
                  fontSize: 14,
                  marginTop: 6,
                  background: isLoading
                    ? 'linear-gradient(135deg, #9b7fe8, #6395d8)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                  boxShadow: isLoading ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(124,58,237,0.42)';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)';
                }}
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                )}
                {isLoading ? 'Mendaftarkan...' : 'Buat Akun'}
              </button>
            </form>

            {/* Sign in link */}
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  style={{ fontWeight: 600, color: '#7c3aed', textDecoration: 'none' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#6d28d9')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#7c3aed')}
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', marginTop: 16 }}>
          © {new Date().getFullYear()} NEXORA ERP. All rights reserved.
        </p>
      </div>
    </div>
  );
};