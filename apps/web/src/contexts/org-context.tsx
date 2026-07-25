'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getDashboardPath } from '@/lib/constants';

interface Organization {
  id: string;
  name: string;
  businessType: string;
  status: string;
}

interface OrgState {
  orgs: Organization[];
  selectedOrg: Organization | null;
  loading: boolean;
  selectOrg: (org: Organization, redirect?: boolean) => void;
  createOrg: (data: { name: string; businessType: string }, redirect?: boolean) => Promise<Organization>;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgState | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshOrgs = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOrgs([]);
      setSelectedOrg(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<Organization[]>('/organizations');
      setOrgs(data);
      const savedId = localStorage.getItem('orgId');
      const match = data.find((o) => o.id === savedId);
      if (match) {
        setSelectedOrg(match);
      } else if (data.length > 0) {
        const first = data[0];
        setSelectedOrg(first);
        localStorage.setItem('orgId', first.id);
      } else {
        setSelectedOrg(null);
        localStorage.removeItem('orgId');
      }
    } catch {
      setOrgs([]);
      setSelectedOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrgs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        refreshOrgs();
      }
    };
    window.addEventListener('storage', handleStorage);
    const t = setTimeout(() => refreshOrgs(), 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearTimeout(t);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectOrg = useCallback((org: Organization, redirect = true) => {
    setSelectedOrg(org);
    localStorage.setItem('orgId', org.id);
    if (redirect) {
      router.push(getDashboardPath(org.businessType));
    }
  }, [router]);

  const createOrg = useCallback(async (data: { name: string; businessType: string }, redirect = true) => {
    const org = await api.post<Organization>('/organizations', data);
    setOrgs((prev) => [...prev, org]);
    setSelectedOrg(org);
    localStorage.setItem('orgId', org.id);
    if (redirect) {
      router.push(getDashboardPath(org.businessType));
    }
    return org;
  }, [router]);

  return (
    <OrgContext.Provider value={{ orgs, selectedOrg, loading, selectOrg, createOrg, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
}
