'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { AuthProvider, setOrgRefreshHandler } from '@/contexts/auth-context';
import { OrgProvider, useOrg } from '@/contexts/org-context';

function OrgBridge() {
  const { refreshOrgs } = useOrg();
  const set = useRef(false);
  useEffect(() => {
    if (!set.current) {
      setOrgRefreshHandler(refreshOrgs);
      set.current = true;
    }
  }, [refreshOrgs]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrgProvider>
        <OrgBridge />
        {children}
      </OrgProvider>
    </AuthProvider>
  );
}
