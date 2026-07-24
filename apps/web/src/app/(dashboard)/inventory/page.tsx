'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  product?: Product;
}

export default function InventoryPage() {
  const { selectedOrg } = useOrg();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: '', reorderLevel: '10' });
  const [error, setError] = useState('');
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<InventoryItem[]>(`/organizations/${selectedOrg.id}/inventory`).catch(() => []),
      api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).catch(() => []),
    ]).then(([inv, prods]) => {
      setItems(inv);
      setProducts(prods);
      setLoading(false);
    });
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.productId) return;
    setError('');
    try {
      const item = await api.post<InventoryItem>(`/organizations/${selectedOrg.id}/inventory`, {
        productId: form.productId,
        quantity: parseInt(form.quantity || '0'),
        reorderLevel: parseInt(form.reorderLevel || '10'),
      });
      setItems((prev) => [...prev, item]);
      setForm({ productId: '', quantity: '', reorderLevel: '10' });
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  async function handleAdjust(id: string, delta: number) {
    if (!selectedOrg) return;
    try {
      const updated = await api.patch<InventoryItem>(`/organizations/${selectedOrg.id}/inventory/${id}/adjust`, {
        adjustment: delta,
      });
      setItems((prev) => prev.map((i) => i.id === id ? updated : i));
      setAdjustments((prev) => ({ ...prev, [id]: 0 }));
    } catch {}
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Stock</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : '+ Ajouter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={form.productId}
              onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            >
              <option value="">Article</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Quantité"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              min="0"
              placeholder="Seuil de réapprovisionnement"
              value={form.reorderLevel}
              onChange={(e) => setForm((p) => ({ ...p, reorderLevel: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-4 text-sm text-gray-400 text-center">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucun article en stock</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Article</th>
                  <th className="px-4 py-2 font-medium">Quantité</th>
                  <th className="px-4 py-2 font-medium">Seuil</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium">Ajuster</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const low = item.quantity <= item.reorderLevel;
                  return (
                    <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${low ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-2 font-medium">{item.product?.name || item.productId.slice(0, 8)}</td>
                      <td className="px-4 py-2 font-bold">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-500">{item.reorderLevel}</td>
                      <td className="px-4 py-2">
                        {low ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Stock bas</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={adjustments[item.id] || 0}
                            onChange={(e) => setAdjustments((prev) => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <button
                            onClick={() => handleAdjust(item.id, adjustments[item.id] || 0)}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            OK
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
