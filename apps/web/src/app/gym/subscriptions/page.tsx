'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { CheckCircle, Clock, XCircle, Plus, Snowflake, Play, AlertTriangle, Calendar } from 'lucide-react';

interface Subscription {
  id: string;
  memberId: string;
  memberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'frozen' | 'expired';
  frozenDays: number;
  frozenAt: string | null;
  amountMillimes: number;
}

const PLANS = [
  { name: '1 Mois', days: 30, price: 80 },
  { name: '3 Mois', days: 90, price: 200 },
  { name: '6 Mois', days: 180, price: 350 },
  { name: '1 An', days: 365, price: 600 },
];

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function getStorageKey(orgId: string): string {
  return `gym_subs_${orgId}`;
}

function loadSubs(orgId: string): Subscription[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getStorageKey(orgId));
  return data ? JSON.parse(data) : [];
}

function saveSubs(orgId: string, subs: Subscription[]) {
  localStorage.setItem(getStorageKey(orgId), JSON.stringify(subs));
}

export default function GymSubscriptions() {
  const { selectedOrg } = useOrg();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberId: '', planIndex: '0' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<any[]>(`/organizations/${selectedOrg.id}/customers`)
      .then((c) => {
        setCustomers(c);
        const saved = loadSubs(selectedOrg.id);
        // Auto-expire
        const now = new Date();
        const updated = saved.map((s) => {
          if (s.status === 'active' && new Date(s.endDate) < now) {
            return { ...s, status: 'expired' as const };
          }
          return s;
        });
        setSubs(updated);
        saveSubs(selectedOrg.id, updated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedOrg]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.memberId) return;
    setError('');
    const plan = PLANS[parseInt(form.planIndex)];
    const customer = customers.find((c: any) => c.id === form.memberId);
    if (!customer) { setError('Membre non trouvé'); return; }

    const now = new Date();
    const sub: Subscription = {
      id: crypto.randomUUID(),
      memberId: form.memberId,
      memberName: customer.name,
      planName: plan.name,
      startDate: now.toISOString(),
      endDate: addDays(now.toISOString(), plan.days),
      status: 'active',
      frozenDays: 0,
      frozenAt: null,
      amountMillimes: plan.price * 1000,
    };

    const updated = [...subs, sub];
    setSubs(updated);
    saveSubs(selectedOrg.id, updated);
    setForm({ memberId: '', planIndex: '0' });
    setShowForm(false);
  }

  function handleFreeze(id: string) {
    if (!selectedOrg) return;
    const updated = subs.map((s) => {
      if (s.id !== id || s.status !== 'active') return s;
      return {
        ...s,
        status: 'frozen' as const,
        frozenDays: s.frozenDays + 7,
        frozenAt: new Date().toISOString(),
        endDate: addDays(s.endDate, 7),
      };
    });
    setSubs(updated);
    saveSubs(selectedOrg.id, updated);
  }

  function handleReactivate(id: string) {
    if (!selectedOrg) return;
    const updated = subs.map((s) => {
      if (s.id !== id || s.status !== 'frozen') return s;
      return { ...s, status: 'active' as const, frozenAt: null };
    });
    setSubs(updated);
    saveSubs(selectedOrg.id, updated);
  }

  function handleCancel(id: string) {
    if (!selectedOrg || !confirm('Annuler cet abonnement ?')) return;
    const updated = subs.map((s) => s.id === id ? { ...s, status: 'expired' as const } : s);
    setSubs(updated);
    saveSubs(selectedOrg.id, updated);
  }

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;

  const stats = {
    active: subs.filter((s) => s.status === 'active').length,
    frozen: subs.filter((s) => s.status === 'frozen').length,
    expired: subs.filter((s) => s.status === 'expired').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground tracking-wider">Abonnements</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-brand-teal/90 transition">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Nouvel abonnement'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-gym text-center">
          <CheckCircle className="w-5 h-5 text-[#22C55E] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Actifs</div>
        </div>
        <div className="card-gym text-center">
          <Snowflake className="w-5 h-5 text-brand-teal dark:text-brand-cyan mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{stats.frozen}</div>
          <div className="text-xs text-muted-foreground">Gelés</div>
        </div>
        <div className="card-gym text-center">
          <XCircle className="w-5 h-5 text-[#EF4444] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{stats.expired}</div>
          <div className="text-xs text-muted-foreground">Expirés</div>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card-gym space-y-3">
          {error && <div className="text-sm text-[#EF4444] bg-[#EF4444]/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.memberId} onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))} className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground" required>
              <option value="">Membre</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.planIndex} onChange={(e) => setForm((p) => ({ ...p, planIndex: e.target.value }))} className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground">
              {PLANS.map((p, i) => <option key={i} value={i}>{p.name} — {p.price} TND</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-teal text-white text-sm rounded-lg hover:bg-brand-teal/90 transition">Créer</button>
        </form>
      )}

      {/* Subscriptions list */}
      <div className="space-y-2">
        {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : subs.length === 0 ? <div className="text-center py-12 text-muted-foreground">Aucun abonnement</div> :
          subs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((s) => {
            const daysLeft = getDaysRemaining(s.endDate);
            const isExpiringSoon = s.status === 'active' && daysLeft >= 0 && daysLeft <= 7;
            return (
              <div key={s.id} className={`card-gym ${isExpiringSoon ? 'border-[#EAB308]/30' : s.status === 'frozen' ? 'border-brand-teal/30 dark:border-brand-cyan/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      s.status === 'active' ? 'bg-[#22C55E]/10' : s.status === 'frozen' ? 'bg-brand-teal/10 dark:bg-brand-cyan/10' : 'bg-[#EF4444]/10'
                    }`}>
                      {s.status === 'active' ? <CheckCircle className="w-5 h-5 text-[#22C55E]" /> :
                       s.status === 'frozen' ? <Snowflake className="w-5 h-5 text-brand-teal dark:text-brand-cyan" /> :
                       <XCircle className="w-5 h-5 text-[#EF4444]" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.memberName}</div>
                      <div className="text-xs text-muted-foreground">{s.planName} — {(s.amountMillimes / 1000).toFixed(3)} TND</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.startDate).toLocaleDateString('fr')} → {new Date(s.endDate).toLocaleDateString('fr')}
                      </div>
                      {s.status === 'active' && (
                        <div className={`text-xs font-mono mt-0.5 ${daysLeft <= 3 ? 'text-[#EF4444]' : daysLeft <= 7 ? 'text-[#EAB308]' : 'text-[#22C55E]'}`}>
                          {daysLeft <= 0 ? 'Expiré' : `${daysLeft}j restants`}
                        </div>
                      )}
                      {s.status === 'frozen' && (
                        <div className="text-xs text-brand-teal dark:text-brand-cyan mt-0.5">Gelé {s.frozenDays}j</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {s.status === 'active' && (
                        <button onClick={() => handleFreeze(s.id)} className="p-1.5 bg-brand-teal/10 text-brand-teal dark:text-brand-cyan rounded-lg hover:bg-brand-teal/20 dark:hover:bg-brand-cyan/20 transition" title="Geler 7 jours">
                          <Snowflake className="w-4 h-4" />
                        </button>
                      )}
                      {s.status === 'frozen' && (
                        <button onClick={() => handleReactivate(s.id)} className="p-1.5 bg-[#22C55E]/10 text-[#22C55E] rounded-lg hover:bg-[#22C55E]/20 transition" title="Réactiver">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {s.status !== 'expired' && (
                        <button onClick={() => handleCancel(s.id)} className="p-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/20 transition" title="Annuler">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
