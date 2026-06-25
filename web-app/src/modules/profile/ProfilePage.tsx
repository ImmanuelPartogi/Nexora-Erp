// ============================================
// FILE: web-app/src/modules/profile/ProfilePage.tsx
// User profile, company switcher, and logout (with confirm sheet).
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { useAuth } from '../../shared/hooks/useAuth';
import {
  BuildingIcon,
  ChevronRightIcon,
  LogoutIcon,
  XIcon,
} from '../../shared/components/Icons';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    companies,
    activeCompanyId,
    activeCompanyName,
    setCompany,
    logout,
  } = useAuth();

  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const [logoutSheetOpen, setLogoutSheetOpen] = useState(false);

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader title="Profil" />

      <main className="app-content mx-auto max-w-md space-y-4 px-4">
        {/* User card */}
        <section className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {user?.name}
            </p>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
          </div>
        </section>

        {/* Active company + switch */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => companies.length > 1 && setCompanySheetOpen(true)}
            className="tap-target flex w-full items-center gap-3 px-4 py-3 text-left disabled:opacity-100"
            disabled={companies.length <= 1}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <BuildingIcon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-gray-400">
                Perusahaan Aktif
              </span>
              <span className="block truncate text-sm font-medium text-gray-800">
                {activeCompanyName || '—'}
              </span>
            </span>
            {companies.length > 1 && (
              <ChevronRightIcon size={18} className="text-gray-400" />
            )}
          </button>
        </section>

        {/* Logout */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setLogoutSheetOpen(true)}
            className="tap-target flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 active:bg-gray-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <LogoutIcon size={20} />
            </span>
            <span className="flex-1 text-sm font-medium">Keluar</span>
          </button>
        </section>

        <p className="pt-4 text-center text-xs text-gray-400">
          Nexora ERP Mobile v{APP_VERSION}
        </p>
      </main>

      {/* Switch company sheet */}
      {companySheetOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
          onClick={() => setCompanySheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-4 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Ganti Perusahaan
              </h3>
              <button
                type="button"
                onClick={() => setCompanySheetOpen(false)}
                className="tap-target -mr-2 flex items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
                aria-label="Tutup"
              >
                <XIcon size={20} />
              </button>
            </div>
            <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
              {companies.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCompany(c.id, c.name, c.role);
                      setCompanySheetOpen(false);
                    }}
                    className={`tap-target flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
                      activeCompanyId === c.id
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1">{c.name}</span>
                    {activeCompanyId === c.id && (
                      <span className="text-xs text-brand-600">Aktif</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Logout confirmation sheet */}
      {logoutSheetOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
          onClick={() => setLogoutSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogoutIcon size={24} />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">
              Keluar dari akun?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Anda perlu masuk kembali untuk mengakses aplikasi.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setLogoutSheetOpen(false)}
                className="tap-target flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="tap-target flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white active:bg-red-700"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}