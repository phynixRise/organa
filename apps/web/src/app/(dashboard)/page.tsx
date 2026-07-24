'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';

interface DashboardStats {
  customers: number;
  products: number;
  orders: number;
  appointments: number;
  revenue: number;
}

export default function DashboardPage() {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState<DashboardStats>({ customers: 0, products: 0, orders: 0, appointments: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/products`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<any[]>(`/organizations/${selectedOrg.id}/appointments`).catch(() => []),
    ]).then(([customers, products, orders, appointments]) => {
      const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalMillimes || 0), 0);
      setStats({ customers: customers.length, products: products.length, orders: orders.length, appointments: appointments.length, revenue });
      setRecentOrders(orders.slice(-5).reverse());
      setLoading(false);
    });
  }, [selectedOrg]);

  if (!selectedOrg) {
    return (
      <div className="text-center py-12 text-gray-500">
        Sélectionnez une entreprise pour commencer
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }

  const cards = [
    { label: 'Clients', value: stats.customers, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Articles', value: stats.products, icon: '📦', color: 'bg-green-50 text-green-700' },
    { label: 'Commandes', value: stats.orders, icon: '🛒', color: 'bg-purple-50 text-purple-700' },
    { label: 'Rendez-vous', value: stats.appointments, icon: '📅', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">{selectedOrg.name}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{card.label}</span>
              <span className={`text-lg px-2 py-0.5 rounded ${card.color}`}>{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-sm text-gray-500 mb-1">Revenu total</div>
        <div className="text-2xl font-bold text-gray-800">
          {(stats.revenue / 1000).toFixed(3)} TND
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Activité récente</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucune commande</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2 font-medium">{(order.totalMillimes / 1000).toFixed(3)} TND</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status === 'completed' ? 'Terminée' : order.status === 'open' ? 'Ouverte' : order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
