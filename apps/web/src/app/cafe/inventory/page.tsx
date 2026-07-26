'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Package, AlertTriangle, Plus, Minus, Coffee } from 'lucide-react';

interface Product { id: string; name: string; stockQuantity: number | null; priceMillimes: number; category: string | null; }

export default function CafeInventory() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  async function updateStock(id: string, delta: number) {
    if (!selectedOrg) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newQty = (product.stockQuantity || 0) + delta;
    if (newQty < 0) return;
    try {
      await api.patch(`/organizations/${selectedOrg.id}/products/${id}`, { stockQuantity: newQty });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stockQuantity: newQty } : p));
    } catch {}
  }

  const lowStock = products.filter((p) => p.stockQuantity !== null && p.stockQuantity !== undefined && p.stockQuantity <= 5);

  if (!selectedOrg) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Sélectionnez un café</div>;

  return (
    <div className="cafe-theme max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-3">
        <Package className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        Stock
      </h1>

      {loading ? <div className="text-center py-12 text-stone-400">Chargement...</div> : (
        <>
          {lowStock.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Stock faible ({lowStock.length})
              </h2>
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-100">{p.name}</div>
                      <div className="text-xs text-stone-400">{p.category || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-bold text-orange-600 dark:text-orange-400">{p.stockQuantity}</span>
                    <div className="flex gap-1">
                      <button onClick={() => updateStock(p.id, -1)} className="p-1.5 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition"><Minus className="w-4 h-4" /></button>
                      <button onClick={() => updateStock(p.id, 1)} className="p-1.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-stone-800 dark:text-stone-100">Tous les articles ({products.length})</h2>
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-sm text-stone-800 dark:text-stone-100">{p.name}</div>
                    <div className="text-xs text-stone-400">{p.category || '—'} — {(p.priceMillimes / 1000).toFixed(3)} TND</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm ${p.stockQuantity !== null && p.stockQuantity <= 5 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                    {p.stockQuantity ?? '—'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => updateStock(p.id, -1)} className="p-1 bg-stone-100 dark:bg-stone-700 rounded text-stone-400 hover:text-red-500 transition"><Minus className="w-3 h-3" /></button>
                    <button onClick={() => updateStock(p.id, 1)} className="p-1 bg-stone-100 dark:bg-stone-700 rounded text-stone-400 hover:text-green-500 transition"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-8 text-stone-400">
                <Coffee className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Aucun article</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
