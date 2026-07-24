'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Users, DollarSign, AlertTriangle, CalendarCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  members: number;
  revenue: number;
  expiring: number;
  checkins: number;
}

export default function GymDashboard() {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState<Stats>({ members: 0, revenue: 0, expiring: 0, checkins: 0 });
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/appointments`).catch(() => []),
    ]).then(([members, orders, appointments]) => {
      const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalMillimes || 0), 0);
      setStats({ members: members.length, revenue, expiring: 0, checkins: appointments.length });

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
  }, [selectedOrg]);

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;
  if (loading) return <div className="text-center py-12 text-[#9CA3AF]">Chargement...</div>;

  const statCards = [
    { label: 'Membres actifs', value: stats.members, icon: Users, color: 'text-[#22C55E]' },
    { label: 'Revenu mensuel', value: `${(stats.revenue / 1000).toFixed(3)} TND`, icon: DollarSign, color: 'text-[#F97316]' },
    { label: 'Abonnements expirés', value: stats.expiring, icon: AlertTriangle, color: 'text-[#EF4444]' },
    { label: "Présences aujourd'hui", value: stats.checkins, icon: CalendarCheck, color: 'text-[#3B82F6]' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">{selectedOrg?.name}</h1>
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
          <TrendingUp className="w-5 h-5 text-[#F97316]" />
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Revenus</h2>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#F8F8F2' }} />
              <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card-gym">
        <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-4">Activité récente</h2>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-[#9CA3AF] text-center py-6">Aucune activité</div>
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
                  <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' : o.status === 'open' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#6B7280]/10 text-[#6B7280]'}`}>
                    {o.status === 'completed' ? 'Payé' : o.status === 'open' ? 'En attente' : o.status}
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
