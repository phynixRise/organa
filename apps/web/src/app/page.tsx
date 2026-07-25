'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { getDashboardPath, getBizColor, ALL_BUSINESS_TYPES, getBizIcon, getBizLabel } from '@/lib/constants';
import {
  Plus, Trash2, LayoutDashboard, Edit2, X, Check, Eye, ChevronDown, ArrowRight
} from 'lucide-react';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { Hero } from '@/components/site/sections/hero';
import { BusinessMarquee } from '@/components/site/sections/business-marquee';
import { BusinessVerticals } from '@/components/site/sections/business-verticals';
import { ModuleMatrix } from '@/components/site/sections/module-matrix';
import { Comparison } from '@/components/site/sections/comparison';
import { HowItWorks } from '@/components/site/sections/how-it-works';
import { PlatformFeatures } from '@/components/site/sections/platform-features';
import { Security } from '@/components/site/sections/security';
import { Pricing } from '@/components/site/sections/pricing';
import { Faq } from '@/components/site/sections/faq';
import { CtaSection } from '@/components/site/sections/cta';
import { Button } from '@/components/ui/button';

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
    }).catch(() => {});
  }, [org.id]);

  const color = getBizColor(org.businessType);
  const Icon = getBizIcon(org.businessType);

  function saveName() { onEdit(name.trim() || org.name); setEditing(false); }

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 hover:border-brand-cyan/40 hover:shadow-brand transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand-teal/10 dark:bg-brand-cyan/15">
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                onKeyDown={(e) => e.key === 'Enter' && saveName()} autoFocus />
              <button onClick={saveName} className="text-green-500"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setName(org.name); setEditing(false); }} className="text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="font-display text-lg font-bold tracking-tight truncate">{org.name}</div>
              <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="text-sm text-muted-foreground">{getBizLabel(org.businessType)}</div>
        </div>
        <button onClick={onDelete} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <div className="text-sm font-bold">{stats.orders}</div>
            <div className="text-[10px] text-muted-foreground">Ventes</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <div className="text-sm font-bold text-brand-teal dark:text-brand-cyan">{(stats.revenue / 1000).toFixed(1)}</div>
            <div className="text-[10px] text-muted-foreground">TND</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <div className="text-sm font-bold">{stats.customers}</div>
            <div className="text-[10px] text-muted-foreground">Clients</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <div className="text-sm font-bold">{stats.products}</div>
            <div className="text-[10px] text-muted-foreground">Articles</div>
          </div>
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground hover:text-foreground transition mb-4">
        <span>Ventes récentes</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && stats && (
        <div className="mb-4 space-y-1">
          {stats.recentOrders.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-2">Aucune vente</div>
          ) : stats.recentOrders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">#{o.id.slice(0, 8)}</span>
              <span className="text-brand-teal dark:text-brand-cyan">{((o.totalMillimes || 0) / 1000).toFixed(3)} TND</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onOpen}
          className="flex-1 px-4 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-medium hover:bg-brand-teal/90 transition flex items-center justify-center gap-2 shadow-brand">
          <LayoutDashboard className="w-4 h-4" /> Gérer
        </button>
        <Link href={getDashboardPath(org.businessType)}
          className="px-4 py-2.5 border border-border bg-background rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-brand-cyan/50 transition flex items-center gap-2">
          <Eye className="w-4 h-4" /> Voir
        </Link>
      </div>
    </div>
  );
}

function BusinessManagerTab() {
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
    } catch { /* handled by 401 interceptor */ }
  }

  async function handleEditName(org: any, newName: string) {
    try {
      await api.put(`/organizations/${org.id}`, { name: newName });
      await refreshOrgs();
    } catch { /* handled by 401 interceptor */ }
  }

  function openBusiness(org: any) {
    selectOrg(org, true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Mes entreprises</h2>
          <p className="text-muted-foreground mt-1">{orgs.length} entreprise{orgs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}
          className="bg-brand-teal hover:bg-brand-teal/90 text-white shadow-brand rounded-full">
          <Plus className="w-4 h-4 mr-1.5" /> Ajouter
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nom de l'entreprise" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-cyan" required />
            <select value={form.businessType} onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-cyan">
              {ALL_BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-brand-teal/90 transition disabled:opacity-50">
              {creating ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {orgs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border bg-card">
          <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold tracking-tight mb-2">Aucune entreprise</h3>
          <p className="text-muted-foreground mb-6">Créez votre première entreprise pour commencer.</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal text-white rounded-xl font-medium hover:bg-brand-teal/90 transition shadow-brand">
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

export default function RootPage() {
  const { account, loading: authLoading } = useAuth();
  const { loading: orgLoading } = useOrg();
  const [activeTab, setActiveTab] = useState<'discover' | 'businesses'>('discover');

  if (authLoading || orgLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><div className="text-muted-foreground">Chargement...</div></div>;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <SiteHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'discover' ? (
          <>
            <Hero />
            <BusinessMarquee />
            <BusinessVerticals />
            <ModuleMatrix />
            <Comparison />
            <HowItWorks />
            <PlatformFeatures />
            <Security />
            <Pricing />
            <Faq />
            <CtaSection />
          </>
        ) : account ? (
          <section className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <BusinessManagerTab />
            </div>
          </section>
        ) : (
          <section className="py-20">
            <div className="mx-auto max-w-xl px-4 text-center">
              <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Connectez-vous pour gérer vos entreprises</h2>
              <p className="text-muted-foreground mb-6">Créez un compte gratuit pour commencer.</p>
              <div className="flex items-center justify-center gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild className="rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white shadow-brand">
                  <Link href="/signup">Créer un compte <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
