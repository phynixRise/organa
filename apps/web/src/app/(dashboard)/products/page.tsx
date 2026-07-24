'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  type: string;
  priceMillimes: number;
  description: string | null;
  isActive: boolean;
}

export default function ProductsPage() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'product', price: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Product[]>(`/organizations/${selectedOrg.id}/products`)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.name.trim()) return;
    setError('');
    try {
      const data: any = {
        name: form.name.trim(),
        type: form.type,
        priceMillimes: Math.round(parseFloat(form.price || '0') * 1000),
      };
      if (form.description.trim()) data.description = form.description.trim();
      const product = await api.post<Product>(`/organizations/${selectedOrg.id}/products`, data);
      setProducts((prev) => [...prev, product]);
      setForm({ name: '', type: 'product', price: '', description: '' });
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  async function handleDelete(id: string) {
    if (!selectedOrg || !confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/organizations/${selectedOrg.id}/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Articles</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="product">Produit</option>
              <option value="service">Service</option>
            </select>
            <input
              type="number"
              step="0.001"
              placeholder="Prix (TND)"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
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
        ) : products.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucun article</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Nom</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Prix</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-gray-500">{p.type === 'product' ? 'Produit' : 'Service'}</td>
                    <td className="px-4 py-2 font-medium">{(p.priceMillimes / 1000).toFixed(3)} TND</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs">
                        Supprimer
                      </button>
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
