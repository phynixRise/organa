'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { ShoppingBag, DollarSign, Package, Users } from 'lucide-react';

const BoutiqueRevenueChart = dynamic(() => import('./boutique-revenue-chart'), { ssr: false });

export default function BoutiqueDashboard() {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, customers: 0 });
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
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
        const key = monthNames[new Date(o.createdAt).getMonth()];
        monthlyData[key] = (monthlyData[key] || 0) + o.totalMillimes;
      });
      setChartData(monthNames.map((m) => ({ month: m, revenue: (monthlyData[m] || 0) / 1000 })));
      setRecentOrders(orders.slice(-5).reverse());
      setLowStock(products.filter((p: any) => p.stockQuantity !== undefined && p.stockQuantity <= 5).slice(0, 5));
      setLoading(false);
    });
    return () => controller.abort();
  }, [selectedOrg]);

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;
  if (loading) return <div className="text-center py-12 text-muted-foreground">Chargement...</div>;

  const statCards = [
    { label: 'Ventes', value: stats.orders, icon: ShoppingBag, color: 'text-brand-teal' },
    { label: 'Revenu total', value: `${(stats.revenue / 1000).toFixed(3)} TND`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Articles', value: stats.products, icon: Package, color: 'text-brand-teal' },
    { label: 'Clients', value: stats.customers, icon: Users, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">{selectedOrg.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-gym">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="font-display text-3xl text-foreground tracking-wide">{card.value}</div>
            </div>
          );
        })}
      </div>

      <BoutiqueRevenueChart data={chartData} />

      {lowStock.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display text-xl text-foreground tracking-wider">Stock faible</h2>
          {lowStock.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-[#EAB308]/10 border border-[#EAB308]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-[#EAB308]" />
                <div>
                  <div className="text-sm font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.stockQuantity} restant(s)</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card-gym">
        <h2 className="font-display text-xl text-foreground tracking-wider mb-4">Ventes récentes</h2>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">Aucune vente</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-foreground font-mono">{o.id.slice(0, 8)}...</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('fr')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-[#EAB308]/10 text-[#EAB308]'}`}>
                    {o.status === 'completed' ? 'Payé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
