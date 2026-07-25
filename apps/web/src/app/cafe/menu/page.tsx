'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Search, Plus, Trash2, Edit2, Tag, Grid3X3 } from 'lucide-react';

interface Product { id: string; name: string; priceMillimes: number; category: string | null; description: string | null; isActive: boolean; }

const CATEGORIES = ['Boissons', 'Café', 'Thé', 'Pâtisserie', 'Sandwich', 'Plat', 'Dessert', 'Snack', 'Autre'];

export default function CafeMenu() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Tous');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'Boissons', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  function startEdit(p: Product) {
    setEditingProduct(p);
    setForm({ name: p.name, price: (p.priceMillimes / 1000).toString(), category: p.category || 'Boissons', description: p.description || '' });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ name: '', price: '', category: 'Boissons', description: '' });
    setEditingProduct(null);
    setShowForm(false);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.name.trim()) return;
    setError('');
    const body: any = {
      name: form.name.trim(),
      priceMillimes: Math.round(parseFloat(form.price || '0') * 1000),
      category: form.category,
      description: form.description.trim() || undefined,
    };
    try {
      if (editingProduct) {
        const updated = await api.put<Product>(`/organizations/${selectedOrg.id}/products/${editingProduct.id}`, body);
        setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? updated : p));
      } else {
        const created = await api.post<Product>(`/organizations/${selectedOrg.id}/products`, body);
        setProducts((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) { setError(err?.message || 'Erreur'); }
  }

  async function handleDelete(id: string) {
    if (!selectedOrg || !confirm('Supprimer cet article du menu ?')) return;
    try { await api.delete(`/organizations/${selectedOrg.id}/products/${id}`); setProducts((prev) => prev.filter((p) => p.id !== id)); } catch {}
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Tous' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = ['Tous', ...new Set(products.map((p) => p.category).filter(Boolean))];

  if (!selectedOrg) return <div className="text-center py-12 text-muted-foreground">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground tracking-wider">Menu</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-[#16A34A] transition">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50" />
        </div>
        <div className="flex gap-2 overflow-auto pb-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setCatFilter(c!)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${catFilter === c ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-gym space-y-3">
          {error && <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground" required />
            <input type="number" step="0.001" placeholder="Prix (TND) *" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground" required />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground" />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-[#16A34A] transition">{editingProduct ? 'Modifier' : 'Ajouter au menu'}</button>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground">{search ? 'Aucun résultat' : 'Menu vide'}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="card-gym hover:border-green-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center"><Grid3X3 className="w-5 h-5 text-green-500" /></div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-green-500 transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">{p.name}</h3>
              <div className="font-display text-2xl text-green-500 tracking-wide mb-2">{(p.priceMillimes / 1000).toFixed(3)} <span className="text-sm">TND</span></div>
              {p.category && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Tag className="w-3 h-3" />{p.category}</div>}
              {p.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
