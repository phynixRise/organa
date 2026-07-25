"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { NAV_LINKS } from "@/components/site/nav-config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useActiveSection } from "@/hooks/use-active-section";
import { useAuth } from "@/contexts/auth-context";
import { useOrg } from "@/contexts/org-context";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { account, logout } = useAuth();
  const { orgs, selectOrg } = useOrg();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [showOrgs, setShowOrgs] = React.useState(false);
  const sectionIds = React.useMemo(
    () => NAV_LINKS.map((l) => l.href.replace("#", "")),
    [],
  );
  const active = useActiveSection(sectionIds);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/70 shadow-[0_8px_30px_-12px_rgba(0,95,107,0.18)]"
          : "bg-background border-b border-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-18 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Organa home"
          >
            <BrandLogo size={34} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href.replace("#", "");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-brand-teal dark:text-brand-cyan"
                      : "text-muted-foreground hover:text-foreground",
                    "hover:bg-brand-teal-soft/50 dark:hover:bg-brand-teal-soft/20",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-teal to-brand-cyan"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center gap-1 mr-1 text-xs font-medium text-muted-foreground border border-border rounded-full px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
              FR · AR
            </div>
            <ThemeToggle />

            {account ? (
              /* Logged in: org switcher + user + logout */
              <>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOrgs(!showOrgs)}
                    className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {orgs.length > 0 ? `${orgs.length} entreprise${orgs.length > 1 ? 's' : ''}` : 'Mes entreprises'}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showOrgs && "rotate-180")} />
                  </Button>
                  {showOrgs && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-lg p-2 z-50">
                      {orgs.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Aucune entreprise</div>
                      ) : orgs.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => { selectOrg(org, true); setShowOrgs(false); }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-brand-teal-soft/50 dark:hover:bg-brand-teal-soft/20 transition flex items-center gap-2"
                        >
                          <span className="font-medium truncate">{org.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto capitalize">{org.businessType}</span>
                        </button>
                      ))}
                      <div className="my-1 h-px bg-border" />
                      <Link
                        href="/"
                        onClick={() => setShowOrgs(false)}
                        className="block px-3 py-2 text-sm text-brand-teal dark:text-brand-cyan hover:bg-brand-teal-soft/50 dark:hover:bg-brand-teal-soft/20 rounded-lg transition"
                      >
                        Gérer mes entreprises
                      </Link>
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline text-sm text-muted-foreground">{account.fullName || account.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:inline-flex text-sm text-red-500 hover:text-red-500 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              /* Logged out: Sign in + Get started */
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:inline-flex bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full shadow-brand"
                >
                  <Link href="/signup">
                    Get started
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-full"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] max-w-sm p-0 border-l-0"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-full flex-col">
                  <div className="flex h-16 items-center justify-between px-5 border-b border-border">
                    <BrandLogo size={30} />
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label="Close menu"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex-1 overflow-y-auto scrollbar-slim px-3 py-4">
                    <div className="space-y-1">
                      {NAV_LINKS.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link
                            href={link.href}
                            className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-brand-teal-soft/60 dark:hover:bg-brand-teal-soft/20"
                          >
                            {link.label}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </SheetClose>
                      ))}
                    </div>

                    <div className="my-4 h-px bg-border" />

                    <div className="space-y-2 px-2">
                      {account ? (
                        <>
                          <div className="px-3 py-2 text-sm font-medium">{account.fullName || account.email}</div>
                          <div className="space-y-1">
                            {orgs.map((org) => (
                              <SheetClose asChild key={org.id}>
                                <button
                                  onClick={() => selectOrg(org, true)}
                                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-brand-teal-soft/50 dark:hover:bg-brand-teal-soft/20 transition"
                                >
                                  {org.name}
                                </button>
                              </SheetClose>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full rounded-full text-red-500 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => { logout(); setOpen(false); }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Déconnexion
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full rounded-full"
                          >
                            <Link href="/login">Sign in</Link>
                          </Button>
                          <Button
                            asChild
                            className="w-full rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white"
                          >
                            <Link href="/signup">
                              Get started
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="mt-6 px-4 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Langue</p>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full border border-brand-cyan/40 bg-brand-cyan-soft/60 px-3 py-1 text-xs font-semibold text-brand-teal">
                          Français
                        </span>
                        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                          العربية
                        </span>
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
