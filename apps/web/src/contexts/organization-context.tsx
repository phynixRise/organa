'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useOrg } from '@/contexts/org-context';

interface Organization {
  id: string;
  name: string;
  businessType: string;
  status: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  loading: true,
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { selectedOrg, loading } = useOrg();

  return (
    <OrganizationContext.Provider value={{ organization: selectedOrg, loading }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
