import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VERTICALS, type Vertical } from "@/components/site/nav-config";
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/site/scroll-reveal";
import { cn } from "@/lib/utils";

export function BusinessVerticals() {
  return (
    <section
      id="verticals"
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 bg-dots opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute top-1/2 -left-40 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-teal/10 blur-3xl" />
      <div className="absolute top-1/4 -right-40 -z-10 h-96 w-96 rounded-full bg-brand-cyan/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              Verticals
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Every business gets the tools it needs.
              <span className="block text-muted-foreground">
                None gets the tools it doesn&apos;t.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each vertical below gets its own POS designed specifically for its
              workflow — not a generic template. Boutique and Café are live first;
              the rest are in active design.
            </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => (
            <ScrollRevealItem key={v.slug} className="h-full">
              <VerticalCard vertical={v} index={i} />
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 rounded-3xl border border-dashed border-brand-teal/30 bg-brand-teal-soft/40 dark:bg-brand-teal-soft/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold">
              Don&apos;t see your business type?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Organa is built to add new verticals without rebuilding the core.
              Tell us what you run and we&apos;ll prioritize it.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-brand-teal/40 text-brand-teal hover:bg-brand-teal hover:text-white shrink-0"
          >
            <Link href="#contact">
              Request a vertical
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function VerticalCard({
  vertical,
  index,
}: {
  vertical: Vertical;
  index: number;
}) {
  const accentClasses = {
    teal: {
      ring: "hover:border-brand-teal/50",
      glow: "group-hover:shadow-[0_24px_60px_-20px_rgba(0,95,107,0.35)]",
      chip: "bg-brand-teal/10 text-brand-teal",
      bar: "from-brand-teal to-brand-teal/30",
    },
    cyan: {
      ring: "hover:border-brand-cyan/50",
      glow: "group-hover:shadow-[0_24px_60px_-20px_rgba(0,180,216,0.4)]",
      chip: "bg-brand-cyan/15 text-brand-cyan",
      bar: "from-brand-cyan to-brand-cyan/30",
    },
    deep: {
      ring: "hover:border-brand-teal/50",
      glow: "group-hover:shadow-[0_24px_60px_-20px_rgba(0,95,107,0.4)]",
      chip: "bg-brand-teal/5 text-brand-teal",
      bar: "from-brand-teal via-brand-cyan to-brand-teal/30",
    },
  }[vertical.accent];

  const isEarly = vertical.status === "early";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1",
        accentClasses.ring,
        accentClasses.glow,
      )}
    >
      {/* top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
          accentClasses.bar,
        )}
      />

      <div className="flex items-start justify-between">
        <div
          className={cn(
            "grid h-14 w-14 place-items-center rounded-2xl text-2xl border border-border bg-background",
            accentClasses.chip,
          )}
        >
          <span aria-hidden>{vertical.emoji}</span>
        </div>
        {isEarly ? (
          <Badge
            variant="outline"
            className="rounded-full border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Early access
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="rounded-full border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 gap-1"
          >
            <Clock className="h-3 w-3" />
            Coming soon
          </Badge>
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-display text-xl font-bold tracking-tight">
            {vertical.name}
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            · {vertical.french}
          </span>
        </div>
        <p className="mt-0.5 text-sm font-medium text-brand-teal dark:text-brand-cyan">
          {vertical.tagline}
        </p>
      </div>

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {vertical.description}
      </p>

      <ul className="mt-5 space-y-2">
        {vertical.modules.map((m) => (
          <li
            key={m}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded-full",
                accentClasses.chip,
              )}
            >
              <Check className="h-2.5 w-2.5" />
            </span>
            {m}
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          /modules/{vertical.slug}
        </span>
        <Link
          href="#get-started"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-teal dark:text-brand-cyan hover:gap-2 transition-all"
        >
          {isEarly ? "Get access" : "Notify me"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <span className="absolute right-5 top-5 text-[10px] font-mono text-muted-foreground/40">
        0{index + 1}
      </span>
    </article>
  );
}
