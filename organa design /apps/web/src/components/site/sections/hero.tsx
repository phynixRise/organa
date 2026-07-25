import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Wallet,
  Building2,
  Coffee,
  Dumbbell,
  ShoppingBag,
  BedDouble,
  UtensilsCrossed,
  HeartPulse,
  Plus,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/site/logo";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 lg:pt-36 pb-16 lg:pb-24"
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-teal-soft/50 via-background to-background dark:from-brand-teal-soft/15" />
      <div className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-brand-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-40 -left-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-teal/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Left column */}
          <div className="text-center lg:text-left">
            <Link
              href="#verticals"
              className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 px-3.5 py-1.5 text-xs font-medium text-brand-teal dark:text-brand-cyan transition-all hover:border-brand-cyan/50 hover:shadow-glow-cyan"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Built for Tunisia · Paid in TND
              <ArrowRight className="h-3 w-3" />
            </Link>

            <h1 className="mt-6 font-display text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight">
              One platform for
              <br className="hidden sm:block" />{" "}
              <span className="text-gradient-brand">every business</span> you run.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Organa is a single subscription that runs café, restaurant,
              boutique, gym, hotel, property &amp; rentals, cabinet médical and
              tienda — each with the tools it actually needs, all under one
              login. No more eight apps, eight logins, eight bills.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 bg-brand-teal hover:bg-brand-teal/90 text-white shadow-brand-lg text-base"
              >
                <Link href="#get-started">
                  Start free for 14 days
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6 border-border bg-background/60 backdrop-blur text-base"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            {/* mini trust row */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
                No card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
                Cancel anytime
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
                FR · AR · EN
              </span>
            </div>

            {/* built for row — targeting, not a customer claim that doesn't exist yet */}
            <div className="mt-10 pt-6 border-t border-border/70">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-center lg:text-left">
                Built for owners across Tunisia
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2">
                {["Sidi Bou Said", "La Marsa", "Tunis", "Ariana", "Sfax"].map(
                  (city, i) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === 0 ? "bg-brand-cyan" : "bg-brand-teal/60"
                        }`}
                      />
                      {city}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right column: product mockup */}
          <div className="relative">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* floating accent cards */}
      <div className="absolute -top-6 -left-4 lg:-left-10 z-20 hidden sm:block animate-float-slow">
        <div className="rounded-2xl border border-border bg-background/95 backdrop-blur shadow-brand-lg p-3 pr-4 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal/10 text-brand-teal">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-none">
              Today&apos;s sales
            </p>
            <p className="text-sm font-bold leading-tight mt-0.5">
              1,284.500 <span className="text-muted-foreground font-medium text-xs">TND</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> 12%
          </span>
        </div>
      </div>

      <div
        className="absolute -bottom-5 -right-3 lg:-right-8 z-20 hidden sm:block animate-float-slow"
        style={{ animationDelay: "1.4s" }}
      >
        <div className="rounded-2xl border border-border bg-background/95 backdrop-blur shadow-brand-lg p-3 pr-4 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-cyan/10 text-brand-cyan">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-none">
              Tenant isolation
            </p>
            <p className="text-sm font-bold leading-tight mt-0.5">RLS secured</p>
          </div>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* main dashboard card */}
      <div className="relative rounded-[1.75rem] border border-border bg-card/95 backdrop-blur-xl shadow-brand-lg overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-muted/40">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-full bg-background border border-border px-3 py-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
            organa.app / boutique-atelier
          </div>
          <div className="ml-auto h-6 w-6 rounded-full bg-brand-teal/15" />
        </div>

        {/* body */}
        <div className="p-5 space-y-4">
          {/* org switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandMark size={32} />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold leading-none">
                    Atelier Boutique
                  </p>
                  <span className="rounded-md bg-brand-cyan-soft/70 dark:bg-brand-cyan-soft/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-teal dark:text-brand-cyan">
                    Boutique
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tunis · 3 staff online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              Switch org
            </div>
          </div>

          {/* stat row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Orders", value: "248" },
              { label: "Items", value: "612" },
              { label: "Avg basket", value: "42.3" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-background/60 p-2.5"
              >
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-base font-bold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* puzzle tile grid */}
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Your businesses
              </p>
              <span className="text-[10px] font-semibold text-brand-teal dark:text-brand-cyan">
                4 / 8 active
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <PuzzleTile
                icon={<Coffee className="h-4 w-4" />}
                label="Café"
                tone="cyan"
                active
              />
              <PuzzleTile
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Boutique"
                tone="teal"
                active
              />
              <PuzzleTile
                icon={<Dumbbell className="h-4 w-4" />}
                label="Gym"
                tone="deep"
                active
              />
              <PuzzleTile
                icon={<Building2 className="h-4 w-4" />}
                label="Property"
                tone="teal"
                active
              />
              <PuzzleTile
                icon={<BedDouble className="h-4 w-4" />}
                label="Hotel"
                tone="cyan"
              />
              <PuzzleTile
                icon={<UtensilsCrossed className="h-4 w-4" />}
                label="Resto"
                tone="deep"
              />
              <PuzzleTile
                icon={<HeartPulse className="h-4 w-4" />}
                label="Cabinet"
                tone="teal"
              />
              <PuzzleTile
                icon={<Plus className="h-4 w-4" />}
                label="Add"
                tone="muted"
              />
            </div>
          </div>

          {/* mini chart */}
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                Sales · last 7 days
              </p>
              <span className="text-[11px] font-semibold text-brand-teal">
                +18.4%
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {[40, 55, 48, 70, 62, 85, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-brand-teal to-brand-cyan"
                  style={{ height: `${h}%`, opacity: 0.55 + i * 0.06 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* glow under card */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 h-24 w-3/4 rounded-full bg-brand-cyan/30 blur-3xl -z-10" />
    </div>
  );
}

function PuzzleTile({
  icon,
  label,
  tone,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "teal" | "cyan" | "deep" | "muted";
  active?: boolean;
}) {
  const toneClass = {
    teal: "bg-brand-teal/10 text-brand-teal",
    cyan: "bg-brand-cyan/15 text-brand-cyan",
    deep: "bg-brand-teal/5 text-muted-foreground",
    muted: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <div
      className={`group relative rounded-lg border ${
        active ? "border-brand-cyan/40" : "border-dashed border-border"
      } p-2 flex flex-col items-center gap-1.5 bg-background`}
    >
      <div
        className={`grid h-7 w-7 place-items-center rounded-md ${toneClass}`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium text-foreground/80">{label}</span>
    </div>
  );
}
