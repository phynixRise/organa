'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

export default function GymSubscriptions() {
  const { selectedOrg } = useOrg();
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: '', total: '', method: 'cash' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
    ]).then(([o, c]) => { setOrders(o.reverse()); setCustomers(c); setLoading(false); });
  }, [selectedOrg]);

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.customerId) return;
    setError('');
    try {
      const order = await api.post<any>(`/organizations/${selectedOrg.id}/orders`, {
        customerId: form.customerId,
        items: [{ productId: 'subscription', qty: 1, priceMillimes: Math.round(parseFloat(form.total || '0') * 1000) }],
      });
      setOrders((prev) => [order, ...prev]);
      setForm({ customerId: '', total: '', method: 'cash' });
      setShowForm(false);
    } catch (err: any) { setError(err?.message || 'Erreur'); }
  }

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;
  const stats = { paid: orders.filter((o) => o.status === 'completed').length, pending: orders.filter((o) => o.status === 'open').length, cancelled: orders.filter((o) => o.status === 'cancelled').length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Abonnements</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-[#EA580C] transition">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Enregistrer'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="card-gym text-center"><CheckCircle className="w-5 h-5 text-[#22C55E] mx-auto mb-1" /><div className="font-display text-2xl text-[#F8F8F2]">{stats.paid}</div><div className="text-xs text-[#9CA3AF]">Payés</div></div>
        <div className="card-gym text-center"><Clock className="w-5 h-5 text-[#EAB308] mx-auto mb-1" /><div className="font-display text-2xl text-[#F8F8F2]">{stats.pending}</div><div className="text-xs text-[#9CA3AF]">En attente</div></div>
        <div className="card-gym text-center"><XCircle className="w-5 h-5 text-[#EF4444] mx-auto mb-1" /><div className="font-display text-2xl text-[#F8F8F2]">{stats.cancelled}</div><div className="text-xs text-[#9CA3AF]">Annulés</div></div>
      </div>
      {showForm && (
        <form onSubmit={handleRecord} className="card-gym space-y-3">
          {error && <div className="text-sm text-[#EF4444] bg-[#EF4444]/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={form.customerId} onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2]" required>
              <option value="">Membre</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" step="0.001" placeholder="Montant (TND)" value={form.total} onChange={(e) => setForm((p) => ({ ...p, total: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF]" />
            <select value={form.method} onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2]">
              <option value="cash">Espèces</option><option value="card">Carte</option><option value="online">En ligne</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-[#F97316] text-white text-sm rounded-lg hover:bg-[#EA580C] transition">Enregistrer</button>
        </form>
      )}
      <div className="space-y-2">
        {loading ? <div className="text-center py-12 text-[#9CA3AF]">Chargement...</div> : orders.length === 0 ? <div className="text-center py-12 text-[#9CA3AF]">Aucun abonnement</div> :
          orders.map((o: any) => (
            <div key={o.id} className="card-gym flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${o.status === 'completed' ? 'bg-[#22C55E]/10' : o.status === 'open' ? 'bg-[#EAB308]/10' : 'bg-[#EF4444]/10'}`}>
                  {o.status === 'completed' ? <CheckCircle className="w-5 h-5 text-[#22C55E]" /> : o.status === 'open' ? <Clock className="w-5 h-5 text-[#EAB308]" /> : <XCircle className="w-5 h-5 text-[#EF4444]" />}
                </div>
                <div>
                  <div className="text-sm text-[#F8F8F2] font-mono">{o.id.slice(0, 8)}...</div>
                  <div className="text-xs text-[#9CA3AF]">{new Date(o.createdAt).toLocaleDateString('fr')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-[#F8F8F2]">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' : o.status === 'open' ? 'bg-[#EAB308]/10 text-[#EAB308]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>{o.status === 'completed' ? 'Payé' : o.status === 'open' ? 'En attente' : 'Annulé'}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
