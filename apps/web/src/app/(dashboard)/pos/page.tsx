'use client';

import { useEffect, useState, useRef } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import BarcodeScanner from './barcode-scanner';

interface Product {
  id: string;
  name: string;
  type: string;
  priceMillimes: number;
  barcode: string | null;
  isActive?: boolean;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface Customer {
  id: string;
  name: string;
  barcode: string | null;
}

export default function POSPage() {
  const { selectedOrg } = useOrg();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    Promise.all([
      api.get<Product[]>(`/organizations/${selectedOrg.id}/products`).catch(() => []),
      api.get<Customer[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
    ]).then(([p, c]) => {
      setProducts(p.filter((p) => p.isActive));
      setCustomers(c);
      setLoading(false);
    });
  }, [selectedOrg]);

  const total = cart.reduce((sum, item) => sum + item.product.priceMillimes * item.qty, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setSearch('');
    searchRef.current?.focus();
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, qty } : i))
      );
    }
  }

  function clearCart() {
    setCart([]);
    setOrderResult(null);
  }

  function handleBarcodeScan(barcode: string) {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setShowScanner(false);
    } else {
      setError(`Article avec code-barres "${barcode}" non trouvé`);
      setTimeout(() => setError(''), 3000);
    }
  }

  function handleHIDInput(e: React.KeyboardEvent) {
    // HID keyboard-wedge scanners type the barcode + Enter
    // Already handled by the search input
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  async function handlePayment() {
    if (!selectedOrg || cart.length === 0) return;
    setError('');
    try {
      const items = cart.map((i) => ({
        productId: i.product.id,
        qty: i.qty,
        priceMillimes: i.product.priceMillimes,
      }));
      const order = await api.post<any>(`/organizations/${selectedOrg.id}/orders`, { items });

      // Create payment record
      await api.post(`/organizations/${selectedOrg.id}/payments`, {
        orderId: order.id,
        amountMillimes: total,
        method: paymentMethod,
        status: 'paid',
      });

      setOrderResult({ ...order, paymentMethod });
      setCart([]);
      setShowPayment(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du paiement');
    }
  }

  if (!selectedOrg) return <div className="text-center py-12 text-gray-500">Sélectionnez une entreprise</div>;

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Left: Product grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleHIDInput}
              placeholder="Rechercher un article ou scanner le code-barres..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            📷 Scanner
          </button>
        </div>

        {showScanner && (
          <div className="mb-3">
            <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
          </div>
        )}

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        {orderResult && (
          <div className="mb-3 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
            <div className="font-medium">Commande enregistrée !</div>
            <div>Total: {(orderResult.totalMillimes / 1000).toFixed(3)} TND — {orderResult.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}</div>
            <button onClick={() => setOrderResult(null)} className="text-green-600 underline text-xs mt-1">Fermer</button>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {search ? 'Aucun article trouvé' : 'Aucun article actif'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-blue-400 hover:shadow-sm transition"
                >
                  <div className="font-medium text-sm text-gray-800 truncate">{product.name}</div>
                  <div className="text-lg font-bold text-blue-600 mt-1">
                    {(product.priceMillimes / 1000).toFixed(3)} TND
                  </div>
                  {product.barcode && (
                    <div className="text-xs text-gray-400 mt-1 font-mono">{product.barcode}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-white border border-gray-200 rounded-xl flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Panier</h2>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Panier vide</div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-2 py-2 border-b border-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.product.name}</div>
                  <div className="text-xs text-gray-400">
                    {(item.product.priceMillimes / 1000).toFixed(3)} TND
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.product.id, item.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-sm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.product.id, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="w-20 text-right text-sm font-medium">
                  {((item.product.priceMillimes * item.qty) / 1000).toFixed(3)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{(total / 1000).toFixed(3)} TND</span>
          </div>

          {showPayment ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    paymentMethod === 'cash'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  💵 Espèces
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  💳 Carte
                </button>
              </div>
              <button
                onClick={handlePayment}
                disabled={cart.length === 0}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Confirmer le paiement
              </button>
              <button
                onClick={() => setShowPayment(false)}
                className="w-full py-2 text-gray-500 text-sm hover:bg-gray-50 rounded-lg"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Vider
              </button>
              <button
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Payer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
