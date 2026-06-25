// ============================================
// FILE: web-app/src/modules/auth/LoginPage.tsx
// Full-screen mobile login with RHF + Zod validation.
// If user has >1 company, shows a company picker before redirect.
// ============================================
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { authApi } from './auth.api';
import { useAuth } from '../../shared/hooks/useAuth';
import { apiClient } from '../../shared/api/client';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { BuildingIcon } from '../../shared/components/Icons';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, setCompany, isAuthenticated, companies } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'company'>('login');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  // If already authenticated, bounce to dashboard.
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(values.email, values.password);
      setAuth({
        token: res.token,
        user: res.user,
        permissions: res.permissions,
        companies: res.companies,
      });
      // If more than one company, let the user pick; otherwise go straight in.
      if (res.companies.length > 1) {
        setStep('company');
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setServerError(apiClient.getMessage(err));
    }
  };

  // ---------- Company picker step ----------
  if (step === 'company') {
    return (
      <div className="flex min-h-screen flex-col bg-brand-600 px-6 py-10 text-white">
        <div className="mb-8 mt-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <BuildingIcon size={28} />
          </div>
          <h1 className="text-xl font-semibold">Pilih Perusahaan</h1>
          <p className="mt-1 text-sm text-white/80">
            Pilih perusahaan aktif untuk sesi ini.
          </p>
        </div>

        <ul className="space-y-3">
          {companies.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setCompany(c.id, c.name, c.role);
                  navigate('/dashboard', { replace: true });
                }}
                className="tap-target flex w-full items-center gap-3 rounded-2xl bg-white/15 px-4 py-4 text-left backdrop-blur active:bg-white/25"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{c.name}</span>
                  <span className="block text-xs text-white/70 capitalize">
                    {c.role}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ---------- Login form step ----------
  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-10">
      <div className="mb-10 mt-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
          N
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nexora ERP</h1>
        <p className="mt-1 text-sm text-gray-500">
          Masuk untuk mengelola bisnis Anda
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nama@perusahaan.com"
            {...register('email')}
            className="tap-target w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className="tap-target w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-base font-semibold text-white active:bg-brand-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size={18} className="border-white/40 border-t-white" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      <p className="mt-auto pt-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Nexora ERP
      </p>
    </div>
  );
}