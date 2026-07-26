'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import Link from 'next/link';
import {
  LayoutDashboard, Coffee, Users, Package, Settings,
  LogOut, Menu, X, ChevronDown,
  UtensilsCrossed, Grid3X3, ClipboardList, Home, Store
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
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-stone-800/80 border border-amber-200 dark:border-amber-900/50 rounded-full hover:bg-amber-50 dark:hover:bg-stone-700 text-sm transition">
        <Store className="w-4 h-4 text-amber-700 dark:text-amber-400" />
        <span className="text-stone-800 dark:text-stone-100 font-medium">{selectedOrg.name}</span>
        <ChevronDown className="w-4 h-4 text-stone-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-2xl shadow-xl z-50 py-2">
          <div className="px-4 py-2 text-xs text-stone-400 uppercase tracking-wider font-medium">Mes cafés</div>
          {orgs.map((org) => (
            <button key={org.id} onClick={() => { selectOrg(org); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-amber-50 dark:hover:bg-stone-700 transition ${org.id === selectedOrg.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-stone-800 dark:text-stone-100 font-medium truncate">{org.name}</div>
                <div className="text-xs text-stone-400">{org.businessType}</div>
              </div>
              {org.id === selectedOrg.id && <span className="text-amber-600 dark:text-amber-400">✓</span>}
            </button>
          ))}
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !account) router.push('/login');
  }, [authLoading, account, router]);

  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FAF5F0' }}>
        <div className="text-stone-400">Chargement...</div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="cafe-theme min-h-screen flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="cafe-topbar sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <Link href="/cafe/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight hidden sm:block">
                {selectedOrg?.name || 'Mon Café'}
              </span>
            </Link>

            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <Home className="w-4 h-4" /> <span className="hidden sm:inline">Accueil</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {CAFE_NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/cafe/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex-1" />

            {/* Right side */}
            <OrgSwitcherCafe />
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-sm text-stone-500 dark:text-stone-400">{account.fullName || account.email}</div>
              <button onClick={logout} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-stone-400">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-amber-200 dark:border-amber-900/50 bg-white dark:bg-stone-800 px-4 py-3 space-y-1">
            {CAFE_NAV.map((item) => {
              const active = pathname === item.href || (item.href !== '/cafe/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'text-stone-500 dark:text-stone-400'
                  }`}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-amber-200 dark:border-amber-900/50">
              <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                <LogOut className="w-5 h-5" /> Déconnexion
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-amber-200/50 dark:border-stone-800 py-4 px-6 text-center text-xs text-stone-400">
        <span className="opacity-60">☕</span> {selectedOrg?.name || 'Mon Café'} — Organa
      </footer>
    </div>
  );
}
