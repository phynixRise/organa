'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import Link from 'next/link';
import {
  LayoutDashboard, Coffee, Users, Package, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, X, ChevronDown,
  UtensilsCrossed, Grid3X3, BarChart3, ClipboardList, Home
} from 'lucide-react';

function OrgSwitcherCafe() {
  const { orgs, selectedOrg, selectOrg } = useOrg();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!selectedOrg || orgs.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-lg hover:bg-muted/80 text-sm transition">
        <Coffee className="w-4 h-4 text-green-500" />
        <span className="text-foreground font-medium">{selectedOrg.name}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 py-1">
          <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">Mes entreprises</div>
          {orgs.map((org) => {
            const isCafe = ['cafe', 'restaurant'].includes(org.businessType);
            const isGym = ['gym', 'fitness', 'salle_de_sport'].includes(org.businessType);
            return (
              <button key={org.id} onClick={() => { selectOrg(org); setOpen(false); }}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 text-sm hover:bg-muted transition ${org.id === selectedOrg.id ? 'bg-green-500/10' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCafe ? 'bg-green-500/10' : isGym ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                  {isCafe ? <Coffee className="w-4 h-4 text-green-500" /> : isGym ? <LayoutDashboard className="w-4 h-4 text-orange-500" /> : <LayoutDashboard className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground font-medium truncate">{org.name}</div>
                  <div className="text-xs text-muted-foreground">{org.businessType}</div>
                </div>
                {org.id === selectedOrg.id && <span className="text-green-500">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CAFE_NAV = [
  { label: 'Tableau de bord', href: '/cafe/dashboard', icon: LayoutDashboard },
  { label: 'Caisse', href: '/cafe/pos', icon: UtensilsCrossed },
  { label: 'Commandes', href: '/cafe/orders', icon: ClipboardList },
  { label: 'Menu', href: '/cafe/menu', icon: Grid3X3 },
  { label: 'Tables', href: '/cafe/tables', icon: Coffee },
  { label: 'Stock', href: '/cafe/inventory', icon: Package },
  { label: 'Clients', href: '/cafe/customers', icon: Users },
  { label: 'Paramètres', href: '/cafe/settings', icon: Settings },
];

export default function CafeLayout({ children }: { children: React.ReactNode }) {
  const { account, loading: authLoading, logout } = useAuth();
  const { selectedOrg, loading: orgLoading } = useOrg();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !account) router.push('/login');
  }, [authLoading, account, router]);

  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground font-body">Chargement...</div>
      </div>
    );
  }

  if (!account) return null;

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display text-xl text-foreground tracking-wider">{selectedOrg?.name || 'CAFÉ'}</div>
            <div className="text-xs text-muted-foreground">{selectedOrg?.businessType}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {CAFE_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/cafe/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active ? 'bg-green-500/10 text-green-500 border-l-2 border-[#22C55E]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}>
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        {!collapsed && <div className="text-xs text-muted-foreground px-3 mb-2 truncate">{account.email}</div>}
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-[72px]' : 'w-[240px]'} bg-card border-r border-border transition-all duration-200`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="p-3 border-t border-border text-muted-foreground hover:text-foreground hover:bg-muted transition">
          {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <ChevronLeft className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] bg-card border-r border-border flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-muted-foreground"><X className="w-5 h-5" /></button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground"><Menu className="w-5 h-5" /></button>
          <Link href="/" className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition">
            <Home className="w-4 h-4" /> Accueil
          </Link>
          <div className="flex-1"><OrgSwitcherCafe /></div>
          <div className="text-sm text-muted-foreground">{account.fullName || account.email}</div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
