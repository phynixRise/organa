'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import {
  Dumbbell, Store, Coffee, CreditCard, Users, BarChart3, Shield, Smartphone,
  CheckCircle, ArrowRight, Phone, Mail, MapPin, Zap, Globe, Plus, Trash2,
  LayoutDashboard, DollarSign, Settings, LogOut, Home, Star, Package,
  ClipboardList, Edit2, X, Check, Eye, ChevronDown, ChevronRight
} from 'lucide-react';

const GYM_TYPES = ['gym', 'fitness', 'salle_de_sport'];
const BOUTIQUE_TYPES = ['boutique', 'tienda'];
const CAFE_TYPES = ['cafe', 'restaurant'];

function getDashboardPath(t: string) {
  if (GYM_TYPES.includes(t)) return '/gym/dashboard';
  if (BOUTIQUE_TYPES.includes(t)) return '/boutique/dashboard';
  if (CAFE_TYPES.includes(t)) return '/cafe/dashboard';
  return '/boutique/dashboard';
}

function getBizIcon(t: string) { return GYM_TYPES.includes(t) ? Dumbbell : CAFE_TYPES.includes(t) ? Coffee : Store; }
function getBizColor(t: string) { return GYM_TYPES.includes(t) ? '#F97316' : CAFE_TYPES.includes(t) ? '#22C55E' : '#3B82F6'; }
function getBizLabel(t: string) { return GYM_TYPES.includes(t) ? 'Salle de sport' : CAFE_TYPES.includes(t) ? 'Café / Restaurant' : 'Boutique'; }

const FEATURES = [
  { icon: Globe, title: 'Multi-entreprise', desc: 'Gérez toutes vos entreprises depuis un seul compte.' },
  { icon: CreditCard, title: 'Caisse intégrée', desc: 'POS avec code-barres, paiements espèces et cartes.' },
  { icon: Users, title: 'Gestion des clients', desc: 'Base de données clients, historique, fidélisation.' },
  { icon: BarChart3, title: 'Tableau de bord', desc: 'Revenus, ventes, graphiques en temps réel.' },
  { icon: Shield, title: 'Isolation totale', desc: 'Chaque entreprise a ses propres données.' },
  { icon: Smartphone, title: 'Responsive', desc: 'Sur ordinateur, tablette et téléphone.' },
];

const PLANS = [
  { name: 'Starter', price: 29, features: ['1 entreprise', 'Caisse POS', 'Support email'], businesses: 1 },
  { name: 'Pro', price: 59, features: ['3 entreprises', 'Tout inclus', 'Rapports', 'WhatsApp'], businesses: 3, highlighted: true },
  { name: 'Business', price: 99, features: ['5+ entreprises', 'API', 'Support dédié', 'Personnalisé'], businesses: 5 },
];

interface BizStats { orders: number; revenue: number; customers: number; products: number; recentOrders: any[]; }

