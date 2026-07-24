'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

interface Organization {
  id: string;
  name: string;
  businessType: string;
  status: string;
}

const GYM_TYPES = ['gym', 'fitness', 'salle_de_sport'];
const BOUTIQUE_TYPES = ['boutique', 'tienda'];
const CAFE_TYPES = ['cafe', 'restaurant'];

function getDashboardPath(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '/gym/dashboard';
  if (BOUTIQUE_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (CAFE_TYPES.includes(businessType)) return '/cafe/dashboard';
  return '/boutique/dashboard';
}

interface OrgState {
  orgs: Organization[];
  selectedOrg: Organization | null;
  loading: boolean;
  selectOrg: (org: Organization, redirect?: boolean) => void;
  createOrg: (data: { name: string; businessType: string }) => Promise<Organization>;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgState | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshOrgs = useCallback(async () => {
    try {
      const data = await api.get<Organization[]>('/organizations');
      setOrgs(data);
      const savedId = localStorage.getItem('orgId');
      const match = data.find((o) => o.id === savedId);
      if (match) {
        setSelectedOrg(match);
      } else if (data.length > 0 && !selectedOrg) {
        setSelectedOrg(data[0]);
        localStorage.setItem('orgId', data[0].id);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    refreshOrgs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectOrg = useCallback((org: Organization, redirect = true) => {
    setSelectedOrg(org);
    localStorage.setItem('orgId', org.id);
    if (redirect) {
      const target = getDashboardPath(org.businessType);
      const isDashboardPath = pathname === '/' || pathname.startsWith('/gym') || pathname.startsWith('/boutique') || pathname.startsWith('/cafe');
      if (isDashboardPath && pathname !== target) {
        router.push(target);
      }
    }
  }, [router, pathname]);

  const createOrg = useCallback(async (data: { name: string; businessType: string }) => {
    const org = await api.post<Organization>('/organizations', data);
    setOrgs((prev) => [...prev, org]);
    setSelectedOrg(org);
    localStorage.setItem('orgId', org.id);
    const target = getDashboardPath(org.businessType);
    router.push(target);
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
