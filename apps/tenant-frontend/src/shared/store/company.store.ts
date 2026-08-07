// src/shared/store/company.store.ts
import { create } from 'zustand';
import { Company } from '../types';

interface CompanyState {
  activeCompanyId: string | null;
  activeCompany: Company | null;
  permissions: string[];
  
  setActiveCompany: (companyId: string, company?: Company) => void;
  setPermissions: (permissions: string[]) => void;
  clearCompany: () => void;
  hasPermission: (permission: string) => boolean;
  initCompany: () => void;
}

// ── Synchronous init from localStorage ────────────────────────
// Prevents race condition where components render with empty state
// before useEffect-based initCompany() runs.
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { activeCompanyId: null, activeCompany: null, permissions: [] };
  }
  const companyId = localStorage.getItem('activeCompanyId');
  const companyStr = localStorage.getItem('activeCompany');
  const permissionsStr = localStorage.getItem('permissions');

  let activeCompany: Company | null = null;
  let permissions: string[] = [];

  if (companyStr) {
    try {
      activeCompany = JSON.parse(companyStr) as Company;
    } catch {
      localStorage.removeItem('activeCompany');
    }
  }

  if (permissionsStr) {
    try {
      permissions = JSON.parse(permissionsStr) as string[];
    } catch {
      localStorage.removeItem('permissions');
    }
  }

  return { activeCompanyId: companyId, activeCompany, permissions };
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
  ...getInitialState(),

  setActiveCompany: (companyId, company) => {
    localStorage.setItem('activeCompanyId', companyId);
    if (company) {
      localStorage.setItem('activeCompany', JSON.stringify(company));
    }
    
    set({
      activeCompanyId: companyId,
      activeCompany: company || null,
    });
  },

  setPermissions: (permissions) => {
    localStorage.setItem('permissions', JSON.stringify(permissions));
    set({ permissions });
  },

  clearCompany: () => {
    localStorage.removeItem('activeCompanyId');
    localStorage.removeItem('activeCompany');
    localStorage.removeItem('permissions');
    
    set({
      activeCompanyId: null,
      activeCompany: null,
      permissions: [],
    });
  },

  hasPermission: (permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  initCompany: () => {
    // Kept for backward compatibility; state is now initialized synchronously.
    const companyId = localStorage.getItem('activeCompanyId');
    const companyStr = localStorage.getItem('activeCompany');
    const permissionsStr = localStorage.getItem('permissions');

    if (companyId) {
      set({ activeCompanyId: companyId });
    }

    if (companyStr) {
      try {
        const company = JSON.parse(companyStr) as Company;
        set({ activeCompany: company });
      } catch {
        localStorage.removeItem('activeCompany');
      }
    }

    if (permissionsStr) {
      try {
        const permissions = JSON.parse(permissionsStr) as string[];
        set({ permissions });
      } catch {
        localStorage.removeItem('permissions');
      }
    }
  },
}));