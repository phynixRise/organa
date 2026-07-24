'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Account {
  id: string;
  email: string;
  fullName: string | null;
}

interface AuthState {
  token: string | null;
  account: Account | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; fullName: string; businessName: string; businessType: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function decodeToken(token: string): Account {
  const payload = token.split('.')[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  const data = JSON.parse(decoded);
  return { id: data.sub, email: data.email, fullName: data.fullName };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      try {
        setToken(saved);
        setAccount(decodeToken(saved));
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; account: Account }>('/auth/login', { email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setAccount(decodeToken(res.token));
  }, []);

  const signup = useCallback(async (data: { email: string; password: string; fullName: string; businessName: string; businessType: string }) => {
    const res = await api.post<{ token: string; account: Account }>('/auth/signup', data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setAccount(decodeToken(res.token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('orgId');
    setToken(null);
    setAccount(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ token, account, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
