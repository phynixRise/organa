'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';

interface Location {
  id: string;
  name: string;
  attributes: any;
  createdAt: string;
}

export default function LocationsPage() {
  const { selectedOrg } = useOrg();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Location[]>(`/organizations/${selectedOrg.id}/locations`)
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.name.trim()) return;
    setError('');
    try {
      const data: any = { name: form.name.trim() };
      if (form.address.trim()) data.attributes = { address: form.address.trim() };
      const loc = await api.post<Location>(`/organizations/${selectedOrg.id}/locations`, data);
      setLocations((prev) => [...prev, loc]);
      setForm({ name: '', address: '' });
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  async function handleDelete(id: string) {
    if (!selectedOrg || !confirm('Supprimer cet emplacement ?')) return;
    try {
      await api.delete(`/organizations/${selectedOrg.id}/locations/${id}`);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {}
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Emplacements</h1>
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
            <input
              type="text"
              placeholder="Adresse"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
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
        ) : locations.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucun emplacement</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Nom</th>
                  <th className="px-4 py-2 font-medium">Adresse</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {locations.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{l.name}</td>
                    <td className="px-4 py-2 text-gray-500">{l.attributes?.address || '—'}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:text-red-700 text-xs">
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
