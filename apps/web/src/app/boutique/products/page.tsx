'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Search, Plus, Package, Trash2, Edit2, Barcode, Tag } from 'lucide-react';

interface Product { id: string; name: string; sku: string | null; barcode: string | null; priceMillimes: number; costMillimes: number | null; category: string | null; stockQuantity: number | null; isActive: boolean; }

const CATEGORIES = ['Vêtements', 'Chaussures', 'Accessoires', 'Électronique', 'Alimentaire', 'Beauté', 'Maison', 'Autre'];

export default function BoutiqueProducts() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', price: '', cost: '', category: 'Autre', stock: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  function startEdit(p: Product) {
    setEditingProduct(p);
    setForm({ name: p.name, sku: p.sku || '', barcode: p.barcode || '', price: (p.priceMillimes / 1000).toString(), cost: p.costMillimes ? (p.costMillimes / 1000).toString() : '', category: p.category || 'Autre', stock: p.stockQuantity?.toString() || '' });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ name: '', sku: '', barcode: '', price: '', cost: '', category: 'Autre', stock: '' });
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
      sku: form.sku.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      priceMillimes: Math.round(parseFloat(form.price || '0') * 1000),
      costMillimes: form.cost ? Math.round(parseFloat(form.cost) * 1000) : undefined,
      category: form.category,
      stockQuantity: form.stock ? parseInt(form.stock) : undefined,
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
    if (!selectedOrg || !confirm('Supprimer cet article ?')) return;
    try { await api.delete(`/organizations/${selectedOrg.id}/products/${id}`); setProducts((prev) => prev.filter((p) => p.id !== id)); } catch {}
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) || (p.barcode && p.barcode.includes(search)));

  if (!selectedOrg) return <div className="text-center py-12 text-[text-muted-foreground]">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[text-foreground] tracking-wider">Articles</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[text-muted-foreground]" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un article..." className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground] focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-gym space-y-3">
          {error && <div className="text-sm text-[text-red-500] bg-[text-red-500]/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Nom *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground]" required />
            <input type="text" placeholder="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground]" />
            <input type="text" placeholder="Code-barres" value={form.barcode} onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground] font-mono" />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground]">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" step="0.001" placeholder="Prix de vente (TND) *" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground]" required />
            <input type="number" step="0.001" placeholder="Prix d'achat (TND)" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground]" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-[text-foreground] placeholder-[text-muted-foreground]" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition">{editingProduct ? 'Modifier' : 'Créer'}</button>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-[text-muted-foreground]">Chargement...</div> : filtered.length === 0 ? <div className="text-center py-12 text-[text-muted-foreground]">{search ? 'Aucun article trouvé' : 'Aucun article'}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="card-gym hover:border-blue-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-blue-500" /></div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="text-[text-muted-foreground] hover:text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-[text-muted-foreground] hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-sm font-medium text-[text-foreground] mb-1 truncate">{p.name}</h3>
              <div className="font-display text-2xl text-blue-500 tracking-wide mb-2">{(p.priceMillimes / 1000).toFixed(3)} <span className="text-sm">TND</span></div>
              <div className="space-y-1">
                {p.category && <div className="flex items-center gap-1 text-xs text-[text-muted-foreground]"><Tag className="w-3 h-3" />{p.category}</div>}
                {p.sku && <div className="text-xs text-[text-muted-foreground] font-mono">SKU: {p.sku}</div>}
                {p.barcode && <div className="flex items-center gap-1 text-xs text-[text-muted-foreground] font-mono"><Barcode className="w-3 h-3" />{p.barcode}</div>}
                {p.stockQuantity !== null && p.stockQuantity !== undefined && (
                  <div className={`text-xs font-mono ${p.stockQuantity <= 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                    Stock: {p.stockQuantity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
