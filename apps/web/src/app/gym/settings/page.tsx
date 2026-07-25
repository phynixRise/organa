'use client';

import { useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { Settings, Bell, Users, Trash2, Save } from 'lucide-react';

const DEFAULT_TEMPLATES = {
  expiryReminder: {
    fr: "Bonjour {name} ! Votre abonnement {plan} expire le {endDate}. Veuillez renouveler pour continuer à bénéficier de nos services.",
    ar: "!مرحبا {name}! اشتراكك {plan} ينتهي في {endDate}. يرجى التجديد للاستمرار في خدماتنا"
  },
  welcome: {
    fr: "Bienvenue chez {gymName} ! Votre abonnement {plan} est actif jusqu'au {endDate}. Merci !",
    ar: "!مرحبا بك في {gymName}! اشتراكك {plan} ساري حتى {endDate}. شكرًا لك"
  },
  paymentConfirmation: {
    fr: "Paiement confirmé : {amount} TND pour {plan}. Merci !",
    ar: "!تم تأكيد الدفع: {amount} تونس Franken لـ {plan}. شكرًا لك"
  },
  frozen: {
    fr: "Votre abonnement a été gelé. Il reprendra le {resumeDate}.",
    ar: "تم تجميد اشتراكك. سيستأنف في {resumeDate}"
  },
};

export default function GymSettings() {
  const { selectedOrg } = useOrg();
  const [activeTab, setActiveTab] = useState('profile');
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [saved, setSaved] = useState(false);

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'staff', label: 'Personnel', icon: Users },
    { id: 'danger', label: 'Zone de danger', icon: Trash2 },
  ];

  function handleSave() {
    if (!selectedOrg) return;
    localStorage.setItem(`gym_templates_${selectedOrg.id}`, JSON.stringify(templates));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">Paramètres</h1>

      {/* Tabs */}
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

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-foreground tracking-wider">Profil de l'entreprise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground mb-1 block">Nom</label><div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">{selectedOrg.name}</div></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Type</label><div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">{selectedOrg.businessType}</div></div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card-gym space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground tracking-wider">Modèles de notifications</h2>
            <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal text-white text-sm rounded-lg hover:bg-brand-teal/90 transition">
              <Save className="w-4 h-4" />{saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Variables disponibles: {'{name}'}, {'{plan}'}, {'{endDate}'}, {'{gymName}'}, {'{amount}'}, {'{resumeDate}'}</p>

          {Object.entries(templates).map(([key, value]) => (
            <div key={key} className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">🇫🇷 Français</label>
                  <textarea value={value.fr} onChange={(e) => setTemplates((p) => ({ ...p, [key]: { ...p[key as keyof typeof p], fr: e.target.value } }))} className="w-full px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground resize-none" rows={3} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">🇸🇦 العربية</label>
                  <textarea value={value.ar} dir="rtl" onChange={(e) => setTemplates((p) => ({ ...p, [key]: { ...p[key as keyof typeof p], ar: e.target.value } }))} className="w-full px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground resize-none" rows={3} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff */}
      {activeTab === 'staff' && (
        <div className="card-gym space-y-4">
          <h2 className="font-display text-xl text-foreground tracking-wider">Personnel</h2>
          <p className="text-sm text-muted-foreground">Gérez les comptes du personnel de votre salle de sport.</p>
          <button onClick={() => alert('Fonctionnalité à venir')} className="px-4 py-2 bg-brand-teal text-white text-sm rounded-lg hover:bg-brand-teal/90 transition">+ Ajouter du personnel</button>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div className="card-gym border-[#EF4444]/30 space-y-4">
          <h2 className="font-display text-xl text-[#EF4444] tracking-wider">Zone de danger</h2>
          <p className="text-sm text-muted-foreground">Ces actions sont irréversibles.</p>
          <button onClick={() => { if (confirm('Supprimer cette entreprise ? Cette action est irréversible.')) { alert('Fonctionnalité à venir'); } }} className="px-4 py-2 bg-[#EF4444] text-white text-sm rounded-lg hover:bg-[#DC2626] transition">Supprimer l'entreprise</button>
        </div>
      )}
    </div>
  );
}
