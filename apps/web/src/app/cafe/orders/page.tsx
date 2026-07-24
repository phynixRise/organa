'use client';

import { useOrg } from '@/contexts/org-context';
import { Coffee } from 'lucide-react';

export default function CafePlaceholder() {
  const { selectedOrg } = useOrg();
  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Commandes</h1>
      <div className="card-gym text-center py-12">
        <Coffee className="w-12 h-12 text-[#22C55E] mx-auto mb-4" />
        <p className="text-[#9CA3AF]">Bientôt disponible</p>
      </div>
    </div>
  );
}
