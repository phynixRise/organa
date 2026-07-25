'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { AuthProvider, setOrgRefreshHandler } from '@/contexts/auth-context';
import { OrgProvider, useOrg } from '@/contexts/org-context';
import { ThemeProvider } from '@/components/site/theme-provider';

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
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <OrgProvider>
          <OrgBridge />
          {children}
        </OrgProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
