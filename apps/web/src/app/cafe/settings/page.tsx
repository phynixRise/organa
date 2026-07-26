'use client';

import { useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { Settings, Bell, Trash2, Coffee } from 'lucide-react';

export default function CafeSettings() {
  const { selectedOrg } = useOrg();
  const [activeTab, setActiveTab] = useState('profile');

  if (!selectedOrg) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Sélectionnez un café</div>;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Zone de danger', icon: Trash2 },
  ];

  return (
    <div className="cafe-theme max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-3">
        <Settings className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        Paramètres
      </h1>

      <div className="flex gap-1 bg-stone-100 dark:bg-stone-700 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-white dark:bg-stone-600 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-100'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="card-cafe space-y-4">
          <h2 className="font-display text-xl font-bold text-stone-800 dark:text-stone-100">Profil du café</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Nom</label>
              <div className="px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100">{selectedOrg.name}</div>
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Type</label>
              <div className="px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100">{selectedOrg.businessType}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card-cafe space-y-4">
          <h2 className="font-display text-xl font-bold text-stone-800 dark:text-stone-100">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-700 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked onChange={() => {}} className="w-4 h-4 rounded accent-amber-600" />
              <div>
                <div className="text-sm text-stone-800 dark:text-stone-100">Alerte stock faible</div>
                <div className="text-xs text-stone-400">Quand un ingrédient atteint ≤ 5 unités</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-700 rounded-xl cursor-pointer">
              <input type="checkbox" onChange={() => {}} className="w-4 h-4 rounded accent-amber-600" />
              <div>
                <div className="text-sm text-stone-800 dark:text-stone-100">Rappel client fidèle</div>
                <div className="text-xs text-stone-400">Message après 30 jours sans visite</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="card-cafe border-red-200 dark:border-red-800/50 space-y-4">
          <h2 className="font-display text-xl font-bold text-red-500">Zone de danger</h2>
          <p className="text-sm text-stone-400">Ces actions sont irréversibles.</p>
          <button className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition"
            onClick={() => { if (confirm('Supprimer ce café ? Cette action est irréversible.')) { alert('Fonctionnalité à venir'); } }}>
            Supprimer le café
          </button>
        </div>
      )}
    </div>
  );
}
