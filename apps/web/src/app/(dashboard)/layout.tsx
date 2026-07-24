'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useOrg } from '@/contexts/org-context';
import OrgSwitcher from './org-switcher';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/', icon: '📊' },
  { label: 'Caisse', href: '/pos', icon: '💳' },
  { label: 'Ventes', href: '/orders', icon: '🛒' },
  { label: 'Articles', href: '/products', icon: '📦' },
  { label: 'Stock', href: '/inventory', icon: '📋' },
  { label: 'Clients', href: '/customers', icon: '👥' },
  { label: 'Rendez-vous', href: '/appointments', icon: '📅' },
  { label: 'Personnel', href: '/staff-shifts', icon: '💼' },
  { label: 'Emplacements', href: '/locations', icon: '📍' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { account, loading: authLoading, logout } = useAuth();
  const { selectedOrg, loading: orgLoading } = useOrg();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !account) {
      router.push('/login');
    }
  }, [authLoading, account, router]);

  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <span className="text-lg font-bold text-blue-700">Organa</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded text-sm"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={item.label}
              >
                <span className="text-base">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          {sidebarOpen && (
            <div className="text-xs text-gray-500 mb-2 truncate">{account.email}</div>
          )}
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            title="Se déconnecter"
          >
            {sidebarOpen ? 'Se déconnecter' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <OrgSwitcher />
          <div className="text-sm text-gray-500">
            {account.fullName || account.email}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
