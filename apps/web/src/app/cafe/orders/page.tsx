'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { ClipboardList, Clock, CheckCircle, XCircle, Coffee } from 'lucide-react';

interface Order { id: string; totalMillimes: number; status: string; createdAt: string; }

export default function CafeOrders() {
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

  if (!selectedOrg) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Sélectionnez un café</div>;

  return (
    <div className="cafe-theme max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-3">
        <ClipboardList className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        Commandes
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ClipboardList, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
          { label: 'Servies', value: stats.completed, icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
          { label: 'En attente', value: stats.open, icon: Clock, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
          { label: 'Revenu', value: `${(stats.revenue / 1000).toFixed(1)} TND`, icon: Coffee, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-cafe text-center">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">{card.value}</div>
              <div className="text-xs text-stone-400">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {(['all', 'completed', 'open', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100'}`}>
            {f === 'all' ? 'Toutes' : f === 'completed' ? 'Servies' : f === 'open' ? 'En attente' : 'Annulées'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-stone-400">Chargement...</div> : sorted.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Coffee className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  o.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : o.status === 'open' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {o.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> : o.status === 'open' ? <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" /> : <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div>
                  <div className="text-sm text-stone-800 dark:text-stone-100 font-mono">#{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-stone-400">{new Date(o.createdAt).toLocaleDateString('fr')} {new Date(o.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  o.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : o.status === 'open' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                }`}>
                  {o.status === 'completed' ? 'Servie' : o.status === 'open' ? 'En attente' : 'Annulée'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
