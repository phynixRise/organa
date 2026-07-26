'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarDays,
  Settings,
  ListOrdered,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Bell,
  Plus,
  Home,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { useOrg } from '@/contexts/org-context';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/gym/dashboard' },
  { id: 'members', label: 'Members', icon: Users, href: '/gym/members' },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/gym/payments' },
  { id: 'attendance', label: 'Attendance', icon: CalendarDays, href: '/gym/attendance' },
  { id: 'plans', label: 'Plans', icon: ListOrdered, href: '/gym/plans' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/gym/settings' },
];

function MobileBottomNav({ pathname }: { pathname: string }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#111118] border-t border-white/5 flex items-center justify-around z-50">
        {mainItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all ${
                active ? 'text-[#F97316]' : 'text-[#6B7280]'
              }`}
            >
              <motion.div animate={{ y: active ? -2 : 0 }} transition={{ type: 'spring', stiffness: 400 }}>
                <item.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-[10px] leading-tight text-center">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-[#6B7280]"
        >
          <div className="w-6 h-6 flex flex-col items-center justify-center gap-1">
            <div className="w-1 h-1 rounded-full bg-current" />
            <div className="w-1 h-1 rounded-full bg-current" />
            <div className="w-1 h-1 rounded-full bg-current" />
          </div>
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-[#22222E] rounded-t-2xl z-50 p-4 pb-20"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="space-y-1">
                {moreItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 h-12 rounded-lg text-[#9CA3AF] hover:bg-[#1C1C27] transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => { setMoreOpen(false); logout(); router.push('/login'); }}
                  className="flex items-center gap-3 px-4 h-12 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { organization } = useOrganization();
  const router = useRouter();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-[#0A0A0F] border-r border-white/5 flex flex-col z-40"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="w-9 h-9 rounded-lg bg-[#F97316] flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-xl text-[#F8F8F2] tracking-wider"
          >
            {organization?.name || 'GymFlow'}
          </motion.span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 h-10 rounded-lg transition-all duration-150 ${
                active
                  ? 'bg-[#F97316]/10 text-[#F97316] border-l-[3px] border-l-[#F97316]'
                  : 'text-[#9CA3AF] hover:bg-[#1C1C27] hover:text-[#F8F8F2]'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-body truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[#F97316]">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="text-sm text-[#F8F8F2] truncate">{user?.fullName || user?.email?.split('@')[0]}</p>
              <p className="text-[11px] text-[#6B7280]">Owner</p>
            </motion.div>
          )}
        </div>

        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-sm"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-8 rounded-lg text-[#6B7280] hover:bg-[#1C1C27] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}

export default function GymLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && organization && organization.businessType !== 'gym') {
      router.push(`/${organization.businessType}/dashboard`);
    }
  }, [user, organization, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (authLoading || orgLoading || !user || !organization || organization.businessType !== 'gym') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const pageTitle = navItems.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="lg:ml-[240px] min-h-screen pb-20 lg:pb-0">
        <header
          className={`sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 transition-all duration-200 ${
            scrolled ? 'bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27] rounded-lg transition-colors">
              <Home className="w-4 h-4" /> Accueil
            </Link>
            <h1 className="font-display text-2xl lg:text-3xl text-[#F8F8F2]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#1C1C27] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <Link
              href="/gym/members/new"
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-[#C0560E] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[#F97316]">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden xl:block">
                <p className="text-sm text-[#F8F8F2]">{user?.fullName || user?.email?.split('@')[0]}</p>
                <p className="text-[11px] text-[#6B7280]">Owner</p>
              </div>
            </div>
          </div>
        </header>

        <motion.main
          className="px-4 lg:px-6 py-4 lg:py-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </div>

      <div className="lg:hidden">
        <MobileBottomNav pathname={pathname} />
      </div>
    </div>
  );
}
