'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Search, Plus, UserCheck, Mail, Phone, Trash2, Coffee } from 'lucide-react';

interface Customer { id: string; name: string; email: string | null; phone: string | null; createdAt: string; }

export default function CafeCustomers() {
  const { selectedOrg } = useOrg();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Customer[]>(`/organizations/${selectedOrg.id}/customers`).then(setCustomers).catch(() => setCustomers([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.name.trim()) return;
    setError('');
    try {
      const data: any = { name: form.name.trim() };
      if (form.email.trim()) data.email = form.email.trim();
      if (form.phone.trim()) data.phone = form.phone.trim();
      const c = await api.post<Customer>(`/organizations/${selectedOrg.id}/customers`, data);
      setCustomers((prev) => [...prev, c]);
      setForm({ name: '', email: '', phone: '' });
      setShowForm(false);
    } catch (err: any) { setError(err?.message || 'Erreur'); }
  }

  async function handleDelete(id: string) {
    if (!selectedOrg || !confirm('Supprimer ce client ?')) return;
    try { await api.delete(`/organizations/${selectedOrg.id}/customers/${id}`); setCustomers((prev) => prev.filter((c) => c.id !== id)); } catch {}
  }

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())));

  if (!selectedOrg) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Sélectionnez un café</div>;

  return (
    <div className="cafe-theme max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          Clients
        </h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition shadow-md shadow-amber-600/20">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-cafe space-y-3">
          {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400" required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400" />
            <input type="tel" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400" />
          </div>
          <button type="submit" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-xl hover:bg-amber-700 transition">Enregistrer</button>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-stone-400">Chargement...</div> : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Coffee className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Aucun client</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="card-cafe">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-800 dark:text-stone-100">{c.name}</div>
                    <div className="text-xs text-stone-400 font-mono">{new Date(c.createdAt).toLocaleDateString('fr')}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-stone-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1 ml-13">
                {c.email && <div className="flex items-center gap-2 text-xs text-stone-400"><Mail className="w-3 h-3" />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-2 text-xs text-stone-400"><Phone className="w-3 h-3" />{c.phone}</div>}
                {!c.email && !c.phone && <div className="text-xs text-stone-400">Aucune coordonnée</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
