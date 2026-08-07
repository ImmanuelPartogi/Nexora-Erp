import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

export interface AdminInfo {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  admin: AdminInfo | null;
  loading: boolean;
  login: (token: string, admin: AdminInfo) => void;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'admin_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentAdmin = async (authToken: string) => {
    try {
      const res = await apiRequest<{ admin: AdminInfo }>('/auth/me', { method: 'GET' }, authToken);
      if (res.success && res.data?.admin) {
        setAdmin(res.data.admin);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentAdmin(token);
    } else {
      setAdmin(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newAdmin: AdminInfo) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  };

  const refreshAdmin = async () => {
    if (token) {
      await fetchCurrentAdmin(token);
    }
  };

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, refreshAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
