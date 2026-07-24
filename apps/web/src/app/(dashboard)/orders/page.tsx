'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  priceMillimes: number;
}

interface OrderItem {
  productId: string;
  qty: number;
  priceMillimes: number;
}

interface Order {
  id: string;
  totalMillimes: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export default function OrdersPage() {
  const { selectedOrg } = useOrg();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([{ productId: '', qty: 1, priceMillimes: 0 }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<Order[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).catch(() => []),
    ]).then(([o, p]) => {
      setOrders(o.reverse());
      setProducts(p);
      setLoading(false);
    });
  }, [selectedOrg]);

  function addItem() {
    setItems((prev) => [...prev, { productId: '', qty: 1, priceMillimes: 0 }]);
  }

  function updateItem(idx: number, field: string, value: any) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        return { ...item, productId: value, priceMillimes: prod?.priceMillimes || 0 };
      }
      return { ...item, [field]: value };
    }));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg) return;
    const validItems = items.filter((i) => i.productId && i.qty > 0);
    if (validItems.length === 0) { setError('Ajoutez au moins un article'); return; }
    setError('');
    try {
      const order = await api.post<Order>(`/organizations/${selectedOrg.id}/orders`, { items: validItems });
      setOrders((prev) => [order, ...prev]);
      setItems([{ productId: '', qty: 1, priceMillimes: 0 }]);
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  async function handleCancel(id: string) {
    if (!selectedOrg || !confirm('Annuler cette commande ?')) return;
    try {
      const updated = await api.patch<Order>(`/organizations/${selectedOrg.id}/orders/${id}/cancel`);
      setOrders((prev) => prev.map((o) => o.id === id ? updated : o));
    } catch {}
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Ventes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : '+ Nouvelle vente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={item.productId}
                onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Choisir un article</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {(p.priceMillimes / 1000).toFixed(3)} TND</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-sm text-gray-500 w-24 text-right">
                {((item.priceMillimes * item.qty) / 1000).toFixed(3)} TND
              </span>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-sm">✕</button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={addItem} className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
              + Article
            </button>
            <div className="flex-1"></div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-4 text-sm text-gray-400 text-center">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucune vente</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Articles</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{o.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2 font-medium">{(o.totalMillimes / 1000).toFixed(3)} TND</td>
                    <td className="px-4 py-2 text-gray-500">{o.items?.length || 0} article(s)</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        o.status === 'completed' ? 'bg-green-100 text-green-700' :
                        o.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {o.status === 'completed' ? 'Terminée' : o.status === 'open' ? 'Ouverte' : o.status === 'cancelled' ? 'Annulée' : o.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr')}</td>
                    <td className="px-4 py-2">
                      {o.status === 'open' && (
                        <button onClick={() => handleCancel(o.id)} className="text-red-500 hover:text-red-700 text-xs">
                          Annuler
                        </button>
                      )}
                    </td>
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
