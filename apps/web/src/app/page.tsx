'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';

const GYM_TYPES = ['gym', 'fitness', 'salle_de_sport'];
const BOUTIQUE_TYPES = ['boutique', 'tienda'];
const CAFE_TYPES = ['cafe', 'restaurant'];

function getDashboardPath(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '/gym/dashboard';
  if (BOUTIQUE_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (CAFE_TYPES.includes(businessType)) return '/cafe/dashboard';
  return '/boutique/dashboard';
}

export default function RootPage() {
  const { account, loading: authLoading } = useAuth();
  const { selectedOrg, loading: orgLoading } = useOrg();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || orgLoading) return;

    if (!account) {
      router.replace('/login');
      return;
    }

    if (selectedOrg) {
      router.replace(getDashboardPath(selectedOrg.businessType));
    } else {
      router.replace('/login');
    }
  }, [account, authLoading, selectedOrg, orgLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
      <div className="text-[#9CA3AF] font-body">Chargement...</div>
    </div>
  );
}
