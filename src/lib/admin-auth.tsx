'use client';
import { useState, createContext, useContext, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthCtx {
  isLoggedIn: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AuthCtx>({
  isLoggedIn: false,
  admin: null,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('cx_admin_session');
    if (session) {
      try {
        setAdmin(JSON.parse(session));
      } catch {
        sessionStorage.removeItem('cx_admin_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.admin) {
        sessionStorage.setItem('cx_admin_session', JSON.stringify(data.admin));
        const adminToken = data.token || 'CYLIX-ADMIN-2026';
        sessionStorage.setItem('cx_admin_token', adminToken);
        setAdmin(data.admin);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('cx_admin_session');
    sessionStorage.removeItem('cx_admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn: !!admin, admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function getAdminToken(): string {
  return 'CYLIX-ADMIN-2026';
}
