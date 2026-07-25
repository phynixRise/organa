'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Order { id: string; totalMillimes: number; status: string; createdAt: string; }

export default function BoutiqueOrders() {
  const { selectedOrg } = useOrg();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'open' | 'cancelled'>('all');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Order[]>(`/organizations/${selectedOrg.id}/orders`).then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    open: orders.filter((o) => o.status === 'open').length,
    revenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.totalMillimes, 0),
  };

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">Ventes</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-gym text-center">
          <ShoppingBag className="w-5 h-5 text-[#3B82F6] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="card-gym text-center">
          <CheckCircle className="w-5 h-5 text-[#22C55E] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{stats.completed}</div>
          <div className="text-xs text-muted-foreground">Payées</div>
        </div>
        <div className="card-gym text-center">
          <Clock className="w-5 h-5 text-[#EAB308] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{stats.open}</div>
          <div className="text-xs text-muted-foreground">En attente</div>
        </div>
        <div className="card-gym text-center">
          <div className="font-display text-2xl text-[#22C55E]">{(stats.revenue / 1000).toFixed(3)}</div>
          <div className="text-xs text-muted-foreground">TND</div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'completed', 'open', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {f === 'all' ? 'Toutes' : f === 'completed' ? 'Payées' : f === 'open' ? 'En attente' : 'Annulées'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : sorted.length === 0 ? <div className="text-center py-12 text-muted-foreground">Aucune vente</div> : (
        <div className="space-y-2">
          {sorted.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${o.status === 'completed' ? 'bg-green-500/10' : o.status === 'open' ? 'bg-[#EAB308]/10' : 'bg-[#EF4444]/10'}`}>
                  {o.status === 'completed' ? <CheckCircle className="w-5 h-5 text-[#22C55E]" /> : o.status === 'open' ? <Clock className="w-5 h-5 text-[#EAB308]" /> : <XCircle className="w-5 h-5 text-[#EF4444]" />}
                </div>
                <div>
                  <div className="text-sm text-foreground font-mono">#{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('fr')} {new Date(o.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-green-500/10 text-[#22C55E]' : o.status === 'open' ? 'bg-[#EAB308]/10 text-[#EAB308]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                  {o.status === 'completed' ? 'Payé' : o.status === 'open' ? 'En attente' : 'Annulé'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
