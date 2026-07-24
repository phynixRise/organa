'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';

interface StaffShift {
  id: string;
  accountId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export default function StaffShiftsPage() {
  const { selectedOrg } = useOrg();
  const { account } = useAuth();
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startTime: '', endTime: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<StaffShift[]>(`/organizations/${selectedOrg.id}/staff-shifts`)
      .then(setShifts)
      .catch(() => setShifts([]))
      .finally(() => setLoading(false));
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !account || !form.startTime || !form.endTime) return;
    setError('');
    try {
      const shift = await api.post<StaffShift>(`/organizations/${selectedOrg.id}/staff-shifts`, {
        accountId: account.id,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      setShifts((prev) => [...prev, shift]);
      setForm({ startTime: '', endTime: '' });
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Personnel</h1>
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
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
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
        ) : shifts.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucun shift</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Début</th>
                  <th className="px-4 py-2 font-medium">Fin</th>
                  <th className="px-4 py-2 font-medium">Durée</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => {
                  const start = new Date(s.startTime);
                  const end = new Date(s.endTime);
                  const hours = ((end.getTime() - start.getTime()) / 3600000).toFixed(1);
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2">{start.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2">{end.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2 font-medium">{hours}h</td>
                      <td className="px-4 py-2 text-gray-500">{start.toLocaleDateString('fr')}</td>
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
