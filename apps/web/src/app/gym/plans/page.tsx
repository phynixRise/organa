'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Plus, Tag, Archive } from 'lucide-react';

interface Plan { id: string; name: string; priceMillimes: number; type: string; description: string | null; isActive: boolean; }

const PRESETS = [{ label: '1 jour', days: 1 }, { label: '1 semaine', days: 7 }, { label: '1 mois', days: 30 }, { label: '3 mois', days: 90 }, { label: '6 mois', days: 180 }, { label: '1 an', days: 365 }];

export default function GymPlans() {
  const { selectedOrg } = useOrg();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', duration: '30', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Plan[]>(`/organizations/${selectedOrg.id}/products`).then(setPlans).catch(() => setPlans([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.name.trim()) return;
    setError('');
    try {
      const plan = await api.post<Plan>(`/organizations/${selectedOrg.id}/products`, {
        name: form.name.trim(), type: 'service', priceMillimes: Math.round(parseFloat(form.price || '0') * 1000),
        description: `${form.duration} jours — ${form.description}`,
      });
      setPlans((prev) => [...prev, plan]);
      setForm({ name: '', price: '', duration: '30', description: '' });
      setShowForm(false);
    } catch (err: any) { setError(err?.message || 'Erreur'); }
  }

  async function handleArchive(id: string) {
    if (!selectedOrg) return;
    try { await api.delete(`/organizations/${selectedOrg.id}/products/${id}`); setPlans((prev) => prev.filter((p) => p.id !== id)); } catch {}
  }

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Formules</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-[#EA580C] transition">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Nouvelle formule'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card-gym space-y-3">
          {error && <div className="text-sm text-[#EF4444] bg-[#EF4444]/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Nom de la formule *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF]" required />
            <input type="number" step="0.001" placeholder="Prix (TND)" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF]" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-1 block">Durée</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((d) => (
                <button key={d.days} type="button" onClick={() => setForm((p) => ({ ...p, duration: String(d.days) }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${form.duration === String(d.days) ? 'bg-[#F97316] text-white' : 'bg-[#1C1C27] text-[#9CA3AF] hover:text-[#F8F8F2]'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <textarea placeholder="Description (optionnel)" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] resize-none" rows={2} />
          <button type="submit" className="px-4 py-2 bg-[#F97316] text-white text-sm rounded-lg hover:bg-[#EA580C] transition">Créer la formule</button>
        </form>
      )}
      {loading ? <div className="text-center py-12 text-[#9CA3AF]">Chargement...</div> : plans.length === 0 ? <div className="text-center py-12 text-[#9CA3AF]">Aucune formule créée</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="card-gym hover:border-[#F97316]/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#F97316]/10 rounded-lg flex items-center justify-center"><Tag className="w-5 h-5 text-[#F97316]" /></div>
                <button onClick={() => handleArchive(p.id)} className="text-[#6B7280] hover:text-[#EF4444] transition"><Archive className="w-4 h-4" /></button>
              </div>
              <h3 className="font-display text-2xl text-[#F8F8F2] tracking-wider mb-1">{p.name}</h3>
              <div className="font-display text-3xl text-[#F97316] tracking-wide mb-2">{(p.priceMillimes / 1000).toFixed(3)} <span className="text-lg">TND</span></div>
              {p.description && <p className="text-xs text-[#9CA3AF]">{p.description}</p>}
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className={`text-xs px-2 py-0.5 rounded ${p.isActive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#6B7280]/10 text-[#6B7280]'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
