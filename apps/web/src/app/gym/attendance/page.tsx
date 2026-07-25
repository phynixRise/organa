'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Search, UserCheck, Clock } from 'lucide-react';

export default function GymAttendance() {
  const { selectedOrg } = useOrg();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/organizations/${selectedOrg.id}/appointments`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
    ]).then(([a, c]) => { setAppointments(a.reverse()); setCustomers(c); setLoading(false); });
  }, [selectedOrg]);

  async function handleCheckin(customerId: string) {
    if (!selectedOrg) return;
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 3600000);
      await api.post(`/organizations/${selectedOrg.id}/appointments`, { customerId, startTime: now.toISOString(), endTime: end.toISOString() });
      const customer = customers.find((c: any) => c.id === customerId);
      setMessage({ type: 'success', text: `${customer?.name || 'Membre'} enregistré !` });
      setSearch('');
      const updated = await api.get<any[]>(`/organizations/${selectedOrg.id}/appointments`).catch(() => []);
      setAppointments(updated.reverse());
    } catch (err: any) { setMessage({ type: 'error', text: err?.message || 'Erreur' }); }
    setTimeout(() => setMessage(null), 3000);
  }

  const filtered = customers.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));
  const today = new Date().toDateString();
  const todayCheckins = appointments.filter((a: any) => new Date(a.createdAt).toDateString() === today);

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">Présence</h1>
      <div className="card-gym">
        <div className="flex items-center gap-2 mb-4"><UserCheck className="w-5 h-5 text-brand-teal" /><h2 className="font-display text-xl text-foreground tracking-wider">Enregistrer une présence</h2></div>
        {message && <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>{message.text}</div>}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un membre..." className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-teal/50" />
        </div>
        {search && <div className="mt-2 max-h-48 overflow-auto space-y-1">
          {filtered.length === 0 ? <div className="text-sm text-muted-foreground text-center py-4">Aucun membre trouvé</div> :
            filtered.map((c: any) => (
              <button key={c.id} onClick={() => handleCheckin(c.id)} className="w-full flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition text-left">
                <div className="w-8 h-8 bg-brand-teal/10 rounded-full flex items-center justify-center"><UserCheck className="w-4 h-4 text-brand-teal" /></div>
                <span className="text-sm text-foreground">{c.name}</span>
              </button>
            ))}
        </div>}
      </div>
      <div className="card-gym">
        <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-brand-teal dark:text-brand-cyan" /><h2 className="font-display text-xl text-foreground tracking-wider">Présences d'aujourd'hui</h2><span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{todayCheckins.length}</span></div>
        {loading ? <div className="text-center py-8 text-muted-foreground">Chargement...</div> : todayCheckins.length === 0 ? <div className="text-center py-8 text-muted-foreground">Aucune présence aujourd'hui</div> :
          <div className="space-y-2">
            {todayCheckins.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#22C55E]/10 rounded-full flex items-center justify-center"><UserCheck className="w-4 h-4 text-[#22C55E]" /></div>
                  <div>
                    <div className="text-sm text-foreground font-mono">{a.id.slice(0, 8)}...</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.startTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E]">Présent</span>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
