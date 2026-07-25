'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Coffee, DollarSign, Package, Users, TrendingUp, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CafeDashboard() {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, customers: 0 });
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/products`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
    ]).then(([orders, products, customers]) => {
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
      setLoading(false);
    });
  }, [selectedOrg]);

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;
  if (loading) return <div className="text-center py-12 text-[#9CA3AF]">Chargement...</div>;

  const statCards = [
    { label: 'Commandes', value: stats.orders, icon: ClipboardList, color: 'text-[#22C55E]' },
    { label: 'Revenu total', value: `${(stats.revenue / 1000).toFixed(3)} TND`, icon: DollarSign, color: 'text-[#F97316]' },
    { label: 'Articles menu', value: stats.products, icon: Package, color: 'text-[#3B82F6]' },
    { label: 'Clients', value: stats.customers, icon: Users, color: 'text-[#22C55E]' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">{selectedOrg.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-gym">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9CA3AF]">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="font-display text-3xl text-[#F8F8F2] tracking-wide">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card-gym">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Revenus</h2>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#F8F8F2' }} />
              <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-gym">
        <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-4">Commandes récentes</h2>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-[#9CA3AF] text-center py-6">Aucune commande</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-[#1C1C27] rounded-lg">
                <div>
                  <div className="text-sm text-[#F8F8F2] font-mono">{o.id.slice(0, 8)}...</div>
                  <div className="text-xs text-[#9CA3AF]">{new Date(o.createdAt).toLocaleDateString('fr')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#F8F8F2]">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EAB308]/10 text-[#EAB308]'}`}>
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
