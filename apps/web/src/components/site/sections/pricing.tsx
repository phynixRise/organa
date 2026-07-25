"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/components/site/nav-config";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { cn } from "@/lib/utils";

const ANNUAL_DISCOUNT = 0.2; // 20% off when paying annually

export function Pricing() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <section
      id="pricing"
      className="py-20 lg:py-28 bg-muted/30 border-y border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              Pricing
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              One subscription. Every business you run.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Priced in TND. No setup fees, no per-vertical charges, no card
              required to start. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        {/* Billing toggle */}
        <ScrollReveal delay={0.05}>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                !annual ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual((v) => !v)}
              className={cn(
                "relative h-8 w-16 rounded-full border transition-colors",
                annual
                  ? "bg-brand-teal border-brand-teal"
                  : "bg-muted border-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all",
                  annual ? "left-9" : "left-1",
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                annual ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Annual
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                −20%
              </span>
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 grid gap-6 lg:grid-cols-3 items-stretch">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} annual={annual} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            All plans include Konnect checkout (TND), row-level security, FR · AR
            · EN interface and WhatsApp receipts. Prices exclude local VAT.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  annual,
}: {
  plan: (typeof PLANS)[number];
  annual: boolean;
}) {
  const highlighted = plan.highlighted;
  const isCustom = plan.price === "Sur devis";

  // numeric price → apply annual discount
  const basePrice = isCustom ? null : parseInt(plan.price, 10);
  const displayPrice =
    basePrice === null
      ? null
      : annual
        ? Math.round(basePrice * (1 - ANNUAL_DISCOUNT))
        : basePrice;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border p-6 sm:p-8 transition-all",
        highlighted
          ? "border-brand-teal/40 bg-card shadow-brand-lg lg:-translate-y-3"
          : "border-border bg-card hover:border-brand-cyan/40",
      )}
    >
      {highlighted && (
        <>
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-brand-teal via-brand-cyan to-brand-teal" />
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <Badge className="rounded-full bg-brand-teal text-white px-3 py-1 gap-1 shadow-brand">
              <Sparkles className="h-3 w-3" />
              {plan.badge}
            </Badge>
          </div>
        </>
      )}

      <div className="mt-2">
        <h3 className="font-display text-xl font-bold tracking-tight">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        {displayPrice === null ? (
          <span className="font-display text-4xl font-extrabold tracking-tight">
            Custom
          </span>
        ) : (
          <>
            <span className="font-display text-5xl font-extrabold tracking-tight text-gradient-brand">
              {displayPrice}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              TND / month
            </span>
          </>
        )}
      </div>
      <p className="mt-1 h-5 text-xs text-muted-foreground">
        {displayPrice !== null && annual
          ? `Billed annually · ${displayPrice * 12} TND / year`
          : displayPrice !== null && !annual
            ? "Billed monthly · cancel anytime"
            : "Tailored to your operation"}
      </p>

      <Link
        href="/signup"
        className={cn(
          "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors",
          highlighted
            ? "bg-brand-teal hover:bg-brand-teal/90 text-white shadow-brand"
            : "border border-border bg-background hover:border-brand-teal/50 hover:text-brand-teal",
        )}
      >
        {plan.cta}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <ul className="mt-7 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full",
                highlighted
                  ? "bg-brand-cyan/20 text-brand-cyan"
                  : "bg-brand-teal/10 text-brand-teal dark:bg-brand-cyan/15 dark:text-brand-cyan",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/85">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
