'use client';

import { useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { Settings, Bell, Users, Trash2 } from 'lucide-react';

export default function GymSettings() {
  const { selectedOrg } = useOrg();
  const [activeTab, setActiveTab] = useState('profile');

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'staff', label: 'Personnel', icon: Users },
    { id: 'danger', label: 'Zone de danger', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Paramètres</h1>
      <div className="flex gap-1 bg-[#111118] border border-white/5 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${activeTab === tab.id ? 'bg-[#F97316] text-white' : 'text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27]'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'profile' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Profil de l'entreprise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-[#9CA3AF] mb-1 block">Nom</label><div className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2]">{selectedOrg.name}</div></div>
            <div><label className="text-xs text-[#9CA3AF] mb-1 block">Type</label><div className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2]">{selectedOrg.businessType}</div></div>
          </div>
        </div>
      )}
      {activeTab === 'notifications' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Notifications</h2>
          <div className="space-y-3">
            {["Rappel d'abonnement", 'Nouveau membre', 'Paiement reçu', 'Abonnement expiré'].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-[#1C1C27] rounded-lg">
                <span className="text-sm text-[#F8F8F2]">{item}</span>
                <div className="w-10 h-5 bg-[#F97316] rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition" /></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'staff' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Personnel</h2>
          <p className="text-sm text-[#9CA3AF]">Gérez les comptes du personnel de votre salle de sport.</p>
          <button className="px-4 py-2 bg-[#F97316] text-white text-sm rounded-lg hover:bg-[#EA580C] transition">+ Ajouter du personnel</button>
        </div>
      )}
      {activeTab === 'danger' && (
        <div className="card-gym border-[#EF4444]/30 space-y-4">
          <h2 className="font-display text-xl text-[#EF4444] tracking-wider">Zone de danger</h2>
          <p className="text-sm text-[#9CA3AF]">Ces actions sont irréversibles.</p>
          <button className="px-4 py-2 bg-[#EF4444] text-white text-sm rounded-lg hover:bg-[#DC2626] transition">Supprimer l'entreprise</button>
        </div>
      )}
    </div>
  );
}
