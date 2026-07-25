"use client";

import * as React from "react";
import Link from "next/link";
import { Send, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "#platform" },
      { label: "Verticals", href: "#verticals" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Verticals",
    links: [
      { label: "Café", href: "#verticals" },
      { label: "Restaurant", href: "#verticals" },
      { label: "Boutique", href: "#verticals" },
      { label: "Gym", href: "#verticals" },
      { label: "Cabinet médical", href: "#verticals" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Press kit", href: "#press" },
      { label: "Contact", href: "#contact" },
      { label: "Status", href: "#status" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "API reference", href: "#api" },
      { label: "Changelog", href: "#changelog" },
      { label: "Community", href: "#community" },
      { label: "Support", href: "#support" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail("");
    window.setTimeout(() => setSent(false), 3200);
  };

  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-background to-brand-teal-soft/40 dark:to-brand-teal-soft/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter strip */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 py-12 lg:py-16 border-b border-border">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Get Organa updates, the Tunisian way.
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              New verticals, Konnect payment tips, and product news — once a
              month, no spam. We respect your inbox like we respect the Dinar.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <form
              onSubmit={onSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <div className="relative flex-1">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.tn"
                  className="h-12 rounded-full pl-5 pr-5 bg-background border-border"
                  aria-label="Email address"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-full px-6 bg-brand-teal hover:bg-brand-teal/90 text-white shadow-brand"
              >
                {sent ? "Subscribed ✓" : "Subscribe"}
                {!sent && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              By subscribing you agree to our privacy policy.
            </p>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid gap-10 lg:gap-12 py-12 lg:py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <BrandLogo size={34} />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              One platform, rented to business owners. Run café, restaurant,
              boutique, gym, cabinet médical and tienda from a single login.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: "https://github.com/phynixRise/organa", label: "GitHub", path: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" },
                { href: "#", label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { href: "#", label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              ].map(({ href, label, path }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-brand-teal hover:border-brand-teal/40 hover:bg-brand-teal-soft/60 dark:hover:bg-brand-teal-soft/20 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={path} /></svg>
                </Link>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold tracking-wide text-foreground">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-brand-teal transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Organa. Made in Tunisia 🇹🇳 — prices in
            TND. INPDP declaration pending.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="#privacy" className="hover:text-brand-teal">
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-brand-teal">
              Terms
            </Link>
            <Link href="#dpa" className="hover:text-brand-teal">
              DPA
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 font-medium text-brand-teal hover:text-brand-cyan"
            >
              Get started
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
