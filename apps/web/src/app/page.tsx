'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { getDashboardPath, getBizColor, ALL_BUSINESS_TYPES, getBizIcon, getBizLabel } from '@/lib/constants';
import {
  Plus, Trash2, LayoutDashboard, Edit2, X, Check, Eye, ChevronDown, ArrowRight,
  BarChart3, TrendingUp, TrendingDown, Users, CreditCard, Package, Filter,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

const Hero = dynamic(() => import('@/components/site/sections/hero').then(m => m.Hero), { ssr: false });
const BusinessMarquee = dynamic(() => import('@/components/site/sections/business-marquee').then(m => m.BusinessMarquee), { ssr: false });
const BusinessVerticals = dynamic(() => import('@/components/site/sections/business-verticals').then(m => m.BusinessVerticals), { ssr: false });
const ModuleMatrix = dynamic(() => import('@/components/site/sections/module-matrix').then(m => m.ModuleMatrix), { ssr: false });
const Comparison = dynamic(() => import('@/components/site/sections/comparison').then(m => m.Comparison), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/site/sections/how-it-works').then(m => m.HowItWorks), { ssr: false });
const PlatformFeatures = dynamic(() => import('@/components/site/sections/platform-features').then(m => m.PlatformFeatures), { ssr: false });
const Security = dynamic(() => import('@/components/site/sections/security').then(m => m.Security), { ssr: false });
const Pricing = dynamic(() => import('@/components/site/sections/pricing').then(m => m.Pricing), { ssr: false });
const Faq = dynamic(() => import('@/components/site/sections/faq').then(m => m.Faq), { ssr: false });
const CtaSection = dynamic(() => import('@/components/site/sections/cta').then(m => m.CtaSection), { ssr: false });

interface CombinedStats {
  totals: { revenue: number; payments: number; orders: number; customers: number };
  orgStats: Array<{
    orgId: string; orgName: string; businessType: string;
    totalRevenue: number; totalOrders: number; totalCustomers: number; totalPayments: number;
    recentOrders: any[];
  }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  orgs: Array<{ id: string; name: string; businessType: string }>;
}

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: any; color: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-brand-cyan/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold mb-4">Revenus (12 mois)</h3>
      <div className="flex items-end gap-1.5 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-brand-teal dark:bg-brand-cyan transition-all hover:opacity-80"
              style={{ height: `${Math.max((d.revenue / max) * 100, 2)}%` }}
              title={`${(d.revenue / 1000).toFixed(1)} TND`}
            />
            <span className="text-[10px] text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgBreakdownBar({ orgStats }: { orgStats: CombinedStats['orgStats'] }) {
  const total = orgStats.reduce((s, o) => s + o.totalRevenue, 0) || 1;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold mb-4">Répartition par entreprise</h3>
      <div className="h-4 rounded-full overflow-hidden flex mb-4">
        {orgStats.map((org) => (
          <div
            key={org.orgId}
            className="h-full transition-all"
            style={{ width: `${(org.totalRevenue / total) * 100}%`, backgroundColor: getBizColor(org.businessType) }}
            title={`${org.orgName}: ${(org.totalRevenue / 1000).toFixed(1)} TND`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {orgStats.map((org) => (
          <div key={org.orgId} className="flex items-center gap-3 text-sm">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getBizColor(org.businessType) }} />
            <span className="flex-1 truncate text-foreground">{org.orgName}</span>
            <span className="text-muted-foreground text-xs">{getBizLabel(org.businessType)}</span>
            <span className="font-medium">{(org.totalRevenue / 1000).toFixed(1)} TND</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessCard({ org, onOpen, onDelete, onEdit }: {
  org: any; onOpen: () => void; onDelete: () => void; onEdit: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(org.name);

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
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['combined-stats', typeFilter, periodFilter, selectedOrgId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (periodFilter !== 'all') params.set('period', periodFilter);
      if (selectedOrgId) params.set('orgId', selectedOrgId);
      return api.get<CombinedStats>(`/organizations/combined-stats?${params.toString()}`);
    },
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || creating) return;
    setCreating(true);
    try {
      await createOrg(form, false);
      await refreshOrgs();
      setForm({ name: '', businessType: 'gym' });
      setShowCreate(false);
    } finally { setCreating(false); }
  }

  async function handleDelete(org: any) {
    if (!confirm(`Supprimer "${org.name}" ? Cette action est irréversible.`)) return;
    try { await api.delete(`/organizations/${org.id}`); await refreshOrgs(); } catch {}
  }

  async function handleEditName(org: any, newName: string) {
    try { await api.put(`/organizations/${org.id}`, { name: newName }); await refreshOrgs(); } catch {}
  }

  const filteredOrgs = useMemo(() => {
    if (typeFilter === 'ALL') return orgs;
    const typeMap: Record<string, string[]> = {
      cafe: ['cafe', 'restaurant'], gym: ['gym', 'fitness'], boutique: ['boutique', 'tienda'],
    };
    return orgs.filter((o) => (typeMap[typeFilter] || [typeFilter]).includes(o.businessType));
  }, [orgs, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
              {ALL_BUSINESS_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-brand-teal/90 transition disabled:opacity-50">
              {creating ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {stats && (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Filter className="w-4 h-4 text-muted-foreground ml-2" />
              {['ALL', 'cafe', 'gym', 'boutique'].map((t) => (
                <button key={t} onClick={() => { setTypeFilter(t); setSelectedOrgId(''); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    typeFilter === t ? 'bg-brand-teal text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {t === 'ALL' ? 'Tous' : getBizLabel(t)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              {[
                { value: 'day', label: 'Jour' },
                { value: 'week', label: 'Semaine' },
                { value: 'month', label: 'Mois' },
                { value: 'year', label: 'Année' },
                { value: 'all', label: 'Tout' },
              ].map((p) => (
                <button key={p.value} onClick={() => setPeriodFilter(p.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    periodFilter === p.value ? 'bg-brand-cyan text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            {stats.orgs.length > 1 && (
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <select value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="px-3 py-1.5 bg-transparent text-xs font-medium text-foreground focus:outline-none">
                  <option value="">Toutes les entreprises</option>
                  {stats.orgs.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenu total" value={`${(stats.totals.revenue / 1000).toFixed(1)} TND`} icon={CreditCard} color="bg-brand-teal" sub={`${stats.totals.payments} paiements`} />
            <StatCard label="Ventes" value={String(stats.totals.orders)} icon={Package} color="bg-blue-500" />
            <StatCard label="Clients" value={String(stats.totals.customers)} icon={Users} color="bg-purple-500" />
            <StatCard label="Entreprises actives" value={String(stats.orgStats.length)} icon={LayoutDashboard} color="bg-amber-500" />
          </div>

          {stats.orgStats.length > 1 && <OrgBreakdownBar orgStats={stats.orgStats} />}
          <RevenueChart data={stats.monthlyRevenue} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stats.orgStats.map((org) => {
              const Icon = getBizIcon(org.businessType);
              const color = getBizColor(org.businessType);
              return (
                <div key={org.orgId} className="rounded-2xl border border-border bg-card p-5 hover:border-brand-cyan/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-lg font-bold truncate">{org.orgName}</div>
                      <div className="text-xs text-muted-foreground">{getBizLabel(org.businessType)}</div>
                    </div>
                    <Link href={getDashboardPath(org.businessType)}
                      className="text-sm text-brand-teal dark:text-brand-cyan hover:underline flex items-center gap-1">
                      Ouvrir <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-bold">{(org.totalRevenue / 1000).toFixed(1)}</div>
                      <div className="text-[10px] text-muted-foreground">TND</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-bold">{org.totalOrders}</div>
                      <div className="text-[10px] text-muted-foreground">Ventes</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-bold">{org.totalCustomers}</div>
                      <div className="text-[10px] text-muted-foreground">Clients</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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
          {filteredOrgs.map((org) => (
            <BusinessCard key={org.id} org={org} onOpen={() => selectOrg(org, true)}
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
