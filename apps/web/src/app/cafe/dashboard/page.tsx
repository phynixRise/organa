'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { Coffee, TrendingUp, ShoppingBag, Users, Package, Clock, Star } from 'lucide-react';

const CafeRevenueChart = dynamic(() => import('./cafe-revenue-chart'), { ssr: false });

export default function CafeDashboard() {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, customers: 0 });
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrg) return;
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/products`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
    ]).then(([orders, products, customers]) => {
      if (controller.signal.aborted) return;
      const revenue = orders.reduce((s: number, o: any) => s + (o.totalMillimes || 0), 0);
      setStats({ orders: orders.length, revenue, products: products.length, customers: customers.length });

      const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
      const monthlyData: Record<string, number> = {};
      orders.forEach((o: any) => {
        const d = new Date(o.createdAt);
        const key = monthNames[d.getMonth()];
        monthlyData[key] = (monthlyData[key] || 0) + o.totalMillimes;
      });
      setChartData(monthNames.map((m) => ({ month: m, revenue: (monthlyData[m] || 0) / 1000 })));
      setRecentOrders(orders.slice(-5).reverse());
      setLoading(false);
    });
    return () => controller.abort();
  }, [selectedOrg]);

  if (!selectedOrg) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Sélectionnez un café</div>;
  if (loading) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Chargement...</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      {/* Welcome banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/30 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Coffee className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
              Bonjour ! 👋
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-0.5">Voici le résumé de votre café</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Aujourd'hui", value: stats.orders, icon: ShoppingBag, color: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-700 dark:text-amber-400' },
          { label: 'Revenu total', value: `${(stats.revenue / 1000).toFixed(1)} TND`, icon: TrendingUp, color: 'from-green-500 to-green-600', iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-700 dark:text-green-400' },
          { label: 'Articles', value: stats.products, icon: Package, color: 'from-orange-500 to-orange-600', iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-700 dark:text-orange-400' },
          { label: 'Clients', value: stats.customers, icon: Users, color: 'from-rose-500 to-rose-600', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-700 dark:text-rose-400' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-cafe">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-stone-500 dark:text-stone-400">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <CafeRevenueChart data={chartData} />
        </div>

        {/* Recent orders */}
        <div className="card-cafe">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-lg font-bold text-stone-800 dark:text-stone-100">Ventes récentes</h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <Coffee className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune vente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-stone-600 dark:text-stone-300">#{o.id.slice(0, 8)}</div>
                      <div className="text-xs text-stone-400">{new Date(o.createdAt).toLocaleDateString('fr')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-stone-100 dark:bg-stone-700 text-stone-500'
                    }`}>
                      {o.status === 'completed' ? 'Payé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
