"use client";

import * as React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Send, ArrowRight } from "lucide-react";
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
                { icon: Github, href: "https://github.com/phynixRise/organa", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-brand-teal hover:border-brand-teal/40 hover:bg-brand-teal-soft/60 dark:hover:bg-brand-teal-soft/20 transition-colors"
                >
                  <Icon className="h-4 w-4" />
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
              href="#get-started"
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
