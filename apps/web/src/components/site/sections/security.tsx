import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Bell,
  FileCheck2,
  KeyRound,
  ServerCog,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/site/scroll-reveal";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Row-level security",
    body: "Every query is scoped by organization at the database level. A bug in one tenant can never leak data to another — the database refuses, not just the app.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    body: "Owner, org admin and staff — each sees exactly what they should. Sensitive records (patient data) get additional column-level access checks.",
  },
  {
    icon: Database,
    title: "Tenant isolation",
    body: "One shared database, strictly partitioned. Super admin operates through a separate role that bypasses RLS only when explicitly required.",
  },
  {
    icon: Lock,
    title: "Audit log",
    body: "Every meaningful action is recorded for accountability — orders, refunds, role changes, exports. You always know who did what and when.",
  },
  {
    icon: ServerCog,
    title: "Europe-hosted",
    body: "Hosted in a European region to keep latency low for Tunisia. Data residency options and backups with point-in-time recovery are on the roadmap.",
  },
  {
    icon: FileCheck2,
    title: "INPDP-aligned",
    body: "Tunisia's data protection authority requires declaration for personal-data processing — Organa is built with that in mind from day one, not bolted on.",
  },
];

export function Security() {
  return (
    <section
      id="security"
      className="relative py-20 lg:py-28 bg-muted/30 border-y border-border overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-80 w-80 rounded-full bg-brand-teal/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Left: heading + compliance card */}
          <ScrollReveal className="lg:sticky lg:top-28">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              Security &amp; trust
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Your tenants&apos; data stays sealed.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Trust is the whole product. Organa is built so that isolation,
              access control and accountability are not features bolted on —
              they are the foundation every table sits on.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-brand">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-teal text-white shadow-brand">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Grace period, not silent cutoff
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unpaid subscriptions warn over WhatsApp before suspension.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { day: "D-3", tone: "amber" },
                  { day: "D-1", tone: "orange" },
                  { day: "D-day", tone: "red" },
                ].map((d) => (
                  <div
                    key={d.day}
                    className="rounded-lg border border-border bg-background/60 px-2 py-2"
                  >
                    <p className="text-xs font-bold">{d.day}</p>
                    <p className="text-[10px] text-muted-foreground">WhatsApp</p>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="#get-started"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-teal dark:text-brand-cyan hover:gap-2 transition-all"
            >
              Read the security overview
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </ScrollReveal>

          {/* Right: pillars grid */}
          <ScrollRevealGroup className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <ScrollRevealItem
                key={p.title}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-brand-cyan/40 hover:shadow-brand transition-all"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-teal/10 text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15 group-hover:scale-105 transition-transform">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display text-base font-bold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {p.body}
                </p>
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>
        </div>
      </div>
    </section>
  );
}
