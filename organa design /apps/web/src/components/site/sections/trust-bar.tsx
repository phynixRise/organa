"use client";

import * as React from "react";
import { Building2, Users, ShieldCheck, Wallet, Sparkles } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { ScrollReveal } from "@/components/site/scroll-reveal";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  display?: string; // for non-numeric stats
  label: string;
  sub: string;
};

const STATS: Stat[] = [
  { value: 8, label: "Business verticals", sub: "one login" },
  { value: 12, label: "Modules", sub: "composable" },
  { value: 0, display: "TND", label: "Native currency", sub: "via Konnect" },
  { value: 3, label: "Languages", sub: "FR · AR · EN" },
];

export function TrustBar() {
  return (
    <section className="relative py-10 lg:py-14 border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center lg:text-left ${
                  i !== 0 ? "lg:border-l lg:border-border lg:pl-6" : ""
                }`}
              >
                <p className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient-brand">
                  {s.display ? (
                    s.display
                  ) : (
                    <CountUp value={s.value} suffix={s.suffix} prefix={s.prefix} />
                  )}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {[
              { icon: Building2, label: "Multi-tenant by design" },
              { icon: Users, label: "Roles & memberships" },
              { icon: ShieldCheck, label: "Row-level security" },
              { icon: Wallet, label: "Konnect · e-Dinar · local cards" },
              { icon: Sparkles, label: "Offline-tolerant POS" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 hover:border-brand-cyan/40 hover:text-brand-teal dark:hover:text-brand-cyan transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-brand-cyan" />
                {label}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function CountUp({
  value,
  suffix,
  prefix,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, display } = useCountUp(value);
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
