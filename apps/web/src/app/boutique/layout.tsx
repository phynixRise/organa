'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings,
  Store, LogOut, ChevronLeft, ChevronRight, Menu, X, ChevronDown, Warehouse, Home
} from 'lucide-react';

function OrgSwitcherBoutique() {
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
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C27] border border-white/5 rounded-lg hover:bg-[#22222E] text-sm transition">
        <Store className="w-4 h-4 text-[#3B82F6]" />
        <span className="text-[#F8F8F2] font-medium">{selectedOrg.name}</span>
        <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#111118] border border-white/5 rounded-xl shadow-2xl z-50 py-1">
          <div className="px-3 py-2 text-xs text-[#9CA3AF] uppercase tracking-wide">Mes entreprises</div>
          {orgs.map((org) => {
            const isBoutique = ['boutique', 'tienda'].includes(org.businessType);
            const isGym = ['gym', 'fitness', 'salle_de_sport'].includes(org.businessType);
            return (
              <button key={org.id} onClick={() => { selectOrg(org); setOpen(false); }}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 text-sm hover:bg-[#1C1C27] transition ${org.id === selectedOrg.id ? 'bg-[#3B82F6]/10' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBoutique ? 'bg-[#3B82F6]/10' : isGym ? 'bg-[#F97316]/10' : 'bg-[#22C55E]/10'}`}>
                  {isBoutique ? <Store className="w-4 h-4 text-[#3B82F6]" /> : isGym ? <LayoutDashboard className="w-4 h-4 text-[#F97316]" /> : <LayoutDashboard className="w-4 h-4 text-[#22C55E]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F8F8F2] font-medium truncate">{org.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{org.businessType}</div>
                </div>
                {org.id === selectedOrg.id && <span className="text-[#3B82F6]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BOUTIQUE_NAV = [
  { label: 'Tableau de bord', href: '/boutique/dashboard', icon: LayoutDashboard },
  { label: 'Caisse', href: '/boutique/pos', icon: ShoppingCart },
  { label: 'Ventes', href: '/boutique/orders', icon: BarChart3 },
  { label: 'Articles', href: '/boutique/products', icon: Package },
  { label: 'Stock', href: '/boutique/inventory', icon: Warehouse },
  { label: 'Clients', href: '/boutique/customers', icon: Users },
  { label: 'Paramètres', href: '/boutique/settings', icon: Settings },
];

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
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
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="text-[#9CA3AF] font-body">Chargement...</div>
      </div>
    );
  }

  if (!account) return null;

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display text-xl text-[#F8F8F2] tracking-wider">{selectedOrg?.name || 'BOUTIQUE'}</div>
            <div className="text-xs text-[#9CA3AF]">{selectedOrg?.businessType}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {BOUTIQUE_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/boutique/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6]' : 'text-[#9CA3AF] hover:bg-[#1C1C27] hover:text-[#F8F8F2]'
              }`}>
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        {!collapsed && <div className="text-xs text-[#9CA3AF] px-3 mb-2 truncate">{account.email}</div>}
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-[72px]' : 'w-[240px]'} bg-[#111118] border-r border-white/5 transition-all duration-200`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="p-3 border-t border-white/5 text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27] transition">
          {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <ChevronLeft className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] bg-[#111118] border-r border-white/5 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF]"><X className="w-5 h-5" /></button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#111118] border-b border-white/5 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[#9CA3AF]"><Menu className="w-5 h-5" /></button>
          <Link href="/" className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27] rounded-lg transition">
            <Home className="w-4 h-4" /> Accueil
          </Link>
          <div className="flex-1"><OrgSwitcherBoutique /></div>
          <div className="text-sm text-[#9CA3AF]">{account.fullName || account.email}</div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
