'use client';

import { useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { Settings, Bell, Trash2 } from 'lucide-react';

export default function CafeSettings() {
  const { selectedOrg } = useOrg();
  const [activeTab, setActiveTab] = useState('profile');

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${activeTab === tab.id ? 'bg-[#22C55E] text-white' : 'text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27]'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Profil du café</h2>
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
            <label className="flex items-center gap-3 p-3 bg-[#1C1C27] rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#22C55E]" />
              <div>
                <div className="text-sm text-[#F8F8F2]">Alerte stock faible</div>
                <div className="text-xs text-[#9CA3AF]">Quand un ingrédient atteint ≤ 5 unités</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#1C1C27] rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-[#22C55E]" />
              <div>
                <div className="text-sm text-[#F8F8F2]">Rappel client fidèle</div>
                <div className="text-xs text-[#9CA3AF]">Message après 30 jours sans visite</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="card-gym border-[#EF4444]/30 space-y-4">
          <h2 className="font-display text-xl text-[#EF4444] tracking-wider">Zone de danger</h2>
          <p className="text-sm text-[#9CA3AF]">Ces actions sont irréversibles.</p>
          <button className="px-4 py-2 bg-[#EF4444] text-white text-sm rounded-lg hover:bg-[#DC2626] transition">Supprimer le café</button>
        </div>
      )}
    </div>
  );
}
