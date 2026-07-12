'use client';
import { useState, createContext, useContext, useEffect, ReactNode } from 'react';

interface AuthCtx {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AuthCtx>({
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
  loading: true,
});

export const ADMIN_PASSWORD = 'CYLIX@ADMIN2026';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('cx_admin_auth');
    if (session === 'true') setIsLoggedIn(true);
    setLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('cx_admin_auth', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('cx_admin_auth');
    setIsLoggedIn(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