function BusinessCard({ org, onOpen, onDelete, onEdit }: {
  org: any; onOpen: () => void; onDelete: () => void; onEdit: (name: string) => void;
}) {
  const [stats, setStats] = useState<BizStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(org.name);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<any[]>(`/organizations/${org.id}/orders`).catch(() => []),
      api.get<any[]>(`/organizations/${org.id}/products`).catch(() => []),
      api.get<any[]>(`/organizations/${org.id}/customers`).catch(() => []),
    ]).then(([orders, products, customers]) => {
      const revenue = orders.reduce((s: number, o: any) => s + (o.totalMillimes || 0), 0);
      setStats({ orders: orders.length, revenue, customers: customers.length, products: products.length, recentOrders: orders.slice(-5).reverse() });
    });
  }, [org.id]);

  const Icon = getBizIcon(org.businessType);
  const color = getBizColor(org.businessType);

  function saveName() { onEdit(name.trim() || org.name); setEditing(false); }

  return (
    <div className="card-gym group hover:border-white/10 transition-all">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="flex-1 px-2 py-1 bg-[#0A0A0F] border border-white/10 rounded text-sm text-[#F8F8F2] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                onKeyDown={(e) => e.key === 'Enter' && saveName()} autoFocus />
              <button onClick={saveName} className="text-[#22C55E]"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setName(org.name); setEditing(false); }} className="text-[#EF4444]"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="font-display text-xl text-[#F8F8F2] tracking-wider truncate">{org.name}</div>
              <button onClick={() => setEditing(true)} className="text-[#6B7280] hover:text-[#F8F8F2] opacity-0 group-hover:opacity-100 transition">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="text-sm text-[#9CA3AF]">{getBizLabel(org.businessType)}</div>
        </div>
        <button onClick={onDelete} className="text-[#6B7280] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition" title="Supprimer">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-[#0A0A0F] rounded-lg text-center">
            <div className="text-sm font-bold text-[#F8F8F2]">{stats.orders}</div>
            <div className="text-[10px] text-[#9CA3AF]">Ventes</div>
          </div>
          <div className="p-2 bg-[#0A0A0F] rounded-lg text-center">
            <div className="text-sm font-bold text-[#22C55E]">{(stats.revenue / 1000).toFixed(1)}</div>
            <div className="text-[10px] text-[#9CA3AF]">TND</div>
          </div>
          <div className="p-2 bg-[#0A0A0F] rounded-lg text-center">
            <div className="text-sm font-bold text-[#F8F8F2]">{stats.customers}</div>
            <div className="text-[10px] text-[#9CA3AF]">Clients</div>
          </div>
          <div className="p-2 bg-[#0A0A0F] rounded-lg text-center">
            <div className="text-sm font-bold text-[#F8F8F2]">{stats.products}</div>
            <div className="text-[10px] text-[#9CA3AF]">Articles</div>
          </div>
        </div>
      )}

      {/* Expand recent orders */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#0A0A0F] rounded-lg text-xs text-[#9CA3AF] hover:text-[#F8F8F2] transition mb-4">
        <span>Ventes récentes</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && stats && (
        <div className="mb-4 space-y-1">
          {stats.recentOrders.length === 0 ? (
            <div className="text-xs text-[#9CA3AF] text-center py-2">Aucune vente</div>
          ) : stats.recentOrders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between px-3 py-1.5 text-xs">
              <span className="text-[#9CA3AF]">#{o.id.slice(0, 8)}</span>
              <span className="text-[#22C55E]">{((o.totalMillimes || 0) / 1000).toFixed(3)} TND</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onOpen}
          className="flex-1 py-2.5 rounded-xl text-center font-medium text-sm transition flex items-center justify-center gap-2"
          style={{ backgroundColor: `${color}15`, color }}>
          <LayoutDashboard className="w-4 h-4" /> Gérer
        </button>
        <Link href={getDashboardPath(org.businessType)}
          className="px-4 py-2.5 bg-[#1C1C27] border border-white/5 rounded-xl text-sm text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#22222E] transition flex items-center gap-2">
          <Eye className="w-4 h-4" /> Voir
        </Link>
      </div>
    </div>
  );
}

