import * as React from "react";
import { X, Check, ArrowRight, Layers, Clock, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/site/scroll-reveal";

const OLD_WAY = [
  "A separate POS app for each business type",
  "Excel + WhatsApp to track inventory and rent",
  "Cash or bank transfer, manual reconciliation",
  "A different login and bill per tool",
  "Receipts in paper or photo only",
  "Manual reminders for renewals and overdue rent",
];

const ORGANA_WAY = [
  "One subscription, every vertical, one login",
  "Live inventory, units and leases synced on every sale",
  "Konnect checkout in TND, reconciled automatically",
  "A single bill — switch businesses like Slack workspaces",
  "WhatsApp receipts sent the moment you ring up",
  "Automated WhatsApp reminders before anything lapses",
];

export function Comparison() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              The difference
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              The old way versus Organa.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Most Tunisian owners run a patchwork of tools that don&apos;t talk
              to each other. Organa replaces all of it with one subscription.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Old way */}
          <ScrollReveal delay={0.05}>
            <div className="relative h-full rounded-3xl border border-border bg-muted/40 p-6 sm:p-8 overflow-hidden">
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-red-500/5 blur-3xl" />
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground border border-border">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Before
                  </p>
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    The old way
                  </h3>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {OLD_WAY.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-500">
                      <X className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="line-through decoration-muted-foreground/40">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total tools</span>
                <span className="font-semibold text-red-500">5–8 apps</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Organa way */}
          <ScrollReveal delay={0.12}>
            <div className="relative h-full rounded-3xl border border-brand-teal/40 bg-card p-6 sm:p-8 shadow-brand-lg overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-teal via-brand-cyan to-brand-teal" />
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-cyan/15 blur-3xl" />
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-teal text-white shadow-brand">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal dark:text-brand-cyan">
                    After
                  </p>
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    With Organa
                  </h3>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {ORGANA_WAY.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-teal/12 text-brand-teal dark:bg-brand-cyan/20 dark:text-brand-cyan">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total tools</span>
                <span className="font-semibold text-brand-teal dark:text-brand-cyan">
                  1 subscription
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* savings strip */}
        <ScrollRevealGroup className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Wallet, stat: "−63%", label: "Fewer tools to pay for" },
            { icon: Clock, stat: "−8h", label: "Saved per week on admin" },
            { icon: Check, stat: "100%", label: "Reconciled in TND" },
          ].map((s) => (
            <ScrollRevealItem
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-teal/10 text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-gradient-brand">
                  {s.stat}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
