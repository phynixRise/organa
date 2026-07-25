'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Users, DollarSign, AlertTriangle, CalendarCheck, TrendingUp, Snowflake, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

function getDaysRemaining(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function loadSubs(orgId: string): any[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`gym_subs_${orgId}`);
  return data ? JSON.parse(data) : [];
}

export default function GymDashboard() {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState({ members: 0, revenue: 0, checkins: 0, active: 0, frozen: 0, expired: 0 });
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [alerts, setAlerts] = useState<{ name: string; daysLeft: number; type: 'critical' | 'warning' | 'info' }[]>([]);
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

      // Load subscriptions from localStorage
      const subs = loadSubs(selectedOrg.id);
      const active = subs.filter((s: any) => s.status === 'active').length;
      const frozen = subs.filter((s: any) => s.status === 'frozen').length;
      const expired = subs.filter((s: any) => s.status === 'expired').length;

      setStats({ members: members.length, revenue, checkins: appointments.length, active, frozen, expired });

      // Build expiry alerts
      const newAlerts: typeof alerts = [];
      subs.forEach((s: any) => {
        if (s.status === 'expired') return;
        const days = getDaysRemaining(s.endDate);
        if (days <= 3) newAlerts.push({ name: s.memberName, daysLeft: days, type: 'critical' });
        else if (days <= 7) newAlerts.push({ name: s.memberName, daysLeft: days, type: 'warning' });
      });
      setAlerts(newAlerts.sort((a, b) => a.daysLeft - b.daysLeft));

      // Chart data
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

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;
  if (loading) return <div className="text-center py-12 text-muted-foreground">Chargement...</div>;

  const statCards = [
    { label: 'Membres', value: stats.members, icon: Users, color: 'text-[#22C55E]' },
    { label: 'Revenu total', value: `${(stats.revenue / 1000).toFixed(3)} TND`, icon: DollarSign, color: 'text-brand-teal dark:text-brand-cyan' },
    { label: 'Abonnements actifs', value: stats.active, icon: AlertTriangle, color: 'text-[#22C55E]' },
    { label: 'Gelés', value: stats.frozen, icon: Snowflake, color: 'text-[#3B82F6]' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">{selectedOrg?.name}</h1>

      {/* Stats */}
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

      {/* Expiry Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
              a.type === 'critical' ? 'bg-[#EF4444]/10 border border-[#EF4444]/20' : 'bg-[#EAB308]/10 border border-[#EAB308]/20'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 ${a.type === 'critical' ? 'text-[#EF4444]' : 'text-[#EAB308]'}`} />
                <div>
                  <div className="text-sm font-medium text-foreground">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.daysLeft <= 0 ? 'Abonnement expiré' : `Expire dans ${a.daysLeft} jour(s)`}
                  </div>
                </div>
              </div>
              <Link href="/gym/subscriptions" className={`text-xs px-3 py-1 rounded-lg ${
                a.type === 'critical' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#EAB308]/20 text-[#EAB308]'
              }`}>
                Voir
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <div className="card-gym">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-teal dark:text-brand-cyan" />
          <h2 className="font-display text-xl text-foreground tracking-wider">Revenus</h2>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="revenue" fill="hsl(var(--brand-teal))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-gym">
        <h2 className="font-display text-xl text-foreground tracking-wider mb-4">Activité récente</h2>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">Aucune activité</div>
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
                   <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-green-500/10 text-green-500' : o.status === 'open' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
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
