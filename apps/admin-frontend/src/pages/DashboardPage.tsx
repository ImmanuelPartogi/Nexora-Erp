import React from 'react';
import { useAuth } from '../lib/auth';

export const DashboardPage: React.FC = () => {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            N
          </div>
          <span className="font-semibold tracking-wide text-lg text-white">Nexora Admin Panel</span>
        </div>

        {admin && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-200">{admin.name || admin.email}</div>
              <div className="text-xs text-indigo-400 font-mono font-semibold uppercase">{admin.role}</div>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-md border border-slate-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome, {admin?.name || admin?.email || 'Admin'}! 👋
          </h2>
          <p className="text-slate-400 mb-6">
            You are authenticated with role{' '}
            <span className="text-indigo-400 font-mono font-semibold">{admin?.role}</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-xs uppercase text-slate-500 font-bold mb-1">System Health</div>
              <div className="text-emerald-400 font-semibold text-sm flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Operational (200 OK)</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-xs uppercase text-slate-500 font-bold mb-1">Platform Tenants</div>
              <div className="text-slate-200 font-semibold text-sm">Tenant App Ready</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-xs uppercase text-slate-500 font-bold mb-1">Admin Roles</div>
              <div className="text-slate-200 font-semibold text-sm">SUPERADMIN / SUPPORT / VIEWER</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
