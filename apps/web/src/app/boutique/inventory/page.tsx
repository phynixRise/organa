'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Package, AlertTriangle, Plus, Minus } from 'lucide-react';

interface Product { id: string; name: string; stockQuantity: number | null; priceMillimes: number; sku: string | null; }

export default function BoutiqueInventory() {
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
  const inStock = products.filter((p) => p.stockQuantity !== null && p.stockQuantity !== undefined && p.stockQuantity > 5);

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Stock</h1>

      {loading ? <div className="text-center py-12 text-[#9CA3AF]">Chargement...</div> : (
        <>
          {lowStock.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-xl text-[#EAB308] tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Stock faible ({lowStock.length})
              </h2>
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-[#EAB308]/5 border border-[#EAB308]/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#EAB308]" />
                    <div>
                      <div className="text-sm font-medium text-[#F8F8F2]">{p.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{p.sku || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl text-[#EAB308]">{p.stockQuantity}</span>
                    <div className="flex gap-1">
                      <button onClick={() => updateStock(p.id, -1)} className="p-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/20 transition"><Minus className="w-4 h-4" /></button>
                      <button onClick={() => updateStock(p.id, 1)} className="p-1.5 bg-[#22C55E]/10 text-[#22C55E] rounded-lg hover:bg-[#22C55E]/20 transition"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Tous les articles ({inStock.length + lowStock.length})</h2>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-[#1C1C27] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-[#3B82F6]" />
                    <div>
                      <div className="text-sm text-[#F8F8F2]">{p.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{(p.priceMillimes / 1000).toFixed(3)} TND</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm ${p.stockQuantity !== null && p.stockQuantity <= 5 ? 'text-[#EAB308]' : 'text-[#22C55E]'}`}>
                      {p.stockQuantity ?? '—'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => updateStock(p.id, -1)} className="p-1 bg-[#111118] rounded text-[#9CA3AF] hover:text-[#EF4444] transition"><Minus className="w-3 h-3" /></button>
                      <button onClick={() => updateStock(p.id, 1)} className="p-1 bg-[#111118] rounded text-[#9CA3AF] hover:text-[#22C55E] transition"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="text-center py-8 text-[#9CA3AF]">Aucun article</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
