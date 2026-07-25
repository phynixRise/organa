import * as React from "react";
import {
  ShieldCheck,
  Lock,
  ServerCog,
  FileCheck2,
} from "lucide-react";
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/site/scroll-reveal";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Row-level security",
    body: "Every query scoped by organization. A bug in one tenant can never leak to another.",
  },
  {
    icon: Lock,
    title: "Audit log",
    body: "Every meaningful action recorded — orders, refunds, role changes, exports.",
  },
  {
    icon: ServerCog,
    title: "Europe-hosted",
    body: "Low latency for Tunisia. Backups with point-in-time recovery on the roadmap.",
  },
  {
    icon: FileCheck2,
    title: "INPDP-aligned",
    body: "Built for Tunisia's data protection authority requirements from day one.",
  },
];

export function Security() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mb-14">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Your data stays sealed.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Trust is the whole product. Isolation and accountability are the foundation, not features bolted on.
            </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </section>
  );
}
