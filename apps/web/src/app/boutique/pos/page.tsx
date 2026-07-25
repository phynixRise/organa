'use client';

import { useEffect, useState, useRef } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Barcode, Search } from 'lucide-react';

interface Product { id: string; name: string; priceMillimes: number; barcode: string | null; stockQuantity: number | null; }
interface CartItem { product: Product; quantity: number; }

export default function BoutiquePOS() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedOrg) return;
    api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).then(setProducts).catch(() => setProducts([]));
  }, [selectedOrg]);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  function addByBarcode() {
    const p = products.find((pr) => pr.barcode === barcodeInput.trim());
    if (p) { addToCart(p); setBarcodeInput(''); }
    else { setMessage({ type: 'error', text: 'Article non trouvé' }); setTimeout(() => setMessage(null), 2000); }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) => prev.map((c) => {
      if (c.product.id !== productId) return c;
      const newQty = c.quantity + delta;
      return newQty > 0 ? { ...c, quantity: newQty } : c;
    }).filter((c) => c.quantity > 0));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }

  const total = cart.reduce((s, c) => s + c.product.priceMillimes * c.quantity, 0);

  async function handlePayment() {
    if (!selectedOrg || cart.length === 0) return;
    try {
      const order = await api.post<any>(`/organizations/${selectedOrg.id}/orders`, {
        customerId: undefined,
        items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity, unitPriceMillimes: c.product.priceMillimes })),
        totalMillimes: total,
        paymentMethod,
      });
      await api.post(`/organizations/${selectedOrg.id}/payments`, { orderId: order.id, amountMillimes: total, method: paymentMethod });
      await api.patch(`/organizations/${selectedOrg.id}/orders/${order.id}/complete`);
      setMessage({ type: 'success', text: `Vente enregistrée: ${(total / 1000).toFixed(3)} TND` });
      setCart([]);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Erreur' });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search)));

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Products list */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50" />
          </div>
          <div className="flex gap-2">
            <input ref={barcodeRef} type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addByBarcode()} placeholder="Scanner code-barres..." className="w-48 px-3 py-2.5 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] font-mono focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50" />
            <button onClick={addByBarcode} className="px-3 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-[#2563EB] transition"><Barcode className="w-4 h-4" /></button>
          </div>
        </div>

        {message && (
          <div className={`mb-3 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>{message.text}</div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => addToCart(p)} className="card-gym text-left hover:border-[#3B82F6]/30 transition-colors">
              <div className="text-sm font-medium text-[#F8F8F2] truncate mb-1">{p.name}</div>
              <div className="font-display text-lg text-[#3B82F6]">{(p.priceMillimes / 1000).toFixed(3)} TND</div>
              {p.stockQuantity !== null && p.stockQuantity !== undefined && (
                <div className={`text-[10px] mt-1 ${p.stockQuantity <= 5 ? 'text-[#EAB308]' : 'text-[#9CA3AF]'}`}>
                  Stock: {p.stockQuantity}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 bg-[#111118] border border-white/5 rounded-xl flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="font-display text-lg text-[#F8F8F2] tracking-wider">Panier</h2>
            <span className="text-xs text-[#9CA3AF] bg-[#1C1C27] px-2 py-0.5 rounded-full ml-auto">{cart.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-sm text-[#9CA3AF] text-center py-8">Panier vide</div>
          ) : cart.map((c) => (
            <div key={c.product.id} className="flex items-center gap-3 p-3 bg-[#1C1C27] rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#F8F8F2] truncate">{c.product.name}</div>
                <div className="text-xs text-[#3B82F6]">{(c.product.priceMillimes / 1000).toFixed(3)} TND × {c.quantity}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQuantity(c.product.id, -1)} className="p-1 bg-[#0A0A0F] rounded text-[#9CA3AF] hover:text-[#F8F8F2]"><Minus className="w-3 h-3" /></button>
                <span className="text-sm text-[#F8F8F2] w-6 text-center">{c.quantity}</span>
                <button onClick={() => updateQuantity(c.product.id, 1)} className="p-1 bg-[#0A0A0F] rounded text-[#9CA3AF] hover:text-[#F8F8F2]"><Plus className="w-3 h-3" /></button>
                <button onClick={() => removeFromCart(c.product.id)} className="p-1 text-[#EF4444]"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#9CA3AF]">Total</span>
            <span className="font-display text-2xl text-[#F8F8F2]">{(total / 1000).toFixed(3)} TND</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${paymentMethod === 'cash' ? 'bg-[#22C55E] text-white' : 'bg-[#1C1C27] text-[#9CA3AF] hover:text-[#F8F8F2]'}`}>
              <Banknote className="w-4 h-4" /> Espèces
            </button>
            <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${paymentMethod === 'card' ? 'bg-[#3B82F6] text-white' : 'bg-[#1C1C27] text-[#9CA3AF] hover:text-[#F8F8F2]'}`}>
              <CreditCard className="w-4 h-4" /> Carte
            </button>
          </div>
          <button onClick={handlePayment} disabled={cart.length === 0}
            className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition">
            Payer {(total / 1000).toFixed(3)} TND
          </button>
        </div>
      </div>
    </div>
  );
}
