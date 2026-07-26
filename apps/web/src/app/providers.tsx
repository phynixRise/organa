'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, setOrgRefreshHandler } from '@/contexts/auth-context';
import { OrgProvider, useOrg } from '@/contexts/org-context';
import { OrganizationProvider } from '@/contexts/organization-context';
import { ThemeProvider } from '@/components/site/theme-provider';
import { I18nProvider } from '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <I18nProvider>
          <AuthProvider>
          <OrgProvider>
            <OrganizationProvider>
              <OrgBridge />
              {children}
            </OrganizationProvider>
          </OrgProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
