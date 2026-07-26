'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Search,
  Receipt, X, Printer, Keyboard, Grid3X3, LayoutGrid
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  priceMillimes: number;
  category: string | null;
  description?: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Boissons': '☕',
  'Café': '☕',
  'Thé': '🍵',
  'Pâtisserie': '🥐',
  'Sandwich': '🥪',
  'Plat': '🍽️',
  'Dessert': '🍰',
  'Snack': '🍿',
  'Autre': '📦',
};

export default function CafePOS() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [table, setTable] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedOrg) return;
    api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).then(setProducts).catch(() => setProducts([]));
  }, [selectedOrg]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key) {
      case '/':
        e.preventDefault();
        searchRef.current?.focus();
        break;
      case 'Escape':
        setCart([]);
        setTable('');
        setSearch('');
        break;
      case '1': case '2': case '3': case '4': case '5': {
        const cats = categories;
        const idx = parseInt(e.key) - 1;
        if (cats[idx]) setCatFilter(cats[idx]);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0);

  async function handlePayment() {
    if (!selectedOrg || cart.length === 0) return;
    try {
      const order = await api.post<any>(`/organizations/${selectedOrg.id}/orders`, {
        customerId: undefined,
        items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity, unitPriceMillimes: c.product.priceMillimes })),
        totalMillimes: total,
        paymentMethod,
        notes: table ? `Table ${table}` : undefined,
      });
      await api.post(`/organizations/${selectedOrg.id}/payments`, { orderId: order.id, amountMillimes: total, method: paymentMethod });
      await api.patch(`/organizations/${selectedOrg.id}/orders/${order.id}/complete`);
      printReceipt(order.id);
      setMessage({ type: 'success', text: `Commande #${order.id.slice(0, 8)} — ${(total / 1000).toFixed(3)} TND${table ? ` (Table ${table})` : ''}` });
      setCart([]);
      setTable('');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Erreur' });
      setTimeout(() => setMessage(null), 4000);
    }
  }

  function printReceipt(orderId: string) {
    const receiptContent = `
      <html><head><style>
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .item { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 4px; margin-top: 8px; }
      </style></head><body>
        <div class="center bold">☕ ${selectedOrg?.name || 'CAFÉ'}</div>
        <div class="center" style="font-size:10px">Commande #${orderId.slice(0, 8)}</div>
        <div class="center" style="font-size:10px">${new Date().toLocaleDateString('fr')} ${new Date().toLocaleTimeString('fr')}</div>
        ${table ? `<div class="center bold">Table ${table}</div>` : ''}
        <div class="line"></div>
        ${cart.map((c) => `<div class="item"><span>${c.quantity}× ${c.product.name}</span><span>${((c.product.priceMillimes * c.quantity) / 1000).toFixed(3)}</span></div>`).join('')}
        <div class="line"></div>
        <div class="item total"><span>TOTAL</span><span>${(total / 1000).toFixed(3)} TND</span></div>
        <div class="line"></div>
        <div class="center" style="font-size:10px">${paymentMethod === 'cash' ? 'Espèces' : 'Carte'}</div>
        <div class="center" style="font-size:10px">Merci ! ☕</div>
      </body></html>
    `;
    const w = window.open('', '_blank', 'width=320,height=600');
    if (w) { w.document.write(receiptContent); w.document.close(); w.print(); w.close(); }
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  if (!selectedOrg) return <div className="flex items-center justify-center h-[60vh] text-stone-400">Sélectionnez un café</div>;

  return (
    <div className="cafe-theme flex h-[calc(100vh-64px)]">
      {/* Left: Product grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher... (/)"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="flex gap-1 bg-stone-100 dark:bg-stone-700 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-400'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-400'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors" title="Raccourcis clavier">
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((c, i) => (
              <button key={c} onClick={() => setCatFilter(c!)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  catFilter === c
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100'
                }`}>
                {c !== 'All' && <span>{CATEGORY_ICONS[c!] || '📦'}</span>}
                <span>{c === 'All' ? 'Tous' : c}</span>
                {c !== 'All' && <span className="text-[10px] opacity-60 ml-0.5">{i + 1}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{search ? 'Aucun résultat' : 'Ajoutez des articles au menu'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="group relative text-left p-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                    {CATEGORY_ICONS[p.category || 'Autre'] || '📦'}
                  </div>
                  <div className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate mb-1">{p.name}</div>
                  <div className="font-display text-lg text-amber-700 dark:text-amber-400 font-bold">
                    {(p.priceMillimes / 1000).toFixed(3)} <span className="text-xs font-normal text-stone-400">TND</span>
                  </div>
                  {p.category && <div className="text-[10px] text-stone-400 mt-1.5 uppercase tracking-wider">{p.category}</div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-lg shrink-0">
                    {CATEGORY_ICONS[p.category || 'Autre'] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{p.name}</div>
                    {p.category && <div className="text-xs text-stone-400">{p.category}</div>}
                  </div>
                  <div className="font-display text-lg text-amber-700 dark:text-amber-400 font-bold shrink-0">
                    {(p.priceMillimes / 1000).toFixed(3)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-[340px] bg-white dark:bg-stone-800 border-l border-stone-200 dark:border-stone-700 flex flex-col shrink-0">
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="font-display text-lg font-bold text-stone-800 dark:text-stone-100">Commande</h2>
            </div>
            {cart.length > 0 && (
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 rounded-full">
                {itemCount} article{itemCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="mt-3">
            <input type="text" value={table} onChange={(e) => setTable(e.target.value)}
              placeholder="Table (optionnel)"
              className="w-full px-3 py-2 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <Receipt className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Panier vide</p>
              <p className="text-xs mt-1 opacity-60">Cliquez sur un article</p>
            </div>
          ) : cart.map((c) => (
            <div key={c.product.id} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{c.product.name}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {(c.product.priceMillimes / 1000).toFixed(3)} × {c.quantity}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQuantity(c.product.id, -1)}
                  className="w-7 h-7 flex items-center justify-center bg-white dark:bg-stone-600 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-stone-800 dark:text-stone-100">{c.quantity}</span>
                <button onClick={() => updateQuantity(c.product.id, 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white dark:bg-stone-600 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => removeFromCart(c.product.id)}
                  className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-500">Total</span>
            <span className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">
              {(total / 1000).toFixed(3)} <span className="text-sm font-normal text-stone-400">TND</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPaymentMethod('cash')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'cash' ? 'bg-green-600 text-white shadow-md' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 hover:text-stone-800'
              }`}>
              <Banknote className="w-4 h-4" /> Espèces
            </button>
            <button onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'card' ? 'bg-blue-600 text-white shadow-md' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 hover:text-stone-800'
              }`}>
              <CreditCard className="w-4 h-4" /> Carte
            </button>
          </div>
          <button onClick={handlePayment} disabled={cart.length === 0}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
            <Receipt className="w-4 h-4" />
            Enregistrer {(total / 1000).toFixed(3)} TND
          </button>
        </div>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" /> Raccourcis clavier
            </h3>
            <div className="space-y-2 text-sm">
              {[
                ['/', 'Rechercher'],
                ['1-5', 'Sélectionner catégorie'],
                ['Échap', 'Vider le panier'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-stone-500">{desc}</span>
                  <kbd className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-xs font-mono text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-600">{key}</kbd>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-lg text-sm hover:bg-stone-200 dark:hover:bg-stone-600 transition">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
