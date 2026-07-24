'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';

interface Location {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  locationId: string;
  startTime: string;
  endTime: string;
  status: string;
  location?: Location;
  createdAt: string;
}

export default function AppointmentsPage() {
  const { selectedOrg } = useOrg();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ locationId: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<Appointment[]>(`/organizations/${selectedOrg.id}/appointments`).catch(() => []),
      api.get<Location[]>(`/organizations/${selectedOrg.id}/locations`).catch(() => []),
    ]).then(([a, l]) => {
      setAppointments(a.reverse());
      setLocations(l);
      setLoading(false);
    });
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.locationId || !form.startTime || !form.endTime) return;
    setError('');
    try {
      const appt = await api.post<Appointment>(`/organizations/${selectedOrg.id}/appointments`, {
        locationId: form.locationId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      setAppointments((prev) => [appt, ...prev]);
      setForm({ locationId: '', startTime: '', endTime: '' });
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  async function handleComplete(id: string) {
    if (!selectedOrg) return;
    try {
      const updated = await api.patch<Appointment>(`/organizations/${selectedOrg.id}/appointments/${id}/complete`);
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch {}
  }

  async function handleCancel(id: string) {
    if (!selectedOrg || !confirm('Annuler ce rendez-vous ?')) return;
    try {
      const updated = await api.patch<Appointment>(`/organizations/${selectedOrg.id}/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch {}
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Rendez-vous</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : '+ Nouveau'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={form.locationId}
              onChange={(e) => setForm((p) => ({ ...p, locationId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            >
              <option value="">Emplacement</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
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
        ) : appointments.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Aucun rendez-vous</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Emplacement</th>
                  <th className="px-4 py-2 font-medium">Début</th>
                  <th className="px-4 py-2 font-medium">Fin</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{a.location?.name || a.locationId.slice(0, 8)}</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(a.startTime).toLocaleString('fr')}</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(a.endTime).toLocaleString('fr')}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === 'completed' ? 'bg-green-100 text-green-700' :
                        a.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                        a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {a.status === 'completed' ? 'Terminé' : a.status === 'booked' ? 'Réservé' : a.status === 'cancelled' ? 'Annulé' : a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {a.status === 'booked' && (
                        <>
                          <button onClick={() => handleComplete(a.id)} className="text-green-600 hover:text-green-800 text-xs">Terminé</button>
                          <button onClick={() => handleCancel(a.id)} className="text-red-500 hover:text-red-700 text-xs">Annuler</button>
                        </>
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