function BusinessManagerTab() {
  const { logout } = useAuth();
  const { orgs, selectOrg, createOrg, refreshOrgs } = useOrg();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', businessType: 'gym' });
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || creating) return;
    setCreating(true);
    try {
      await createOrg(form, false);
      await refreshOrgs();
      setForm({ name: '', businessType: 'gym' });
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(org: any) {
    if (!confirm(`Supprimer "${org.name}" ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/organizations/${org.id}`);
      await refreshOrgs();
    } catch {}
  }

  async function handleEditName(org: any, newName: string) {
    try {
      await api.put(`/organizations/${org.id}`, { name: newName });
      await refreshOrgs();
    } catch {}
  }

  function openBusiness(org: any) {
    selectOrg(org, true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Mes entreprises</h2>
          <p className="text-[#9CA3AF] mt-1">{orgs.length} entreprise{orgs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-medium hover:bg-[#EA580C] transition">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card-gym p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nom de l'entreprise" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 bg-[#0A0A0F] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F97316]" required />
            <select value={form.businessType} onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
              className="px-3 py-2 bg-[#0A0A0F] border border-white/5 rounded-lg text-sm text-[#F8F8F2] focus:outline-none focus:ring-1 focus:ring-[#F97316]">
              <option value="gym">Salle de sport</option>
              <option value="cafe">Café / Restaurant</option>
              <option value="boutique">Boutique</option>
            </select>
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-[#EA580C] transition disabled:opacity-50">
              {creating ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {orgs.length === 0 ? (
        <div className="card-gym text-center py-16">
          <LayoutDashboard className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="font-display text-2xl text-[#F8F8F2] tracking-wider mb-2">Aucune entreprise</h3>
          <p className="text-[#9CA3AF] mb-6">Créez votre première entreprise pour commencer.</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#EA580C] transition">
            <Plus className="w-5 h-5" /> Créer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orgs.map((org) => (
            <BusinessCard key={org.id} org={org} onOpen={() => openBusiness(org)}
              onDelete={() => handleDelete(org)} onEdit={(name) => handleEditName(org, name)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscoverTab() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full text-[#F97316] text-sm mb-6">
            <Star className="w-4 h-4" /> Plateforme #1 en Tunisie
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-[#F8F8F2] tracking-wider mb-4 leading-tight">
            UNE SEULE PLATEFORME.<br /><span className="text-[#F97316]">TOUS VOS BUSINESSES.</span>
          </h1>
          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">Gérez votre café, boutique, salle de sport — tout depuis un seul compte.</p>
        </div>
      </section>

      {/* Business Types */}
      <section>
        <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider text-center mb-10">Pour chaque activité</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Dumbbell, name: 'Salle de sport', desc: 'Membres, abonnements, présence', color: '#F97316' },
            { icon: Coffee, name: 'Café / Restaurant', desc: 'Menu, commandes, tables', color: '#22C55E' },
            { icon: Store, name: 'Boutique', desc: 'Produits, caisse, stock', color: '#3B82F6' },
          ].map((v) => (
            <div key={v.name} className="card-gym hover:border-white/10 transition">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${v.color}15` }}>
                <v.icon className="w-7 h-7" style={{ color: v.color }} />
              </div>
              <h3 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-2">{v.name}</h3>
              <p className="text-sm text-[#9CA3AF]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider text-center mb-10">Fonctionnalités</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-5 rounded-xl bg-[#111118] border border-white/5 hover:border-[#F97316]/20 transition">
              <div className="w-10 h-10 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-[#F97316]" />
              </div>
              <h3 className="font-display text-lg text-[#F8F8F2] tracking-wider mb-1">{f.title}</h3>
              <p className="text-sm text-[#9CA3AF]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing">
        <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider text-center mb-10">Tarifs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`p-6 rounded-2xl border transition ${
              plan.highlighted ? 'bg-[#111118] border-[#F97316]' : 'bg-[#111118] border-white/5 hover:border-white/10'
            }`}>
              {plan.highlighted && <div className="text-xs text-[#F97316] font-medium mb-2">Populaire</div>}
              <h3 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-[#F8F8F2]">{plan.price}</span>
                <span className="text-sm text-[#9CA3AF]">TND/mois</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact">
        <h2 className="font-display text-3xl text-[#F8F8F2] tracking-wider text-center mb-10">Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="card-gym text-center py-6"><Phone className="w-6 h-6 text-[#F97316] mx-auto mb-3" /><div className="text-sm text-[#F8F8F2]">+216 XX XXX XXX</div></div>
          <div className="card-gym text-center py-6"><Mail className="w-6 h-6 text-[#22C55E] mx-auto mb-3" /><div className="text-sm text-[#F8F8F2]">contact@organa.tn</div></div>
          <div className="card-gym text-center py-6"><MapPin className="w-6 h-6 text-[#3B82F6] mx-auto mb-3" /><div className="text-sm text-[#F8F8F2]">Tunis, Tunisie</div></div>
        </div>
      </section>
    </div>
  );
}

export default function RootPage() {
  const { account, loading: authLoading, logout } = useAuth();
  const { loading: orgLoading } = useOrg();
  const [tab, setTab] = useState<'discover' | 'businesses'>('discover');
  const router = useRouter();

  useEffect(() => { if (account) setTab('businesses'); }, [account]);

  if (authLoading || orgLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]"><div className="text-[#9CA3AF]">Chargement...</div></div>;
  }

  // Not logged in → marketing site
  if (!account) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
              <span className="font-display text-2xl text-[#F8F8F2] tracking-wider">ORGANA</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#F8F8F2] transition">Connexion</Link>
              <Link href="/signup" className="px-4 py-2 bg-[#F97316] text-white text-sm rounded-lg hover:bg-[#EA580C] transition font-medium">Commencer</Link>
            </div>
          </div>
        </nav>
        <div className="pt-24"><DiscoverTab /></div>
      </div>
    );
  }

  // Logged in → tabbed main page
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <nav className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
              <span className="font-display text-xl text-[#F8F8F2] tracking-wider">ORGANA</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex gap-1">
              <button onClick={() => setTab('discover')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'discover' ? 'bg-[#F97316]/10 text-[#F97316]' : 'text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27]'}`}>
                Découvrir
              </button>
              <button onClick={() => setTab('businesses')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'businesses' ? 'bg-[#F97316]/10 text-[#F97316]' : 'text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27]'}`}>
                Mes entreprises
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#9CA3AF]">{account.fullName || account.email}</span>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {tab === 'discover' ? <DiscoverTab /> : <BusinessManagerTab />}
      </main>
    </div>
  );
}
