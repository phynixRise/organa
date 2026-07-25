'use client';

import { useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { Settings, Bell, Trash2, Save } from 'lucide-react';

export default function BoutiqueSettings() {
  const { selectedOrg } = useOrg();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Zone de danger', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">Paramètres</h1>

      <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${activeTab === tab.id ? 'bg-brand-teal text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-foreground tracking-wider">Profil de la boutique</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground mb-1 block">Nom</label><div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">{selectedOrg.name}</div></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Type</label><div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">{selectedOrg.businessType}</div></div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-foreground tracking-wider">Notifications</h2>
          <p className="text-sm text-muted-foreground">Configurez les alertes de stock faible et les rappels clients.</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked onChange={() => {}} className="w-4 h-4 rounded accent-brand-teal" />
              <div>
                <div className="text-sm text-foreground">Alerte stock faible</div>
                <div className="text-xs text-muted-foreground">Notification quand un article atteint ≤ 5 unités</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer">
              <input type="checkbox" onChange={() => {}} className="w-4 h-4 rounded accent-brand-teal" />
              <div>
                <div className="text-sm text-foreground">Rappel client</div>
                <div className="text-xs text-muted-foreground">Envoyer un message après 30 jours sans visite</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="card-gym border-[#EF4444]/30 space-y-4">
          <h2 className="font-display text-xl text-[#EF4444] tracking-wider">Zone de danger</h2>
          <p className="text-sm text-muted-foreground">Ces actions sont irréversibles.</p>
          <button onClick={() => { if (confirm('Supprimer cette boutique ? Cette action est irréversible.')) { alert('Fonctionnalité à venir'); } }} className="px-4 py-2 bg-[#EF4444] text-white text-sm rounded-lg hover:bg-[#DC2626] transition">Supprimer la boutique</button>
        </div>
      )}
    </div>
  );
}
