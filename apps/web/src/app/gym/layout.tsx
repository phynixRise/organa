'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import Link from 'next/link';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, Settings,
  Dumbbell, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

const GYM_NAV = [
  { label: 'Tableau de bord', href: '/gym/dashboard', icon: LayoutDashboard },
  { label: 'Membres', href: '/gym/members', icon: Users },
  { label: 'Abonnements', href: '/gym/subscriptions', icon: CreditCard },
  { label: 'Formules', href: '/gym/plans', icon: CalendarCheck },
  { label: 'Présence', href: '/gym/attendance', icon: CalendarCheck },
  { label: 'Paramètres', href: '/gym/settings', icon: Settings },
];

export default function GymLayout({ children }: { children: React.ReactNode }) {
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
        <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display text-xl text-[#F8F8F2] tracking-wider">
              {selectedOrg?.name || 'GYM'}
            </div>
            <div className="text-xs text-[#9CA3AF]">{selectedOrg?.businessType}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {GYM_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/gym/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-[#F97316]/10 text-[#F97316] border-l-2 border-[#F97316]'
                  : 'text-[#9CA3AF] hover:bg-[#1C1C27] hover:text-[#F8F8F2]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        {!collapsed && (
          <div className="text-xs text-[#9CA3AF] px-3 mb-2 truncate">{account.email}</div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition"
        >
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
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-white/5 text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27] transition"
        >
          {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <ChevronLeft className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] bg-[#111118] border-r border-white/5 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF]">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#111118] border-b border-white/5 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[#9CA3AF]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-[#9CA3AF]">
            {account.fullName || account.email}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
