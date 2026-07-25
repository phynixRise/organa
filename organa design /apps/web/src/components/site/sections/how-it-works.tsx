import * as React from "react";
import Link from "next/link";
import { UserPlus, Building2, Rocket, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/site/scroll-reveal";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create one account",
    body: "Sign up with email or WhatsApp. One Organa account is all you ever need — it owns every business you add to it.",
    detail: "Email · WhatsApp · passwordless",
  },
  {
    icon: Building2,
    step: "02",
    title: "Add your businesses",
    body: "Pick a type for each — café, boutique, gym… — and Organa turns on the modules that fit. Switch between them from the org switcher.",
    detail: "Org switcher · like Slack workspaces",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Run everything, one place",
    body: "Take orders, manage stock, schedule staff, send WhatsApp receipts and reconcile TND payments — all from the same dashboard.",
    detail: "POS · inventory · staff · payments",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              How it works
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              From sign-up to first sale in minutes.
            </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No long onboarding, no migration consultants, no per-vertical setup
            fee. Three steps, then you&apos;re ringing up sales.
          </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="mt-14 grid gap-6 lg:grid-cols-3 relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />

          {STEPS.map((s) => (
            <ScrollRevealItem key={s.step} className="h-full">
            <div
              className="relative h-full rounded-2xl border border-border bg-card p-6 lg:p-7 hover:shadow-brand transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-brand-teal text-white shadow-brand">
                  <s.icon className="h-5 w-5" />
                  <span className="absolute -inset-1 rounded-xl border border-brand-cyan/30" />
                </div>
                <span className="font-display text-5xl font-extrabold text-muted-foreground/15">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {s.body}
              </p>
              <p className="mt-4 text-xs font-medium text-brand-teal dark:text-brand-cyan font-mono">
                {s.detail}
              </p>
            </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#get-started"
            className="inline-flex items-center gap-2 rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white px-6 py-3 text-sm font-semibold shadow-brand-lg transition-colors"
          >
            Start free for 14 days
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:border-brand-cyan/50 transition-colors"
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
